import React, { useEffect, useState } from 'react';

export default function TrustScoreGauge({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score reading on load
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const ease = progress * (2 - progress);
      setAnimatedScore(Math.round(ease * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Determine dynamic details based on score
  let strokeColor = '#2563eb'; // primary Blue
  let badgeColor = 'bg-blue-50 border-blue-200 text-blue-700';
  let verdict = 'Moderate Accuracy';
  let description = 'Key elements require statistical update.';

  if (score >= 85) {
    strokeColor = '#059669'; // Green
    badgeColor = 'bg-emerald-50 border-emerald-200 text-emerald-700';
    verdict = 'Verified Integrity';
    description = 'High factual compliance with trusted indices.';
  } else if (score < 70) {
    strokeColor = '#dc2626'; // Red
    badgeColor = 'bg-rose-50 border-rose-200 text-rose-700';
    verdict = 'High Factual Risk';
    description = 'Multiple outdated metrics or false assertions detected.';
  } else {
    strokeColor = '#d97706'; // Amber
    badgeColor = 'bg-amber-50 border-amber-200 text-amber-700';
    verdict = 'Moderate Discrepancy';
    description = 'Factual claims contain outdated projected values.';
  }

  // Radial calculation (radius 50, circumference 314.16)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-center h-full min-h-[300px]">
      
      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-4">
        Overall Document Trust Score
      </span>

      {/* Circle Gauge SVG */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-6">
        
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Base track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="rgba(0, 0, 0, 0.04)"
            strokeWidth="8"
          />
          {/* Active progress ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Centered raw score */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            {animatedScore}%
          </span>
        </div>

      </div>

      {/* Dynamic Status Badge */}
      <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider mb-2 ${badgeColor}`}>
        {verdict}
      </div>

      <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed font-medium">
        {description}
      </p>

    </div>
  );
}
