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
          badge: 'bg-[#4ec590]/10 border-[#4ec590]/35 text-[#3db580]',
          text: 'text-neutral-800',
          icon: <ShieldCheck className="h-4 w-4 text-[#3db580]" />
        };
      case 'Inaccurate':
        return {
          badge: 'bg-[#ea5586]/10 border-[#ea5586]/35 text-[#d94475]',
          text: 'text-neutral-600',
          icon: <AlertTriangle className="h-4 w-4 text-[#d94475]" />
        };
      case 'False':
        return {
          badge: 'bg-[#547bf1]/10 border-[#547bf1]/35 text-[#446ce0]',
          text: 'text-neutral-600',
          icon: <XCircle className="h-4 w-4 text-[#446ce0]" />
        };
      default:
        return {
          badge: 'bg-neutral-100 border-neutral-200 text-neutral-600',
          text: 'text-neutral-500',
          icon: <HelpCircle className="h-4 w-4 text-neutral-500" />
        };
    }
  };

  return (
    <div className="flex flex-col bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden text-black">

      {/* Filtering Toolbar */}
      <div className="p-4.5 border-b border-neutral-200 bg-neutral-50 flex flex-col md:flex-row gap-3 items-center justify-between">

        {/* Tab filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {['ALL', 'VERIFIED', 'INACCURATE', 'FALSE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === tab
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:text-black border border-neutral-200 hover:bg-neutral-50'
                }`}
            >
              {tab === 'ALL' ? 'All Assertions' : tab}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims or sources..."
            className="w-full bg-white border border-neutral-200 focus:border-neutral-400 focus:outline-none pl-9 pr-4 py-2 rounded-xl text-xs text-black placeholder-neutral-400 transition-all font-semibold"
          />
        </div>

      </div>

      {/* Claims List Table */}
      <div className="overflow-x-auto">
        <table className="w-full custom-table">
          <thead>
            <tr>
              <th className="w-3/5 text-neutral-500 border-neutral-200 bg-neutral-50">Extracted Claims</th>
              <th className="w-1/5 text-center text-neutral-500 border-neutral-200 bg-neutral-50">Verdict Status</th>
              <th className="w-1/10 text-center text-neutral-500 border-neutral-200 bg-neutral-50">Conf.</th>
              <th className="w-1/10 text-center text-neutral-500 border-neutral-200 bg-neutral-50">Audit</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-neutral-400 text-xs font-bold">
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
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="font-bold text-black py-4 max-w-md border-b border-neutral-200">
                        <div className="flex flex-col gap-1 text-left">
                          <span className="leading-relaxed font-sans font-semibold text-neutral-800">{item.claim}</span>
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1.5">
                            Category: {item.category}
                          </span>
                        </div>
                      </td>
                      <td className="text-center border-b border-neutral-200">
                        <div className="flex justify-center">
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
                            {style.icon}
                            <span>{item.verdict}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-center font-mono text-xs text-neutral-700 font-bold border-b border-neutral-200">
                        {item.confidence}%
                      </td>
                      <td className="text-center border-b border-neutral-200">
                        <div className="flex justify-center text-neutral-400 hover:text-black">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable audit results panel */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="4" className="bg-neutral-50 px-6 py-5 border-b border-neutral-200 text-left">
                          <div className="space-y-4 animate-fadeIn">

                            {/* Corrected Fact / Side by side Table */}
                            {item.verdict !== 'Verified' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-100/50">
                                  <span className="text-[10px] text-neutral-450 font-bold uppercase tracking-wider block mb-1">
                                    Original Asserted Fact
                                  </span>
                                  <p className="text-xs text-neutral-400 leading-relaxed font-medium italic line-through">
                                    "{item.claim}"
                                  </p>
                                </div>
                                <div className="p-4 rounded-xl border border-neutral-300 bg-white shadow-sm">
                                  <span className="text-[10px] text-neutral-800 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                    <ShieldCheck className="h-3.5 w-3.5 text-neutral-800 animate-pulse" />
                                    Corrected Fact
                                  </span>
                                  <p className="text-xs text-neutral-800 leading-relaxed font-bold">
                                    {item.correctFact}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Source and Citation references */}
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                                  Audit Reference Snippet
                                </span>
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-[#863bff] flex items-center gap-1 hover:underline font-bold"
                                >
                                  <span>{item.source}</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <blockquote className="p-3 border-l-2 border-[#863bff] bg-white text-xs text-neutral-700 leading-relaxed rounded-r-lg font-semibold">
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
