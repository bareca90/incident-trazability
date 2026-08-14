const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  await p.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;`);
  await p.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA trazabilidad;`);
  await p.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
  console.log('Extensions created successfully');
}

main().catch(console.error).finally(() => p.$disconnect());
