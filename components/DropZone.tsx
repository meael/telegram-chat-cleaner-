import React, { useCallback, useState } from 'react';
import { Upload, FileJson, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFileLoaded: (data: any, fileName: string) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    setError(null);
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('Please upload a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.messages && !Array.isArray(json.messages)) {
          throw new Error("Invalid Telegram export format. Could not find 'messages' array.");
        }
        onFileLoaded(json, file.name);
      } catch (err) {
        setError('Error parsing JSON. ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [onFileLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full p-10 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out cursor-pointer
        flex flex-col items-center justify-center text-center group
        ${isDragging 
          ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
          : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50'
        }
      `}
    >
      <input
        type="file"
        accept=".json"
        className="hidden"
        id="fileInput"
        onChange={handleInputChange}
      />
      <label htmlFor="fileInput" className="cursor-pointer w-full h-full flex flex-col items-center">
        <div className={`
          p-4 rounded-full mb-4 transition-colors
          ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-50'}
        `}>
          {error ? <AlertCircle size={32} className="text-red-500" /> : <Upload size={32} />}
        </div>
        
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          {isDragging ? 'Drop JSON file here' : 'Drag & drop result.json'}
        </h3>
        
        <p className="text-sm text-slate-500 max-w-sm">
          Upload your Telegram Data export file. The file is processed entirely in your browser.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </label>
    </div>
  );
};