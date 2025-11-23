import React from 'react';
import { Settings, Shield, FileText, Code, BookOpen } from 'lucide-react';
import { ProcessingConfig } from '../types';

interface ConfigPanelProps {
  config: ProcessingConfig;
  setConfig: React.Dispatch<React.SetStateAction<ProcessingConfig>>;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig }) => {
  const handleChange = (key: keyof ProcessingConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-slate-800 font-semibold border-b border-slate-100 pb-3">
        <Settings size={20} className="text-blue-600" />
        Processing Configuration
      </div>

      <div className="space-y-4">
        {/* Output Format */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                Output Format
            </label>
            <div className="grid grid-cols-1 gap-2">
            <button
                onClick={() => handleChange('format', 'notebooklm')}
                className={`flex items-center justify-start gap-3 p-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                config.format === 'notebooklm'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
                <div className={`p-2 rounded-full ${config.format === 'notebooklm' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                    <BookOpen size={18} />
                </div>
                <div>
                    <span className="block font-bold">NotebookLM Optimized</span>
                    <span className="text-xs font-normal opacity-80">Transcript style, grouped messages, Markdown headers. Best for "Podcast" generation.</span>
                </div>
            </button>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => handleChange('format', 'text')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                    config.format === 'text'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <FileText size={16} />
                    Plain Text
                </button>
                <button
                    onClick={() => handleChange('format', 'json')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                    config.format === 'json'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Code size={16} />
                    JSON Lines
                </button>
            </div>
            </div>
        </div>

        {/* Chunk Size */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Chunk Size (Characters)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1000"
              max="200000"
              step="1000"
              value={config.chunkSize}
              onChange={(e) => handleChange('chunkSize', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-sm font-mono bg-slate-100 px-3 py-1 rounded text-slate-600 min-w-[80px] text-center">
              {config.chunkSize.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            NotebookLM supports large contexts (~500k words). You can increase this significantly for file uploads.
          </p>
        </div>

        {/* Anonymization Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-indigo-500" />
            <div>
              <p className="text-sm font-medium text-slate-700">Anonymize Users</p>
              <p className="text-xs text-slate-500">Replace names with "User 1"</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.anonymizeUsers}
              onChange={(e) => handleChange('anonymizeUsers', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

      </div>
    </div>
  );
};