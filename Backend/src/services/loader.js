import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Message } from '../models/Message.js';
import { GroundTruth } from '../models/GroundTruth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function computeHash(text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

export async function loadRawDataset() {
  const filePath = path.resolve(__dirname, '../../data/messages_raw.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function ingestMessages() {
  const rawMessages = await loadRawDataset();
  const ingested = [];

  for (const item of rawMessages) {
    const hash = computeHash(item.rawText);
    const existing = await Message.findOne({ contentHash: hash });

    if (existing) {
      ingested.push(existing);
    } else {
      const doc = await Message.create({
        externalId: item.externalId,
        rawText: item.rawText,
        source: 'dataset',
        contentHash: hash,
      });
      ingested.push(doc);
    }
  }

  return ingested;
}

export async function loadGroundTruthCsv() {
  const csvPath = path.resolve(__dirname, '../../data/ground_truth.csv');
  if (!fs.existsSync(csvPath)) return [];

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',');
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length >= 4) {
      records.push({
        externalId: cols[0],
        category: cols[1],
        priority: cols[2],
        needsHuman: cols[3].toLowerCase() === 'true',
        notes: cols[4] || '',
      });
    }
  }

  return records;
}

export async function seedGroundTruth(messages) {
  const rawGt = await loadGroundTruthCsv();
  const seeded = [];

  for (const gt of rawGt) {
    const msgDoc = messages.find((m) => m.externalId === gt.externalId);
    if (!msgDoc) continue;

    const existing = await GroundTruth.findOne({ messageId: msgDoc._id });
    if (existing) {
      seeded.push(existing);
    } else {
      const created = await GroundTruth.create({
        messageId: msgDoc._id,
        externalId: gt.externalId,
        category: gt.category,
        priority: gt.priority,
        needsHuman: gt.needsHuman,
        notes: gt.notes,
        labeledBy: 'human',
      });
      seeded.push(created);
    }
  }

  return seeded;
}
