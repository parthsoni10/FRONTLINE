import { connectDB } from '../src/config/db.js';
import { Message } from '../src/models/Message.js';
import { TriageResult } from '../src/models/TriageResult.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { GroundTruth } from '../src/models/GroundTruth.js';
import { EvalRun } from '../src/models/EvalRun.js';
import { ingestMessages, seedGroundTruth } from '../src/services/loader.js';

async function seed() {
  console.log('--- Frontline Triage AI Database Seeder ---');
  await connectDB();

  console.log('[1/3] Clearing existing collections...');
  await Message.deleteMany({});
  await TriageResult.deleteMany({});
  await AuditLog.deleteMany({});
  await GroundTruth.deleteMany({});
  await EvalRun.deleteMany({});

  console.log('[2/3] Ingesting 40 dataset messages...');
  const messages = await ingestMessages();
  console.log(`✓ Seeded ${messages.length} raw messages into MongoDB.`);

  console.log('[3/3] Seeding 10 GroundTruth labels...');
  const groundTruths = await seedGroundTruth(messages);
  console.log(`✓ Seeded ${groundTruths.length} ground truth records.`);

  console.log('\n✓ Database seeding completed successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
