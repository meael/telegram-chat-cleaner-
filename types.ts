export interface TelegramEntity {
  type: string;
  text: string;
}

export interface TelegramReaction {
  type: string;
  count: number;
  emoji: string;
  // We ignore 'recent' to strip PII
}

export interface TelegramMessage {
  id: number;
  type: string;
  date: string;
  date_unixtime: string;
  edited?: string;
  edited_unixtime?: string;
  from?: string;
  from_id?: string;
  text: string | Array<string | TelegramEntity>; // Telegram sometimes exports text as array
  reply_to_message_id?: number;
  text_entities?: TelegramEntity[];
  reactions?: TelegramReaction[];
  file?: string; // Media attachments
  photo?: string;
}

export interface TelegramExport {
  name?: string;
  type?: string;
  id?: number;
  messages: TelegramMessage[];
}

export interface ProcessedChunk {
  id: number;
  content: string;
  tokenEstimate: number;
  messageCount: number;
}

export interface ProcessingConfig {
  chunkSize: number; // In characters approx
  anonymizeUsers: boolean;
  removeSystemMessages: boolean;
  includeTimestamps: boolean;
  format: 'text' | 'json' | 'notebooklm';
}