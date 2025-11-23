import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Zap, Trash2 } from 'lucide-react';
import { DropZone } from './components/DropZone';
import { ConfigPanel } from './components/ConfigPanel';
import { ChunkList } from './components/ChunkList';
import { processTelegramJson } from './services/processor';
import { ProcessingConfig, ProcessedChunk, TelegramExport } from './types';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<TelegramExport | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [chunks, setChunks] = useState<ProcessedChunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [config, setConfig] = useState<ProcessingConfig>({
    chunkSize: 50000, // Larger default for NotebookLM
    anonymizeUsers: true,
    removeSystemMessages: true,
    includeTimestamps: true,
    format: 'notebooklm',
  });

  const handleFileLoaded = (data: TelegramExport, name: string) => {
    setFileData(data);
    setFileName(name);
  };

  const handleReset = () => {
    setFileData(null);
    setFileName(null);
    setChunks([]);
  };

  useEffect(() => {
    if (fileData) {
      setIsProcessing(true);
      // Small timeout to allow UI to render "Processing" state before blocking main thread with heavy calculation
      const timer = setTimeout(() => {
        const result = processTelegramJson(fileData, config);
        setChunks(result);
        setIsProcessing(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [fileData, config]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 mb-6">
            <MessageSquare className="text-white h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Telegram Chat <span className="text-blue-600">Cleaner</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Prepare your Telegram history for NotebookLM and LLMs. Anonymize data and convert JSON to optimized text formats locally in your browser.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          
          {!fileData ? (
             <DropZone onFileLoaded={handleFileLoaded} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Config & Status */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* File Status Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active File</p>
                     <p className="text-sm font-semibold text-slate-800 truncate max-w-[150px]" title={fileName || ''}>{fileName}</p>
                     <p className="text-xs text-slate-500 mt-1">{fileData.messages?.length.toLocaleString()} messages</p>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <ConfigPanel config={config} setConfig={setConfig} />

                {/* Info Card */}
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex items-start gap-3">
                        <Zap className="text-indigo-600 mt-1 shrink-0" size={18} />
                        <div>
                            <h4 className="text-sm font-semibold text-indigo-800">For NotebookLM</h4>
                            <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                                Use <b>Download ZIP</b> to get separate files for each chunk, then upload them all to NotebookLM. This ensures you stay within the context limits for each source.
                            </p>
                        </div>
                    </div>
                </div>
              </div>

              {/* Right Column: Output */}
              <div className="lg:col-span-2">
                 {isProcessing ? (
                   <div className="flex flex-col items-center justify-center h-64 space-y-4">
                     <RefreshCw className="animate-spin text-blue-600" size={32} />
                     <p className="text-slate-500 font-medium">Processing your chat history...</p>
                   </div>
                 ) : (
                   <ChunkList chunks={chunks} fileName={fileName || 'export'} />
                 )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center border-t border-slate-200 pt-8">
           <p className="text-slate-400 text-sm">
             Privacy Note: All processing happens locally in your browser. Your data is never uploaded to any server.
           </p>
        </div>
      </div>
    </div>
  );
};

export default App;