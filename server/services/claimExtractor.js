import axios from 'axios';

export async function extractClaimsWithAI(text, geminiApiKey, openaiApiKey) {
  if (!geminiApiKey && !openaiApiKey) {
    throw new Error('LLM API credentials (Gemini or OpenAI key) are required to extract claims from the uploaded file.');
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
${text.slice(0, 20000)}
---`;

  let claims = null;
  let lastError = null;
  const attempts = [];

  if (geminiApiKey) {
    attempts.push({
      name: 'Gemini 1.5 Flash',
      fn: async () => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        const response = await axios.post(url, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        });
        const jsonText = response.data.candidates[0].content.parts[0].text;
        return JSON.parse(jsonText.trim());
      }
    });
    attempts.push({
      name: 'Gemini 2.0 Flash',
      fn: async () => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
        const response = await axios.post(url, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        });
        const jsonText = response.data.candidates[0].content.parts[0].text;
        return JSON.parse(jsonText.trim());
      }
    });
  }

  if (openaiApiKey) {
    attempts.push({
      name: 'OpenAI GPT-4o-mini',
      fn: async () => {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a precise claim extractor returning JSON.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
          },
          {
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const content = response.data.choices[0].message.content;
        const parsed = JSON.parse(content.trim());
        if (Array.isArray(parsed)) return parsed;
        if (parsed.claims && Array.isArray(parsed.claims)) return parsed.claims;
        throw new Error('Invalid response structure returned by OpenAI');
      }
    });
  }

  for (const attempt of attempts) {
    try {
      claims = await attempt.fn();
      if (Array.isArray(claims)) {
        return claims;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError && (geminiApiKey || openaiApiKey)) {
    const apiErrMsg = lastError.response?.data?.error?.message || lastError.message;
    throw new Error(`AI Claim Extraction failed. API Details: ${apiErrMsg}`);
  }

  try {
    const localClaims = extractClaimsHeuristically(text);
    if (localClaims && localClaims.length > 0) {
      return localClaims;
    }
  } catch (heurErr) {
  }

  throw new Error(`LLM Factual Claim Extraction failed. Last error: ${lastError ? lastError.message : 'Unknown'}`);
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
