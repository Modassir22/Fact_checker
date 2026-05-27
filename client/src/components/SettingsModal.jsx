import React, { useState, useEffect } from 'react';
import { X, Shield, Eye, EyeOff, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, config, onSave }) {
  const [geminiKey, setGeminiKey] = useState(config.geminiKey || '');
  const [openaiKey, setOpenaiKey] = useState(config.openaiKey || '');
  const [tavilyKey, setTavilyKey] = useState(config.tavilyKey || '');
  const [validationError, setValidationError] = useState('');

  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showTavily, setShowTavily] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Sync with prop when config changes
  useEffect(() => {
    setGeminiKey(config.geminiKey || '');
    setOpenaiKey(config.openaiKey || '');
    setTavilyKey(config.tavilyKey || '');
    setValidationError('');
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!tavilyKey.trim()) {
      setValidationError('Tavily Search API Key is required for live web auditing.');
      return;
    }
    if (!geminiKey.trim() && !openaiKey.trim()) {
      setValidationError('A Google Gemini API Key or an OpenAI API Key is required.');
      return;
    }

    onSave({
      mode: 'live',
      geminiKey: geminiKey.trim(),
      openaiKey: openaiKey.trim(),
      tavilyKey: tavilyKey.trim()
    });

    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-primary-glow" />
            <h2 className="text-lg font-bold text-white tracking-wide">Verification Configuration</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Key Notice */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex gap-3 text-xs text-slate-400 leading-relaxed">
            <AlertCircle className="h-5 w-5 text-warning-glow shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300 block mb-0.5">Real-Time Search & Verification</span>
              All claims extracted from uploaded files will be dynamically searched on the web. A live **Tavily Search API Key** along with a **Gemini** or **OpenAI** API key is required.
            </div>
          </div>

          {/* Form Error Alert */}
          {validationError && (
            <div className="bg-danger/10 border border-danger/30 text-danger-glow p-3 rounded-lg text-xs font-semibold leading-relaxed">
              {validationError}
            </div>
          )}

          {/* Key Inputs */}
          <div className="space-y-4">
            
            {/* Gemini API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 tracking-wider">
                  Google Gemini API Key (Recommended)
                </label>
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-primary-glow hover:underline font-medium"
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
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700 px-4 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-650 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-3 text-slate-550 hover:text-slate-300"
                >
                  {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 tracking-wider">
                  OpenAI API Key (Fallback)
                </label>
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-primary-glow hover:underline font-medium"
                >
                  Get Key
                </a>
              </div>
              <div className="relative">
                <input
                  type={showOpenai ? 'text' : 'password'}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700 px-4 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-650 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenai(!showOpenai)}
                  className="absolute right-3 top-3 text-slate-550 hover:text-slate-300"
                >
                  {showOpenai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Tavily Search API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 tracking-wider flex items-center gap-1.5">
                  Tavily Search API Key
                  <span className="text-[10px] text-danger-glow font-bold uppercase tracking-wider">* Required</span>
                </label>
                <a 
                  href="https://tavily.com/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-primary-glow hover:underline font-medium"
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
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700 px-4 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-650 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowTavily(!showTavily)}
                  className="absolute right-3 top-3 text-slate-550 hover:text-slate-300"
                >
                  {showTavily ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

          </div>

          {/* Sticky Saved Success State Overlay */}
          {showSavedToast && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 animate-fadeIn z-50">
              <CheckCircle2 className="h-12 w-12 text-success-glow animate-bounce" />
              <span className="text-sm font-bold text-white">Settings Saved Successfully</span>
              <span className="text-[11px] text-slate-400">Updating active operational configurations...</span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4.5 py-2 rounded-lg text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg transition-all"
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
