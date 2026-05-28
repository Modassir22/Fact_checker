import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertCircle } from 'lucide-react';

// Custom tooltip shared across components (Light theme)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-neutral-200 p-2.5 rounded-lg text-xs shadow-md text-left text-black">
        <span className="font-bold text-neutral-500 block mb-0.5 uppercase tracking-widest text-[9px]">
          {label || payload[0].name}
        </span>
        <span className="font-extrabold text-black text-sm">
          {payload[0].value} {payload[0].name === 'confidence' ? '%' : payload[0].value === 1 ? 'Claim' : 'Claims'}
        </span>
      </div>
    );
  }
  return null;
};

// 1. VerdictPieChart
export function VerdictPieChart({ chartData }) {
  // Override colors for vibrant light look matching dashboard cards
  const vibrantData = chartData.map((item, idx) => {
    let color = '#4ec590'; // Verified (Mint Green)
    if (item.name === 'Inaccurate') color = '#ea5586'; // Inaccurate (Pink/Magenta)
    if (item.name === 'False') color = '#547bf1'; // False (Royal Blue)
    return { ...item, color };
  });

  return (
    <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between h-[300px] text-black">
      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold mb-2">
        Claims Verdict Distribution
      </span>
      <div className="h-44 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={vibrantData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {vibrantData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs font-bold">
        {vibrantData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-neutral-600">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. RiskBarChart
export function RiskBarChart({ chartData }) {
  // Override colors for vibrant light look
  const vibrantData = chartData.map((item, idx) => {
    let color = '#4ec590'; // Low Risk (Mint Green)
    if (item.name === 'Medium Risk') color = '#ea5586'; // Medium Risk (Pink/Magenta)
    if (item.name === 'High Risk') color = '#547bf1'; // High Risk (Royal Blue)
    return { ...item, color };
  });

  return (
    <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between h-[300px] text-black">
      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold mb-2">
        Risk Classification Profile
      </span>
      <div className="h-44 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={vibrantData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.04)" vertical={false} />
            <XAxis dataKey="name" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {vibrantData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-neutral-500 leading-normal max-w-xs mx-auto font-semibold">
        High-risk claims signify direct contradictions against established public facts.
      </p>
    </div>
  );
}

// 3. ConfidenceLineChart
export function ConfidenceLineChart({ chartData }) {
  return (
    <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm text-center h-[260px] flex flex-col justify-between text-black">
      <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold mb-2">
        Audit Confidence Timeline
      </span>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.04)" />
            <XAxis dataKey="name" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="#547bf1"
              strokeWidth={3}
              dot={{ r: 4, stroke: '#547bf1', strokeWidth: 1.5, fill: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-neutral-500 leading-normal font-semibold">
        Reflects AI model confidence rating across consecutive assertion cross-verifications.
      </p>
    </div>
  );
}

// 4. ProblemAreasList
export function ProblemAreasList({ areas }) {
  return (
    <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm text-left text-black">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-4.5 w-4.5 text-[#ea5586]" />
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">
          Detected Problem Areas
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {areas.map((area, idx) => {
          const hasProblems = area.count > 0;
          return (
            <div
              key={idx}
              className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:border-neutral-300 flex flex-col justify-between transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-neutral-800 capitalize tracking-wide">
                  {area.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  hasProblems ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {area.count} {area.count === 1 ? 'Error' : 'Errors'}
                </span>
              </div>
              {/* Horizontal progress bar */}
              <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#ea5586] h-full rounded-full transition-all duration-500"
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
