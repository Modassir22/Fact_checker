import { GoogleGenerativeAI } from '@google/generative-ai';

function cleanJsonResponse(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const FREE_TIER_MODELS = [
  "gemini-2.5-flash-lite"
];

async function callGeminiWithSDK(apiKey, prompt, modelName, name) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 512,
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

      return parsed;

    } catch (err) {
      attempt++;
      const errMsg = err.message || "";
      console.error(`[${name}] Attempt ${attempt} failed: ${errMsg}`);

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

export async function extractClaimsWithAI(text, geminiApiKey, openaiApiKey) {
  const keyToUse = geminiApiKey || process.env.GEMINI_API_KEY;
  if (!keyToUse) {
    throw new Error('LLM API credentials (Gemini API Key) are required to extract claims from the uploaded file.');
  }

  const prompt = `You are a professional Claim Extraction Engine.
Analyze the following text and extract all specific, verifiable factual statements (aim for 10 to 25 claims if the text is long and dense, otherwise extract all key claims).
Focus on extracting:
1. Statistics and percentages
2. Dates, years, and timelines
3. Financial figures
4. Measurable assertions of technical or company capabilities.

Do NOT extract soft opinions, vague generalizations, or speculative sentences.
Return ONLY a valid JSON array of strings containing the extracted claims. Do not wrap in markdown or include any explanations.

Example Output:
[
  "The Earth revolves around the sun in approximately 365.25 days.",
  "Mount Everest stands at an official elevation of 8,848 meters."
]

Text to analyze:
---
${text.slice(0, 15000)}
---`;

  const attempts = [];
  const envGeminiKey = process.env.GEMINI_API_KEY;

  for (const modelName of FREE_TIER_MODELS) {
    if (geminiApiKey) {
      attempts.push({
        name: `${modelName} (Custom Key)`,
        fn: () => callGeminiWithSDK(geminiApiKey, prompt, modelName, `${modelName} (Custom Key)`)
      });
    }
    if (envGeminiKey && envGeminiKey !== geminiApiKey) {
      attempts.push({
        name: `${modelName} (Env Fallback)`,
        fn: () => callGeminiWithSDK(envGeminiKey, prompt, modelName, `${modelName} (Env Fallback)`)
      });
    }
  }

  let lastError = null;
  const attemptErrors = [];

  for (const attempt of attempts) {
    try {
      console.log(`Trying model: ${attempt.name}...`);
      const claims = await attempt.fn();
      if (Array.isArray(claims)) {
        console.log(`Success with: ${attempt.name}`);
        return claims;
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
    console.warn(`All AI attempts failed. Falling back to heuristic extraction.\nError log:\n${attemptErrors.join('\n')}`);
  }

  try {
    const localClaims = extractClaimsHeuristically(text);
    if (localClaims && localClaims.length > 0) {
      console.log(`Heuristic fallback returned ${localClaims.length} claims.`);
      return localClaims;
    }
  } catch (heurErr) {
    console.error("Heuristic Claim Extraction failed:", heurErr);
  }

  if (lastError) {
    throw new Error(
      `AI Claim Extraction failed across all models.\n` +
      `Error log:\n${attemptErrors.map(e => `• ${e}`).join('\n')}\n\n` +
      `[Action Required]: Your free tier quota may be exhausted for today. ` +
      `Please wait until midnight (quota resets daily) or use a new API key from https://aistudio.google.com`
    );
  }

  throw new Error(`Claim Extraction failed. No AI or heuristic claims could be produced.`);
}

function extractClaimsHeuristically(text) {
  const sentences = text
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 250);

  const claims = [];
  const patterns = [
    /\d+(\.\d+)?%/,
    /\$\d+/,
    /\b(19|20)\d{2}\b/,
    /\b(million|billion|trillion)\b/i,
    /\b(increase|decrease|growth|dropped|acquired|merged|launched|official|founded|users|revenue|profit)\b/i
  ];

  for (const sentence of sentences) {
    const isClaim = patterns.some(pattern => pattern.test(sentence));
    if (isClaim) {
      const cleanSentence = sentence.replace(/\s+/g, ' ').trim();
      if (!claims.includes(cleanSentence)) {
        claims.push(cleanSentence);
      }
    }
    if (claims.length >= 20) break;
  }

  if (claims.length === 0) {
    return sentences.slice(0, 10).map(s => s.replace(/\s+/g, ' ').trim());
  }

  return claims;
}