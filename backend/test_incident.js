const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const triggers = await p.$queryRawUnsafe(`
    SELECT trigger_name, event_manipulation, event_object_table, action_statement 
    FROM information_schema.triggers 
    WHERE event_object_schema = 'trazabilidad';
  `);
  console.log('Triggers:', triggers);

  const user = await p.user.findFirst();
  console.log('User found:', user?.id, user?.username);

  if (user) {
    try {
      const inc = await p.incident.create({
        data: {
          numero: 'INC-20260813-0001',
          titulo: 'Test Incident',
          descripcion: 'Test Description for verification',
          reportadoPor: user.id,
        }
      });
      console.log('Created incident:', inc);
    } catch (err) {
      console.error('Error creating incident:', err);
    }
  }
}

main().catch(console.error).finally(() => p.$disconnect());
