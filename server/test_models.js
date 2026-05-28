import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const geminiKey = process.env.GEMINI_API_KEY;

async function checkModels() {
  console.log("====================================================");
  console.log("   Fact Checker - AI Free Tier Model Registry Check ");
  console.log("====================================================\n");

  console.log("1. Environment Key Check:");
  if (geminiKey) {
    console.log(`   - GEMINI_API_KEY: Found (ending in ...${geminiKey.slice(-5)})`);
  } else {
    console.log("   - GEMINI_API_KEY: NOT FOUND in server/.env");
  }
  
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    console.log(`   - OPENAI_API_KEY: Found (ending in ...${openaiKey.slice(-5)})`);
  } else {
    console.log("   - OPENAI_API_KEY: NOT FOUND in server/.env");
  }
  console.log("");

  // Check Gemini Models
  if (geminiKey) {
    console.log("2. Querying Google AI Studio for Available Gemini Models...");
    try {
      const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      const models = response.data.models || [];
      console.log(`   - Connection: SUCCESS! Found ${models.length} models.\n`);
      
      console.log("   --- ACTIVE COMPATIBLE GEMINI MODELS ---");
      models.forEach(m => {
        const name = m.name.replace("models/", "");
        const supportsGenerate = m.supportedGenerationMethods.includes("generateContent");
        
        if (supportsGenerate && (name.includes("1.5") || name.includes("2.0") || name.includes("2.5"))) {
          console.log(`   • Model ID: "${name}"`);
          console.log(`     Display:  ${m.displayName}`);
          console.log(`     Limits:   Input Max: ${m.inputTokenLimit} tokens | Output Max: ${m.outputTokenLimit} tokens`);
          console.log(`     Description: ${m.description || "No description provided."}`);
          console.log("   -------------------------------------------------");
        }
      });
    } catch (err) {
      console.error("   - Connection: FAILED");
      console.error(`     Reason: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  console.log("\n3. Known Free Tier AI Model Reference & Recommendations:");
  console.log("=============================================================");
  console.log(" A. GOOGLE GEMINI FREE TIER");
  console.log("    Google AI Studio offers a generous FREE tier with 100% free usage:");
  console.log("    - gemini-2.0-flash (Recommended)");
  console.log("      Rate Limits: 15 RPM (Requests Per Minute) | 1,000 RPD (Requests Per Day)");
  console.log("      Cost: $0.00 (No billing or credit card required)");
  console.log("    - gemini-1.5-flash");
  console.log("      Rate Limits: 15 RPM | 1,000 RPD");
  console.log("      Cost: $0.00");
  console.log("    - gemini-1.5-pro");
  console.log("      Rate Limits: 2 RPM | 50 RPD (Low daily limits, best for pro extractions)");
  console.log("      Cost: $0.00");
  console.log("");
  console.log(" B. OPENAI GPT FREE TIER");
  console.log("    - OpenAI does NOT provide a true ongoing free-tier API.");
  console.log("    - API usage requires a funded Developer account with pre-paid credits.");
  console.log("    - If your credits are exhausted, OpenAI calls will fail with a 429 error.");
  console.log("    - Recommended cheapest model if using paid OpenAI: 'gpt-4o-mini'");
  console.log("=============================================================");
}

checkModels();
