import React, { useState } from 'react';
import { Copy, Check, Download, ChevronRight, ChevronDown, FileText, FileArchive } from 'lucide-react';
import JSZip from 'jszip';
import { ProcessedChunk } from '../types';

interface ChunkListProps {
  chunks: ProcessedChunk[];
  fileName: string;
}

export const ChunkList: React.FC<ChunkListProps> = ({ chunks, fileName }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const cleanName = fileName.replace('.json', '');

  const handleCopy = async (id: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const downloadFile = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingle = (chunk: ProcessedChunk) => {
      const blob = new Blob([chunk.content], { type: 'text/plain' });
      downloadFile(blob, `${cleanName}_part_${chunk.id}.txt`);
  };

  const handleDownloadCombined = (type: 'json' | 'txt') => {
    let content = '';
    let mime = '';
    let ext = '';

    if (type === 'json') {
      content = JSON.stringify(chunks, null, 2);
      mime = 'application/json';
      ext = 'json';
    } else {
      // Join all chunks with a newline separator for a single document text file
      content = chunks.map(c => c.content).join('\n\n');
      mime = 'text/plain';
      ext = 'txt';
    }

    const blob = new Blob([content], { type: mime });
    downloadFile(blob, `${cleanName}_combined.${ext}`);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
        const zip = new JSZip();
        
        chunks.forEach((chunk) => {
            zip.file(`${cleanName}_part_${chunk.id}.txt`, chunk.content);
        });

        const content = await zip.generateAsync({ type: "blob" });
        downloadFile(content, `${cleanName}_chunks.zip`);
    } catch (error) {
        console.error("Error creating zip:", error);
        alert("Failed to create ZIP file.");
    } finally {
        setIsZipping(false);
    }
  };

  if (chunks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-slate-800">
          Generated Chunks <span className="text-slate-400 font-normal">({chunks.length})</span>
        </h3>
        
        <div className="flex gap-2 flex-wrap">
            {chunks.length > 1 && (
                <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="text-xs sm:text-sm flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                title="Download all chunks as separate files in a ZIP"
                >
                <FileArchive size={16} />
                {isZipping ? 'Zipping...' : 'Download ZIP'}
                </button>
            )}
            
            <button
            onClick={() => handleDownloadCombined('txt')}
            className={`text-xs sm:text-sm flex items-center gap-2 font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                chunks.length > 1 
                ? 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
            }`}
            title="Download all combined into one file"
            >
            <FileText size={16} />
            Download Combined
            </button>

            <button
            onClick={() => handleDownloadCombined('json')}
            className="text-xs sm:text-sm flex items-center gap-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
            <Download size={16} />
            JSON
            </button>
        </div>
      </div>

      <div className="grid gap-4">
        {chunks.map((chunk) => (
          <div
            key={chunk.id}
            className={`bg-white border rounded-xl transition-all duration-200 overflow-hidden ${
              expandedId === chunk.id ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-slate-200 shadow-sm hover:border-slate-300'
            }`}
          >
            <div 
                className="p-4 flex items-center justify-between cursor-pointer bg-white group"
                onClick={() => toggleExpand(chunk.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-1.5 rounded-md ${expandedId === chunk.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  {expandedId === chunk.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Chunk #{chunk.id}</h4>
                  <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                    <span>~{chunk.tokenEstimate} tokens</span>
                    <span>•</span>
                    <span>{chunk.messageCount} messages</span>
                    <span>•</span>
                    <span>{chunk.content.length.toLocaleString()} chars</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSingle(chunk);
                    }}
                    className="p-2 rounded-lg border bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all"
                    title="Download this chunk"
                >
                    <Download size={18} />
                </button>
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(chunk.id, chunk.content);
                    }}
                    className={`p-2 rounded-lg border transition-all ${
                    copiedId === chunk.id
                        ? 'bg-green-50 border-green-200 text-green-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200'
                    }`}
                    title="Copy content to clipboard"
                >
                    {copiedId === chunk.id ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {expandedId === chunk.id && (
              <div className="border-t border-slate-100 bg-slate-50 p-4">
                 <div className="relative">
                    <pre className="text-xs sm:text-sm font-mono text-slate-600 whitespace-pre-wrap break-words max-h-96 overflow-y-auto custom-scrollbar">
                      {chunk.content}
                    </pre>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};