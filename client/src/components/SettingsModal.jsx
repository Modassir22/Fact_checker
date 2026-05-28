import React, { useState, useEffect } from 'react';
import { X, Shield, Eye, EyeOff, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, config, onSave }) {
  const [geminiKey, setGeminiKey] = useState(config.geminiKey || '');
  const [tavilyKey, setTavilyKey] = useState(config.tavilyKey || '');
  const [validationError, setValidationError] = useState('');

  const [showGemini, setShowGemini] = useState(false);
  const [showTavily, setShowTavily] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Sync with prop when config changes
  useEffect(() => {
    setGeminiKey(config.geminiKey || '');
    setTavilyKey(config.tavilyKey || '');
    setValidationError('');
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Both keys are completely optional now. If they are omitted,
    // the system uses the default backend keys with a 2-sample limit.
    onSave({
      mode: 'live',
      geminiKey: geminiKey.trim(),
      tavilyKey: tavilyKey.trim()
    });

    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-all duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-[#863bff]" />
            <h2 className="text-sm font-extrabold text-black tracking-wide uppercase">Verification Configuration</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-black">
          
          {/* Key Notice */}
          <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex gap-3 text-xs text-neutral-600 leading-relaxed">
            <AlertCircle className="h-5 w-5 text-[#863bff] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-800 block mb-0.5">Real-Time Search & Verification</span>
              All claims extracted from uploaded files will be dynamically searched on the web. Adding your own custom keys executes checks on your personal quota. If left blank, you will use the server's default system keys (limited to 2 free sample tests).
            </div>
          </div>

          {/* Form Error Alert */}
          {validationError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs font-semibold leading-relaxed">
              {validationError}
            </div>
          )}

          {/* Key Inputs */}
          <div className="space-y-4">
            
            {/* Gemini API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 tracking-wider flex items-center gap-1.5">
                  Google Gemini API Key
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">(Optional)</span>
                </label>
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-[#863bff] hover:underline font-bold"
                >
                  Get Key
                </a>
              </div>
              <div className="relative">
                <input
                  type={showGemini ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 px-4 py-2.5 rounded-lg text-sm text-black placeholder-neutral-400 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Tavily Search API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 tracking-wider flex items-center gap-1.5">
                  Tavily Search API Key
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">(Optional)</span>
                </label>
                <a 
                  href="https://tavily.com/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-[#863bff] hover:underline font-bold"
                >
                  Get Key
                </a>
              </div>
              <div className="relative">
                <input
                  type={showTavily ? 'text' : 'password'}
                  value={tavilyKey}
                  onChange={(e) => setTavilyKey(e.target.value)}
                  placeholder="tvly-..."
                  className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 px-4 py-2.5 rounded-lg text-sm text-black placeholder-neutral-400 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowTavily(!showTavily)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                >
                  {showTavily ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

          </div>

          {/* Sticky Saved Success State Overlay */}
          {showSavedToast && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-2 animate-fadeIn z-50">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 animate-bounce" />
              <span className="text-sm font-bold text-black">Settings Saved Successfully</span>
              <span className="text-[11px] text-neutral-500">Updating active operational configurations...</span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4.5 py-2 rounded-lg text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg transition-all"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
