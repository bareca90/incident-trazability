const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const tables = await p.$queryRawUnsafe(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name;
  `);
  console.log('Tables in database:', tables);
}

main().catch(console.error).finally(() => p.$disconnect());
