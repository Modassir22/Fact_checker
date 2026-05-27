/**
 * PDF/Print Export Report Utility
 * Takes fact-checking audit metadata and claim results and generates a highly formatted, professional report print dialogue.
 */

export function exportReportToPrint(data) {
  const { metadata, claims } = data;

  const claimRows = claims
    .map((c, index) => {
      let verdictColor = '#059669'; // Green
      if (c.verdict === 'Inaccurate') verdictColor = '#d97706'; // Amber
      if (c.verdict === 'False') verdictColor = '#dc2626'; // Red

      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 10px; font-size: 11px; font-weight: 600; color: #1e293b; max-width: 250px;">
            ${c.claim}
          </td>
          <td style="padding: 12px 10px; text-align: center;">
            <span style="display: inline-block; padding: 4px 10px; font-size: 10px; font-weight: 700; border-radius: 9999px; background-color: ${verdictColor}10; color: ${verdictColor}; border: 1px solid ${verdictColor}30;">
              ${c.verdict.toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px 10px; text-align: center; font-size: 11px; font-family: monospace; font-weight: bold; color: #475569;">
            ${c.confidence}%
          </td>
          <td style="padding: 12px 10px; font-size: 11px; color: #334155;">
            ${c.correctFact !== '—' ? `<strong>${c.correctFact}</strong>` : '<span style="color:#94a3b8;">—</span>'}
          </td>
          <td style="padding: 12px 10px; font-size: 10px; color: #64748b;">
            <a href="${c.sourceUrl}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: bold;">
              ${c.source}
            </a>
          </td>
        </tr>
      `;
    })
    .join('');

  // Print Window markup
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Fact-Check Verification Report - ${metadata.fileName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            color: #1e293b;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
          }
          .header-container {
            border-bottom: 3px solid #0f172a;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .title {
            margin: 0;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #0f172a;
          }
          .subtitle {
            margin: 5px 0 0 0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            font-weight: bold;
          }
          .metadata-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            display: grid;
            grid-template-cols: 1fr 1fr 1fr;
            gap: 15px;
          }
          .meta-item {
            display: flex;
            flex-direction: column;
          }
          .meta-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: bold;
            color: #64748b;
            margin-bottom: 4px;
          }
          .meta-value {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
          }
          .score-badge {
            background-color: #0f172a;
            color: #ffffff;
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 18px;
            font-weight: 800;
            text-align: center;
            display: inline-block;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-left: 4px solid #2563eb;
            padding-left: 10px;
          }
          .table-container {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .table-container th {
            background-color: #f1f5f9;
            color: #475569;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: bold;
            text-align: left;
            padding: 10px;
            border-bottom: 2px solid #cbd5e1;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div>
            <h1 class="title">FACT CHECKER AUDIT</h1>
            <p class="subtitle">Official Verification Report</p>
          </div>
          <div>
            <div style="text-align: right;">
              <span class="meta-label" style="display:block;">Overall Trust Rating</span>
              <div class="score-badge">${metadata.trustScore}%</div>
            </div>
          </div>
        </div>

        <div class="metadata-card">
          <div class="meta-item">
            <span class="meta-label">Document Name</span>
            <span class="meta-value">${metadata.fileName}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Audit Compiled At</span>
            <span class="meta-value">${metadata.timestamp}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Audited Claims Summary</span>
            <span class="meta-value">${metadata.totalClaims} Claims (${metadata.verifiedCount} Verified, ${metadata.inaccurateCount} Inaccurate, ${metadata.falseCount} False)</span>
          </div>
        </div>

        <h2 class="section-title">Factual Audit Assertions</h2>
        <table class="table-container">
          <thead>
            <tr>
              <th style="width: 30%">Asserted Claim</th>
              <th style="width: 15%; text-align: center;">Verdict</th>
              <th style="width: 10%; text-align: center;">Confidence</th>
              <th style="width: 30%">Correct Fact / Correction Details</th>
              <th style="width: 15%">Trusted Web Source</th>
            </tr>
          </thead>
          <tbody>
            ${claimRows}
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by Fact Checker Platform &mdash; "Truth Layer" Document Verification. 
          All reference URLs contain active live audits verified against live search indexes at time of generation.
        </div>

        <script>
          // Automatically launch print dialog on page load
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
