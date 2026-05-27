import React, { useState } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ClaimsTable from './components/ClaimsTable';
import { VerdictPieChart, RiskBarChart, ConfidenceLineChart, ProblemAreasList } from './components/AnalyticsCharts';
import TrustScoreGauge from './components/TrustScoreGauge';
import { exportReportToPrint } from './utils/exportReport';
import { FileText, Download, RotateCcw, ShieldCheck, AlertTriangle, XCircle, Info } from 'lucide-react';
import SettingsModal from './components/SettingsModal';

let backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
backendUrl = backendUrl.trim().replace(/\/$/, '');

export default function App() {
  const [status, setStatus] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [config, setConfig] = useState({
    geminiKey: localStorage.getItem('geminiKey') || '',
    openaiKey: localStorage.getItem('openaiKey') || '',
    tavilyKey: localStorage.getItem('tavilyKey') || ''
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleUploadPDF = async (file, validationError) => {
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (!file) return;

    setFileName(file.name);
    setError(null);
    setStatus('PARSING');
    setProgress(0);

    let completedProgress = false;
    let localApiData = null;
    let localApiError = null;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          completedProgress = true;

          if (localApiError) {
            setStatus('IDLE');
            setError(localApiError);
            setProgress(0);
          } else if (localApiData) {
            setVerificationData(localApiData);
            setStatus('DASHBOARD');
          } else {
            setStatus('ANALYZING');
          }
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('mode', 'live');

      const headers = {};
      if (config.geminiKey) headers['x-gemini-key'] = config.geminiKey;
      if (config.openaiKey) headers['x-openai-key'] = config.openaiKey;
      if (config.tavilyKey) headers['x-tavily-key'] = config.tavilyKey;

      const response = await fetch(`${backendUrl}/api/check`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      localApiData = data;

      if (completedProgress) {
        setVerificationData(data);
        setStatus('DASHBOARD');
      }

    } catch (apiError) {
      const errMessage = `Verification Failed: ${apiError.message}. Make sure the backend server is running and your API keys in server/.env are active and funded.`;
      localApiError = errMessage;

      if (completedProgress) {
        setStatus('IDLE');
        setProgress(0);
        setError(errMessage);
        setTimeout(() => setError(null), 10000);
      }
    }
  };

  const handleReset = () => {
    setStatus('IDLE');
    setProgress(0);
    setFileName('');
    setVerificationData(null);
    setError(null);
  };

  const handleExport = () => {
    if (!verificationData) return;
    exportReportToPrint(verificationData);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-neutral-950 text-neutral-100 selection:bg-white selection:text-black">
      
      <div className="absolute inset-0 grid-bg-mesh pointer-events-none"></div>

      <Header isDashboard={status === 'DASHBOARD'} onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="max-w-7xl w-full mx-auto px-6 flex-1 flex flex-col justify-center relative z-10">
        
        {(status === 'IDLE' || status === 'PARSING') ? (
          <UploadArea 
            onUpload={handleUploadPDF}
            status={status}
            error={error}
            progress={progress}
            fileName={fileName}
          />
        ) : status === 'ANALYZING' ? (
          <div className="py-6 space-y-6 relative h-[calc(100vh-180px)] overflow-hidden">
            
            <div className="fixed inset-0 bg-black/85 backdrop-blur-[4px] z-50 flex flex-col items-center justify-center gap-4 animate-fadeIn">
              <div className="bg-neutral-900 border border-neutral-800 px-12 py-10 rounded-3xl shadow-2xl flex flex-col items-center gap-5 max-w-sm">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-extrabold text-white tracking-tight text-center">Analyzing is loading...</span>
                <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest text-center">Checking live web data</span>
              </div>
            </div>

            <div className="opacity-40 pointer-events-none select-none animate-pulse space-y-6">
              
              <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-200 h-10 w-10 rounded-xl"></div>
                  <div className="space-y-1.5">
                    <div className="bg-slate-200 h-3 w-40 rounded"></div>
                    <div className="bg-slate-200 h-2 w-20 rounded"></div>
                  </div>
                </div>
                <div className="bg-slate-200 h-8 w-24 rounded-lg"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center h-[300px] space-y-4">
                  <div className="bg-slate-200 h-3 w-28 rounded"></div>
                  <div className="w-24 h-24 rounded-full border-8 border-slate-100 flex items-center justify-center">
                    <div className="bg-slate-200 h-5 w-8 rounded"></div>
                  </div>
                  <div className="bg-slate-200 h-5.5 w-20 rounded-full"></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center h-[300px] space-y-4">
                  <div className="bg-slate-200 h-3 w-28 rounded"></div>
                  <div className="w-24 h-24 rounded-full border-8 border-slate-100 flex items-center justify-center"></div>
                  <div className="bg-slate-200 h-3 w-32 rounded"></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-[300px]">
                  <div className="bg-slate-200 h-3 w-28 rounded self-center"></div>
                  <div className="bg-slate-100 h-24 w-full rounded-lg"></div>
                  <div className="bg-slate-200 h-2.5 w-24 rounded self-center"></div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="bg-slate-200 h-4 w-32 rounded"></div>
                  <div className="bg-slate-200 h-4 w-16 rounded"></div>
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center py-4 border-b border-slate-100/40">
                    <div className="space-y-2 w-2/3">
                      <div className="bg-slate-200 h-3.5 w-full rounded"></div>
                      <div className="bg-slate-200 h-2 w-28 rounded"></div>
                    </div>
                    <div className="bg-slate-200 h-6 w-14 rounded-full"></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-[260px] flex flex-col justify-between">
                  <div className="bg-slate-200 h-3 w-28 rounded self-center"></div>
                  <div className="bg-slate-100 h-24 w-full rounded-lg"></div>
                  <div className="bg-slate-200 h-2 w-36 rounded self-center"></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-[260px] space-y-4">
                  <div className="bg-slate-200 h-3.5 w-32 rounded"></div>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 h-14 flex flex-col justify-between">
                        <div className="bg-slate-200 h-3.5 w-16 rounded"></div>
                        <div className="bg-slate-200 h-1.5 w-full rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="py-6 space-y-6 animate-fadeIn">
            
            <div className="bg-neutral-900 border border-neutral-850 p-4.5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-950 p-2.5 rounded-xl text-white border border-neutral-850 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white tracking-wide">{verificationData.metadata.fileName}</h3>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                    Analyzed: {verificationData.metadata.timestamp}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 text-neutral-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  Analyze New Document
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-neutral-900 border border-neutral-855 rounded-xl p-5 text-white shadow-md flex flex-col justify-between h-[115px]">
                <div className="flex items-center justify-between opacity-80 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  <span>Claims Audited</span>
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {verificationData.metadata.totalClaims}
                </div>
                <div className="text-[10px] text-neutral-500 font-semibold">
                  100% extracted from document
                </div>
              </div>

              <div className="bg-white border border-white rounded-xl p-5 text-black shadow-lg flex flex-col justify-between h-[115px]">
                <div className="flex items-center justify-between opacity-80 text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                  <span>Verified Claims</span>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-black">
                  {verificationData.metadata.verifiedCount}
                </div>
                <div className="text-[10px] text-neutral-600 font-semibold">
                  Supported by trusted web data
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-neutral-300 shadow-md flex flex-col justify-between h-[115px]">
                <div className="flex items-center justify-between opacity-80 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  <span>Inaccurate Claims</span>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-white">
                  {verificationData.metadata.inaccurateCount}
                </div>
                <div className="text-[10px] text-neutral-500 font-semibold">
                  Outdated dates or stats
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-neutral-400 shadow-sm flex flex-col justify-between h-[115px]">
                <div className="flex items-center justify-between opacity-80 text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                  <span>False Claims</span>
                  <XCircle className="h-4 w-4" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {verificationData.metadata.falseCount}
                </div>
                <div className="text-[10px] opacity-75 font-semibold">
                  Direct contradiction/no evidence
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TrustScoreGauge score={verificationData.metadata.trustScore} />
              <VerdictPieChart chartData={verificationData.analytics.claimsOverviewChart} />
              <RiskBarChart chartData={verificationData.analytics.riskDistributionGraph} />
            </div>

            <div className="w-full">
              <ClaimsTable claims={verificationData.claims} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConfidenceLineChart chartData={verificationData.analytics.verificationTimeline} />
              <ProblemAreasList areas={verificationData.analytics.topProblemAreas} />
            </div>

          </div>
        )}

      </main>

      <footer className="w-full py-6 border-t border-neutral-900 bg-neutral-950 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-neutral-550 tracking-wider uppercase font-bold">
          <span>Fact checker &copy; 2026</span>
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3 text-neutral-600" />
            Empowered by Web Search AI Verification
          </span>
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={(newConfig) => {
          localStorage.setItem('geminiKey', newConfig.geminiKey);
          localStorage.setItem('openaiKey', newConfig.openaiKey);
          localStorage.setItem('tavilyKey', newConfig.tavilyKey);
          setConfig(newConfig);
        }}
      />
    </div>
  );
}
