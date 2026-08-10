import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/frontline_triage',
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.55'),
  promptVersion: process.env.PROMPT_VERSION || 'v1.3',
  modelName: process.env.MODEL_NAME || 'gemini-2.5-flash',
};
