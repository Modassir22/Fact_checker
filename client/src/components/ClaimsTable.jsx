import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ShieldCheck, HelpCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

export default function ClaimsTable({ claims }) {
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredClaims = claims.filter(c => {
    const matchesFilter = 
      filter === 'ALL' ||
      (filter === 'VERIFIED' && c.verdict === 'Verified') ||
      (filter === 'INACCURATE' && c.verdict === 'Inaccurate') ||
      (filter === 'FALSE' && c.verdict === 'False');

    const matchesSearch = 
      c.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.source.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'Verified':
        return {
          badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          text: 'text-emerald-700',
          icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />
        };
      case 'Inaccurate':
        return {
          badge: 'bg-amber-50 border-amber-200 text-amber-700',
          text: 'text-amber-700',
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />
        };
      case 'False':
        return {
          badge: 'bg-rose-50 border-rose-200 text-rose-700',
          text: 'text-rose-750',
          icon: <XCircle className="h-4 w-4 text-rose-600" />
        };
      default:
        return {
          badge: 'bg-slate-100 border-slate-200 text-slate-500',
          text: 'text-slate-500',
          icon: <HelpCircle className="h-4 w-4 text-slate-400" />
        };
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Filtering Toolbar */}
      <div className="p-4.5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Tab filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {['ALL', 'VERIFIED', 'INACCURATE', 'FALSE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL' ? 'All Assertions' : tab}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims or sources..."
            className="w-full bg-white border border-slate-200 focus:border-slate-400 focus:outline-none pl-9 pr-4 py-2 rounded-xl text-xs text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

      </div>

      {/* Claims List Table */}
      <div className="overflow-x-auto">
        <table className="w-full custom-table">
          <thead>
            <tr>
              <th className="w-3/5">Extracted Claims</th>
              <th className="w-1/5 text-center">Verdict Status</th>
              <th className="w-1/10 text-center">Conf.</th>
              <th className="w-1/10 text-center">Audit</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-slate-400 text-xs">
                  No factual claims match the current filters or query.
                </td>
              </tr>
            ) : (
              filteredClaims.map((item) => {
                const isExpanded = expandedId === item.id;
                const style = getVerdictStyle(item.verdict);

                return (
                  <React.Fragment key={item.id}>
                    {/* Row header */}
                    <tr 
                      onClick={() => toggleExpand(item.id)}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                    >
                      <td className="font-bold text-slate-800 py-4 max-w-md">
                        <div className="flex flex-col gap-1 text-left">
                          <span className="leading-relaxed font-sans">{item.claim}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            Category: {item.category}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center">
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
                            {style.icon}
                            <span>{item.verdict}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-center font-mono text-xs text-slate-500 font-bold">
                        {item.confidence}%
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center text-slate-400 hover:text-slate-600">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable audit results panel */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="4" className="bg-slate-50/40 px-6 py-5 border-b border-slate-200 text-left">
                          <div className="space-y-4 animate-fadeIn">
                            
                            {/* Corrected Fact / Side by side Table */}
                            {item.verdict !== 'Verified' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                    Original Asserted Fact
                                  </span>
                                  <p className="text-xs text-slate-400 leading-relaxed font-medium italic line-through">
                                    "{item.claim}"
                                  </p>
                                </div>
                                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20">
                                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Corrected Fact
                                  </span>
                                  <p className="text-xs text-slate-800 leading-relaxed font-bold">
                                    {item.correctFact}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Source and Citation references */}
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                  Audit Reference Snippet
                                </span>
                                <a 
                                  href={item.sourceUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[10px] text-blue-600 flex items-center gap-1 hover:underline font-bold"
                                >
                                  <span>{item.source}</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <blockquote className="p-3 border-l-2 border-slate-350 bg-white text-xs text-slate-600 leading-relaxed rounded-r-lg font-medium">
                                "{item.snippet}"
                              </blockquote>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
