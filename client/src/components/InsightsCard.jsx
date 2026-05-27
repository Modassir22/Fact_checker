import React from 'react';
import { Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function InsightsCard({ insights }) {
  
  // Custom simple parser to render basic markdown elements beautifully in light mode
  const renderFormattedInsights = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Header 3 (### Title)
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-5 mb-2.5 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-slate-900 rounded-full"></span>
            {line.replace('### ', '')}
          </h4>
        );
      }
      
      // Header 2 (## Title)
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-sm font-extrabold text-slate-900 mt-6 mb-3 border-b border-slate-200 pb-2">
            {line.replace('## ', '')}
          </h3>
        );
      }

      // Bullet Points with custom emojis
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.substring(2);
        
        // Match bold markers **
        const parts = content.split('**');
        const formattedContent = parts.map((part, i) => {
          if (i % 2 === 1) return <strong key={i} className="text-slate-900 font-extrabold">{part}</strong>;
          return part;
        });

        // Determine icon based on first characters (e.g., ⚠️, 📊, ✅)
        let bulletIcon = <Lightbulb className="h-4.5 w-4.5 text-slate-600 shrink-0 mt-0.5" />;
        let finalContent = formattedContent;

        if (content.includes('⚠️')) {
          bulletIcon = <AlertTriangle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />;
          finalContent = content.replace('⚠️', '').split('**').map((part, i) => (
            i % 2 === 1 ? <strong key={i} className="text-slate-900 font-extrabold">{part}</strong> : part
          ));
        } else if (content.includes('📊') || content.includes('📈')) {
          bulletIcon = <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />;
          finalContent = content.replace(/[📊📈]/g, '').split('**').map((part, i) => (
            i % 2 === 1 ? <strong key={i} className="text-slate-900 font-extrabold">{part}</strong> : part
          ));
        } else if (content.includes('✅')) {
          bulletIcon = <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />;
          finalContent = content.replace('✅', '').split('**').map((part, i) => (
            i % 2 === 1 ? <strong key={i} className="text-slate-900 font-extrabold">{part}</strong> : part
          ));
        }

        return (
          <div key={idx} className="flex gap-3 text-xs text-slate-600 leading-relaxed py-1 text-left">
            {bulletIcon}
            <span>{finalContent}</span>
          </div>
        );
      }

      // Ordered list numbered items (e.g. 1. Item)
      if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, '');
        const indexMatch = line.match(/^(\d+)/);
        const indexNum = indexMatch ? indexMatch[0] : '1';
        
        const parts = content.split('**');
        const formattedContent = parts.map((part, i) => {
          if (i % 2 === 1) return <strong key={i} className="text-slate-900 font-bold">{part}</strong>;
          return part;
        });

        return (
          <div key={idx} className="flex gap-3 text-xs text-slate-600 leading-relaxed py-1.5 text-left items-start">
            <div className="h-5 w-5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-800 shrink-0 mt-0.5">
              {indexNum}
            </div>
            <div className="pt-0.5">{formattedContent}</div>
          </div>
        );
      }

      // Blank line
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }

      // Default paragraph line
      const parts = line.split('**');
      const formattedLine = parts.map((part, i) => {
        if (i % 2 === 1) return <strong key={i} className="text-slate-900 font-extrabold">{part}</strong>;
        return part;
      });

      return (
        <p key={idx} className="text-xs text-slate-600 leading-relaxed mb-2 text-left font-medium">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col h-full">
      
      {/* Header section */}
      <div className="flex items-center gap-2.5 mb-4 border-b border-slate-200 pb-3">
        <Lightbulb className="h-5 w-5 text-slate-800" />
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
            Executive Audit Insights
          </span>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase">
            AI-generated findings & risk profile
          </h3>
        </div>
      </div>

      {/* Rendered content */}
      <div className="space-y-1 flex-1 font-medium overflow-y-auto">
        {renderFormattedInsights(insights)}
      </div>

    </div>
  );
}
