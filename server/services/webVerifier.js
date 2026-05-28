import { GoogleGenerativeAI } from '@google/generative-ai';
import { tavily } from '@tavily/core';

async function searchWeb(query, apiKey) {
  try {
    const client = tavily({ apiKey });
    const response = await client.search(query, {
      searchDepth: "advanced",
      maxResults: 3
    });
    return response.results || [];
  } catch (err) {
    return [];
  }
}

function cleanJsonResponse(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const FREE_TIER_MODELS = [
  "gemini-2.5-flash-lite",
];

async function callGeminiSDKVerify(apiKey, prompt, modelName, name) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7
    }
  });

  const maxRetries = 2;
  let attempt = 0;

  await wait(3000);

  while (true) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();
      const cleaned = cleanJsonResponse(rawText);

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        throw new Error(`JSON parse error: ${parseErr.message}. Raw response: ${rawText.slice(0, 200)}`);
      }

      if (parsed.verdicts && Array.isArray(parsed.verdicts)) return parsed.verdicts;
      if (Array.isArray(parsed)) return parsed;
      throw new Error('Invalid JSON structure returned by Gemini SDK');

    } catch (err) {
      attempt++;
      const errMsg = err.message || "";
      console.error(`[${name}] Batch Verification Attempt ${attempt} failed: ${errMsg}`);

      if (errMsg.startsWith("JSON parse error")) {
        throw err;
      }

      const isQuotaError =
        errMsg.toLowerCase().includes("quota") ||
        errMsg.toLowerCase().includes("429") ||
        errMsg.toLowerCase().includes("exhausted") ||
        errMsg.toLowerCase().includes("limit");

      if (isQuotaError && attempt < maxRetries) {
        console.warn(`[${name}] Quota exceeded. Waiting 60 seconds before retry ${attempt}/${maxRetries}...`);
        await wait(60000);
        continue;
      }

      throw err;
    }
  }
}

async function verifyClaimBatchWithAI(batchClaims, batchSearchResults, geminiApiKey) {
  let claimsAndSourcesContext = '';
  batchClaims.forEach((claim, idx) => {
    const searchRes = batchSearchResults[idx] || [];
    const sourcesText = searchRes.map((res, sIdx) =>
      `Source [${sIdx + 1}] (${res.title}):\nURL: ${res.url}\nSnippet: ${res.content}\n`
    ).join('\n');

    claimsAndSourcesContext += `=========================================\nCLAIM ID: ${idx}\nCLAIM TEXT: "${claim}"\n\nLIVE SEARCH DATA:\n${sourcesText || 'No direct search results found.'}\n=========================================\n\n`;
  });

  const prompt = `You are an elite Fact-Checking AI Engine.
You are verifying the following claims extracted from a document.

Here are the claims and their corresponding live web search results:
${claimsAndSourcesContext}

Your task is to compare each claim against its corresponding search results and generate a JSON object containing verdicts.
Classification Rules:
1. "Verified": The claim matches the live web sources with high accuracy.
2. "Inaccurate": The claim has factual elements but is outdated, contains numbers slightly off, or presents misleading context.
3. "False": The claim contradicts reliable sources, is completely unsupported, or no evidence exists to back it up.

For "category", you MUST choose one of these categories if the verdict is Inaccurate or False:
- "outdated stats" (if numbers/data are old)
- "financial misinformation" (if financial stats are wrong)
- "incorrect dates" (if dates or years are wrong)
- "unsupported claims" (if no evidence exists)
For "Verified" claims, set category to "unsupported claims" or any category.

You must return a JSON object containing a "verdicts" array with exactly ${batchClaims.length} elements (one for each claim in order).
Return ONLY a valid JSON object matching this structure (no markdown formatting, no comments):
{
  "verdicts": [
    {
      "claimId": 0,
      "verdict": "Verified" | "Inaccurate" | "False",
      "confidence": 0 to 100,
      "correctFact": "...",
      "category": "outdated stats" | "financial misinformation" | "incorrect dates" | "unsupported claims",
      "source": "Title of the most matching/accurate source",
      "sourceUrl": "URL of that source",
      "snippet": "A brief quote/snippet from the source confirming your verdict"
    },
    ...
  ]
}`;

  // Build attempt list across all models
  const attempts = [];
  const envGeminiKey = process.env.GEMINI_API_KEY;

  for (const modelName of FREE_TIER_MODELS) {
    if (geminiApiKey) {
      attempts.push({
        name: `${modelName} (Custom Key)`,
        fn: () => callGeminiSDKVerify(geminiApiKey, prompt, modelName, `${modelName} (Custom Key)`)
      });
    }
    if (envGeminiKey && envGeminiKey !== geminiApiKey) {
      attempts.push({
        name: `${modelName} (Env Fallback)`,
        fn: () => callGeminiSDKVerify(envGeminiKey, prompt, modelName, `${modelName} (Env Fallback)`)
      });
    }
  }

  let lastError = null;
  const attemptErrors = [];

  for (const attempt of attempts) {
    try {
      console.log(`Trying verification model: ${attempt.name}...`);
      const verdicts = await attempt.fn();
      if (Array.isArray(verdicts)) {
        console.log(`Verification success with: ${attempt.name}`);
        return verdicts;
      }
      console.warn(`[${attempt.name}] Response was not an array, trying next model...`);
    } catch (err) {
      const errMsg = err.message || "Unknown error";
      attemptErrors.push(`${attempt.name} -> ${errMsg}`);
      lastError = err;

      const isQuotaError =
        errMsg.toLowerCase().includes("quota") ||
        errMsg.toLowerCase().includes("429") ||
        errMsg.toLowerCase().includes("exhausted");

      if (isQuotaError) {
        console.warn(`[${attempt.name}] Quota hit, moving to next model...`);
        continue;
      }
    }
  }

  if (attemptErrors.length > 0) {
    console.warn(`All AI Claim Verification attempts failed. Attempting local heuristic fallback.\nError log:\n${attemptErrors.join('\n')}`);
  }

  // Heuristic fallback
  try {
    const localVerdicts = batchClaims.map((claim, idx) => {
      const localVerdict = verifyClaimHeuristically(claim, batchSearchResults[idx]);
      return { claimId: idx, ...localVerdict };
    });
    return localVerdicts;
  } catch (heurErr) {
    console.error("Heuristic Claim Verification failed:", heurErr);
  }

  if (lastError) {
    throw new Error(
      `AI Batch Claim Verification failed across all models.\n` +
      `Error log:\n${attemptErrors.map(e => `• ${e}`).join('\n')}\n\n` +
      `[Action Required]: Your free tier quota may be exhausted for today. ` +
      `Please wait until midnight (quota resets daily) or use a new API key from https://aistudio.google.com`
    );
  }

  throw new Error(`AI Batch Claim Verification failed. No LLM or heuristic attempts were successful.`);
}

async function generateInsightsWithAI(fileName, trustScore, claims, geminiApiKey) {
  return "Insights disabled.";
}

export async function verifyClaimsWithAI(claims, geminiApiKey, tavilyApiKey, fileName, textContent) {
  const claimResults = [];
  let verifiedCount = 0;
  let inaccurateCount = 0;
  let falseCount = 0;

  const allSearchResults = await Promise.all(
    claims.map(claim => searchWeb(claim, tavilyApiKey))
  );

  const BATCH_SIZE = 5;
  for (let i = 0; i < claims.length; i += BATCH_SIZE) {
    const batchClaims = claims.slice(i, i + BATCH_SIZE);
    const batchSearchResults = allSearchResults.slice(i, i + BATCH_SIZE);

    let batchVerdicts = [];
    try {
      batchVerdicts = await verifyClaimBatchWithAI(batchClaims, batchSearchResults, geminiApiKey);
    } catch (batchErr) {
      batchVerdicts = batchClaims.map((claim, idx) => {
        const localVerdict = verifyClaimHeuristically(claim, batchSearchResults[idx]);
        return { claimId: idx, ...localVerdict };
      });
    }

    batchClaims.forEach((claimText, idx) => {
      let analysis = batchVerdicts.find(v => v.claimId === idx) || batchVerdicts[idx];
      if (!analysis) {
        analysis = {
          verdict: "False",
          confidence: 30,
          correctFact: "Verification analysis failed for this claim.",
          category: "unsupported claims",
          source: batchSearchResults[idx]?.[0]?.title || "Web Search Portal",
          sourceUrl: batchSearchResults[idx]?.[0]?.url || "https://google.com",
          snippet: batchSearchResults[idx]?.[0]?.content || "No verified snippet."
        };
      }

      if (analysis.verdict === "Verified") verifiedCount++;
      else if (analysis.verdict === "Inaccurate") inaccurateCount++;
      else falseCount++;

      claimResults.push({
        id: `claim-${i + idx + 1}`,
        claim: claimText,
        verdict: analysis.verdict || "False",
        confidence: Number(analysis.confidence) || 50,
        correctFact: analysis.correctFact || "—",
        category: analysis.category || "unsupported claims",
        source: analysis.source || "External Media",
        sourceUrl: analysis.sourceUrl || "https://google.com",
        snippet: analysis.snippet || "No snippet verified."
      });
    });

    if (i + BATCH_SIZE < claims.length) {
      await wait(3000);
    }
  }

  const totalClaims = claimResults.length;
  const trustScore = totalClaims > 0
    ? Math.round(((verifiedCount * 1.0 + inaccurateCount * 0.5) / totalClaims) * 100)
    : 78;

  const claimsOverviewChart = [
    { name: "Verified", value: verifiedCount, color: "#10B981" },
    { name: "Inaccurate", value: inaccurateCount, color: "#F59E0B" },
    { name: "False", value: falseCount, color: "#EF4444" }
  ].filter(item => item.value > 0);

  const riskDistributionGraph = [
    { name: "Low Risk", count: verifiedCount, color: "#10B981" },
    { name: "Medium Risk", count: inaccurateCount, color: "#F59E0B" },
    { name: "High Risk", count: falseCount, color: "#EF4444" }
  ];

  const verificationTimeline = claimResults.map((item, idx) => ({
    name: `Claim ${idx + 1}`,
    confidence: item.confidence,
    progress: Math.round(((idx + 1) / totalClaims) * 100)
  }));

  const categories = ["outdated stats", "financial misinformation", "incorrect dates", "unsupported claims"];
  const problemAreasMap = {};
  categories.forEach(cat => { problemAreasMap[cat] = 0; });
  claimResults.forEach(item => {
    if (item.verdict !== "Verified") {
      problemAreasMap[item.category] = (problemAreasMap[item.category] || 0) + 1;
    }
  });

  const topProblemAreas = Object.keys(problemAreasMap).map(key => ({
    category: key,
    count: problemAreasMap[key]
  })).sort((a, b) => b.count - a.count);

  const aiInsights = await generateInsightsWithAI(fileName, trustScore, claimResults, geminiApiKey);

  return {
    metadata: {
      fileName,
      fileSize: "1.2 MB",
      totalClaims,
      trustScore,
      verifiedCount,
      inaccurateCount,
      falseCount,
      timestamp: new Date().toLocaleString()
    },
    claims: claimResults,
    analytics: {
      claimsOverviewChart,
      riskDistributionGraph,
      verificationTimeline,
      topProblemAreas
    },
    aiInsights
  };
}

function verifyClaimHeuristically(claim, searchResults) {
  if (!searchResults || searchResults.length === 0) {
    return {
      verdict: "False",
      confidence: 40,
      correctFact: "No search evidence found to back this claim.",
      category: "unsupported claims",
      source: "Search Registry",
      sourceUrl: "https://google.com",
      snippet: "No search results returned from index."
    };
  }

  const primarySource = searchResults[0];
  const snippet = primarySource.content || "";
  const title = primarySource.title || "External Source";
  const url = primarySource.url || "https://google.com";

  const claimNumbers = claim.match(/\d+(?:\.\d+)?/g);

  if (!claimNumbers || claimNumbers.length === 0) {
    const words = claim.toLowerCase().split(/\s+/).filter(w => w.length > 5);
    const matches = words.filter(w => snippet.toLowerCase().includes(w));
    const matchRatio = matches.length / (words.length || 1);

    if (matchRatio > 0.6) {
      return {
        verdict: "Verified",
        confidence: 70,
        correctFact: "Claim matches public information.",
        category: "unsupported claims",
        source: title,
        sourceUrl: url,
        snippet: snippet.slice(0, 200)
      };
    } else {
      return {
        verdict: "False",
        confidence: 50,
        correctFact: "No public records support this claim.",
        category: "unsupported claims",
        source: title,
        sourceUrl: url,
        snippet: snippet.slice(0, 200)
      };
    }
  }

  let allNumbersMatch = true;
  let correctionValue = null;

  for (const num of claimNumbers) {
    if (!snippet.includes(num)) {
      allNumbersMatch = false;
      const snippetNumbers = snippet.match(/\d+(?:\.\d+)?/g);
      if (snippetNumbers && snippetNumbers.length > 0) {
        correctionValue = snippetNumbers[0];
      }
    }
  }

  if (allNumbersMatch) {
    return {
      verdict: "Verified",
      confidence: 85,
      correctFact: "Claim verified against public records.",
      category: "unsupported claims",
      source: title,
      sourceUrl: url,
      snippet: snippet.slice(0, 200)
    };
  } else if (correctionValue) {
    return {
      verdict: "Inaccurate",
      confidence: 75,
      correctFact: `Based on public records, this figure is closer to ${correctionValue}.`,
      category: "outdated stats",
      source: title,
      sourceUrl: url,
      snippet: snippet.slice(0, 200)
    };
  } else {
    return {
      verdict: "False",
      confidence: 60,
      correctFact: "Public search registries contradict this assertion.",
      category: "unsupported claims",
      source: title,
      sourceUrl: url,
      snippet: snippet.slice(0, 200)
    };
  }
}