import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertCircle } from 'lucide-react';

// Custom tooltip shared across components
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg text-xs shadow-2xl text-left">
        <span className="font-bold text-neutral-500 block mb-0.5 uppercase tracking-widest text-[9px]">
          {label || payload[0].name}
        </span>
        <span className="font-extrabold text-white text-sm">
          {payload[0].value} {payload[0].name === 'confidence' ? '%' : payload[0].value === 1 ? 'Claim' : 'Claims'}
        </span>
      </div>
    );
  }
  return null;
};

// 1. VerdictPieChart
export function VerdictPieChart({ chartData }) {
  // Override colors for monochrome look
  const monochromeData = chartData.map((item, idx) => {
    let color = '#ffffff'; // Verified (White)
    if (item.name === 'Inaccurate') color = '#737373'; // Inaccurate (Medium Gray)
    if (item.name === 'False') color = '#262626'; // False (Deep Charcoal)
    return { ...item, color };
  });

  return (
    <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl shadow-xl text-center flex flex-col justify-between h-[300px]">
      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold mb-2">
        Claims Verdict Distribution
      </span>
      <div className="h-44 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={monochromeData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {monochromeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs font-bold">
        {monochromeData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, border: item.color === '#ffffff' ? 'none' : '1px solid #404040' }}></div>
            <span className="text-neutral-450">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. RiskBarChart
export function RiskBarChart({ chartData }) {
  // Override colors for monochrome look
  const monochromeData = chartData.map((item, idx) => {
    let color = '#ffffff'; // Low Risk (White)
    if (item.name === 'Medium Risk') color = '#737373'; // Medium Risk (Medium Gray)
    if (item.name === 'High Risk') color = '#262626'; // High Risk (Deep Charcoal)
    return { ...item, color };
  });

  return (
    <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl shadow-xl text-center flex flex-col justify-between h-[300px]">
      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold mb-2">
        Risk Classification Profile
      </span>
      <div className="h-44 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monochromeData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" vertical={false} />
            <XAxis dataKey="name" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {monochromeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-neutral-500 leading-normal max-w-xs mx-auto font-medium">
        High-risk claims signify direct contradictions against established public facts.
      </p>
    </div>
  );
}

// 3. ConfidenceLineChart
export function ConfidenceLineChart({ chartData }) {
  return (
    <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl shadow-xl text-center h-[260px] flex flex-col justify-between">
      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold mb-2">
        Audit Confidence Timeline
      </span>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" />
            <XAxis dataKey="name" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="#ffffff"
              strokeWidth={3}
              dot={{ r: 4, stroke: '#ffffff', strokeWidth: 1.5, fill: '#000000' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-neutral-550 leading-normal font-medium">
        Reflects AI model confidence rating across consecutive assertion cross-verifications.
      </p>
    </div>
  );
}

// 4. ProblemAreasList
export function ProblemAreasList({ areas }) {
  return (
    <div className="bg-neutral-900 border border-neutral-855 p-5 rounded-2xl shadow-xl text-left">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-4.5 w-4.5 text-neutral-450" />
        <span className="text-[10px] text-neutral-550 uppercase tracking-widest block font-bold">
          Detected Problem Areas
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {areas.map((area, idx) => {
          const hasProblems = area.count > 0;
          return (
            <div
              key={idx}
              className="p-3 rounded-xl border border-neutral-850 bg-neutral-950/40 hover:border-neutral-800 flex flex-col justify-between transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-white capitalize tracking-wide">
                  {area.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${hasProblems ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-950 text-neutral-550'
                  }`}>
                  {area.count} {area.count === 1 ? 'Error' : 'Errors'}
                </span>
              </div>
              {/* Horizontal progress bar */}
              <div className="w-full bg-neutral-950 border border-neutral-850 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
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
