import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

export default function UploadArea({ onUpload, status, error, progress, fileName }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file) => {
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => lowerName.endsWith(ext));

    if (!isAllowed) {
      onUpload(null, 'Unsupported format! Please upload a valid PDF, DOCX, or TXT document.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onUpload(null, 'File is too large! Maximum allowed size is 10MB.');
      return;
    }
    onUpload(file, null);
  };

  const triggerInputClick = () => {
    fileInputRef.current.click();
  };

  const stages = [
    { label: "Parsing Document Structure", threshold: 15 },
    { label: "Isolating & Extracting Factual Claims", threshold: 40 },
    { label: "Dispatching Live Tavily Search Queries", threshold: 65 },
    { label: "Conducting Source Cross-Referencing", threshold: 85 },
    { label: "Structuring Visual Analytics & Insights", threshold: 100 }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[75vh] relative grid-bg-mesh">
      
      <div className="w-full max-w-3xl z-10 text-center">
        
        {(status === 'IDLE' || status === 'PARSING') && (
          <>
            <div className="inline-block bg-slate-900 text-white text-[10px] font-bold tracking-wider px-3.5 py-1.5 rounded-full mb-6 uppercase shadow-sm">
              Effortless Verification, 95% Accurate
            </div>

            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-2 font-sans">
              Fact checker
            </h2>
            <p className="text-slate-500 text-base md:text-lg mb-8 font-medium">
              Your One-Stop Solution
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Multi-format Processing
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Automated Workflow Integration
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Advanced Data Extraction
              </div>
            </div>

            <div 
              onClick={status === 'IDLE' ? triggerInputClick : undefined}
              onDragEnter={status === 'IDLE' ? handleDrag : undefined}
              onDragOver={status === 'IDLE' ? handleDrag : undefined}
              onDragLeave={status === 'IDLE' ? handleDrag : undefined}
              onDrop={status === 'IDLE' ? handleDrop : undefined}
              className={`w-full max-w-2xl mx-auto bg-[#1e1e21] rounded-2xl p-7 border-2 transition-all duration-300 shadow-xl ${
                status === 'PARSING' 
                  ? 'opacity-80 cursor-default border-transparent' 
                  : dragActive 
                    ? 'border-blue-500 scale-[1.01] cursor-pointer' 
                    : 'border-transparent hover:bg-[#28282c] cursor-pointer'
              }`}
            >
              <div className="border border-dashed border-slate-700 rounded-xl py-8 px-6 flex flex-col items-center justify-center gap-3">
                <UploadCloud className="h-8 w-8 text-slate-200" />
                <div className="text-sm font-bold text-white">
                  {status === 'PARSING' ? 'Processing file content...' : 'Click to upload or drag and drop'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Max file size 10MB &bull; PDF, DOCX, or TXT
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleChange}
                className="hidden"
                disabled={status === 'PARSING'}
              />
            </div>
          </>
        )}

        {status === 'PARSING' && (
          <div className="mt-8 w-full max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-left animate-slideUp">
            
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl mb-6">
              <div className="bg-slate-200/60 p-2 rounded-lg text-slate-750">
                <FileText className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-slate-800 truncate block">{fileName}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Auditing document content...</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
              <div 
                className="bg-slate-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="space-y-3">
              {stages.map((stage, idx) => {
                const isDone = progress >= stage.threshold;
                const isCurrent = progress < stage.threshold && (idx === 0 || progress >= stages[idx - 1].threshold);

                return (
                  <div 
                    key={idx}
                    className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                      isDone ? 'text-slate-400 font-medium' : isCurrent ? 'text-slate-900 font-bold' : 'text-slate-300'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="h-4 w-4 text-slate-855 animate-spin shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-200 shrink-0 flex items-center justify-center text-[8px] font-bold text-slate-400">
                        {idx + 1}
                      </div>
                    )}
                    <span className="truncate">{stage.label}</span>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {error && (
          <div className="mt-6 inline-flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-xl text-xs font-bold shadow-sm animate-slideUp">
            <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

      </div>
    </div>
  );
}
