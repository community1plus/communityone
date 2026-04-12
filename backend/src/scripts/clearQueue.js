// scripts/clearQueue.js

import { Queue } from "bullmq";
import { connection } from "../../queue/connection.js";

const ingestQueue = new Queue("ingest", { connection });
const dedupQueue = new Queue("dedup", { connection });

async function clearQueue(queue) {
  console.log(`🧹 Clearing ${queue.name}...`);

  await queue.obliterate({ force: true });

  console.log(`✅ ${queue.name} fully cleared`);
}

async function run() {
  await clearQueue(ingestQueue);
  await clearQueue(dedupQueue);
}

run();