import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertCircle } from 'lucide-react';

// Custom tooltip shared across components
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs shadow-xl text-left">
        <span className="font-bold text-slate-400 block mb-0.5 uppercase tracking-widest text-[9px]">
          {label || payload[0].name}
        </span>
        <span className="font-extrabold text-slate-900 text-sm">
          {payload[0].value} {payload[0].name === 'confidence' ? '%' : payload[0].value === 1 ? 'Claim' : 'Claims'}
        </span>
      </div>
    );
  }
  return null;
};

// 1. VerdictPieChart
export function VerdictPieChart({ chartData }) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between h-[300px]">
      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-2">
        Claims Verdict Distribution
      </span>
      <div className="h-44 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs font-bold">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-slate-500">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. RiskBarChart
export function RiskBarChart({ chartData }) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between h-[300px]">
      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-2">
        Risk Classification Profile
      </span>
      <div className="h-44 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.01)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-500 leading-normal max-w-xs mx-auto font-medium">
        High-risk claims signify direct contradictions against established public facts.
      </p>
    </div>
  );
}

// 3. ConfidenceLineChart
export function ConfidenceLineChart({ chartData }) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center h-[260px] flex flex-col justify-between">
      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-2">
        Audit Confidence Timeline
      </span>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.04)" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="#2563eb" 
              strokeWidth={3} 
              dot={{ r: 4, stroke: '#2563eb', strokeWidth: 1.5, fill: '#ffffff' }}
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-500 leading-normal font-medium">
        Reflects AI model confidence rating across consecutive assertion cross-verifications.
      </p>
    </div>
  );
}

// 4. ProblemAreasList
export function ProblemAreasList({ areas }) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-4.5 w-4.5 text-amber-600" />
        <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
          Detected Problem Areas
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {areas.map((area, idx) => {
          const hasProblems = area.count > 0;
          return (
            <div 
              key={idx} 
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                hasProblems 
                  ? 'border-amber-200 bg-amber-50/20' 
                  : 'border-slate-100 bg-slate-50/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-slate-800 capitalize tracking-wide">
                  {area.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  hasProblems ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-450'
                }`}>
                  {area.count} {area.count === 1 ? 'Error' : 'Errors'}
                </span>
              </div>
              {/* Horizontal progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(area.count * 25, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
