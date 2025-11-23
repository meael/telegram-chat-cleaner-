import { TelegramExport, TelegramMessage, ProcessingConfig, ProcessedChunk } from '../types';

// Helper to normalize text which can sometimes be an array in Telegram exports
const normalizeText = (text: string | Array<any>): string => {
  if (typeof text === 'string') return text;
  if (Array.isArray(text)) {
    return text
      .map((item) => (typeof item === 'string' ? item : item.text))
      .join('');
  }
  return '';
};

// Generate a consistent anonymous ID for users
const createAnonymizer = () => {
  const userMap = new Map<string, string>();
  let counter = 1;

  return (fromId?: string, fromName?: string) => {
    if (!fromId && !fromName) return 'System';
    
    const key = fromId || fromName || 'unknown';
    
    if (!userMap.has(key)) {
      userMap.set(key, `User ${counter++}`);
    }
    return userMap.get(key) || 'User ?';
  };
};

export const processTelegramJson = (
  rawData: TelegramExport,
  config: ProcessingConfig
): ProcessedChunk[] => {
  const messages = rawData.messages || [];
  const getAnonName = createAnonymizer();
  
  // 1. Filter and Clean
  const filteredMessages = messages.filter((msg) => {
    if (config.removeSystemMessages && msg.type !== 'message') return false;
    const text = normalizeText(msg.text);
    if (!text && !msg.photo && !msg.file) return false;
    return true;
  });

  let processedLines: string[] = [];

  if (config.format === 'notebooklm') {
    // NotebookLM Logic: Group consecutive messages to create a "Transcript" style
    // This reduces token usage on repeated names and helps the model understand flow.
    let lastUser = '';
    let currentBlock = '';

    filteredMessages.forEach((msg, index) => {
      const text = normalizeText(msg.text) || '[Media Attachment]';
      const sender = config.anonymizeUsers
        ? getAnonName(msg.from_id, msg.from)
        : msg.from || 'Unknown';
      
      const isSameUser = sender === lastUser;
      
      // If same user, append to current block
      if (isSameUser) {
         currentBlock += `\n${text}`;
      } else {
         // Push previous block if exists
         if (currentBlock) processedLines.push(currentBlock + '\n');
         
         // Start new block
         const dateStr = config.includeTimestamps ? ` (${msg.date})` : '';
         // Markdown bold for speaker helps NotebookLM distinguish speakers
         currentBlock = `**${sender}**${dateStr}:\n${text}`;
         lastUser = sender;
      }

      // Push final block
      if (index === filteredMessages.length - 1 && currentBlock) {
        processedLines.push(currentBlock + '\n');
      }
    });

  } else {
    // Standard Logic (Text or JSON)
    processedLines = filteredMessages.map((msg) => {
      const text = normalizeText(msg.text);
      const sender = config.anonymizeUsers
        ? getAnonName(msg.from_id, msg.from)
        : msg.from || 'Unknown';

      const dateStr = config.includeTimestamps ? `[${msg.date}] ` : '';
      const replyStr = msg.reply_to_message_id ? ` (Replying to msg ${msg.reply_to_message_id})` : '';

      if (config.format === 'json') {
        return JSON.stringify({
          id: msg.id,
          date: config.includeTimestamps ? msg.date : undefined,
          user: sender,
          reply_to: msg.reply_to_message_id,
          content: text || '[Media Attachment]',
        });
      } else {
        return `${dateStr}${sender}${replyStr}: ${text || '[Media Attachment]'}`;
      }
    });
  }

  // 2. Chunking
  const chunks: ProcessedChunk[] = [];
  let currentChunkContent = '';
  let currentChunkMsgCount = 0;
  let chunkId = 1;

  for (const line of processedLines) {
    // Crude token estimation
    if ((currentChunkContent.length + line.length) > config.chunkSize && currentChunkContent.length > 0) {
      chunks.push({
        id: chunkId++,
        content: currentChunkContent.trim(),
        tokenEstimate: Math.ceil(currentChunkContent.length / 3.5),
        messageCount: currentChunkMsgCount,
      });
      currentChunkContent = '';
      currentChunkMsgCount = 0;
    }

    currentChunkContent += line + '\n';
    currentChunkMsgCount++;
  }

  if (currentChunkContent.length > 0) {
    chunks.push({
      id: chunkId++,
      content: currentChunkContent.trim(),
      tokenEstimate: Math.ceil(currentChunkContent.length / 3.5),
      messageCount: currentChunkMsgCount,
    });
  }

  return chunks;
};