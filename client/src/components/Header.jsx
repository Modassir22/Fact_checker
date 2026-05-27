import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Header({ isDashboard, onOpenSettings }) {
  return (
    <header className={`w-full transition-all duration-300 ${isDashboard ? 'border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Brand logo & name */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-slate-800" />
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
              Fact checker
            </h1>
            {isDashboard && (
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-semibold">
                TRUTH LAYER SYSTEM
              </span>
            )}
          </div>
        </div>

        {/* Right Corner Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-[10px] sm:text-xs px-4 py-2 rounded-xl shadow-md transition-all uppercase tracking-wider shrink-0"
          >
            Add API Keys
          </button>

          {/* Minimalist Live Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Live Verification Active</span>
          </div>
        </div>

      </div>
    </header>
  );
}
