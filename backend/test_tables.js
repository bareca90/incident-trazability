const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const { PrismaMenuRepository } = require('./dist/infrastructure/database/repositories/PrismaMenuRepository');

async function main() {
  const repo = new PrismaMenuRepository();
  const menus = await repo.findAllMenus();
  console.log('ALL MENUS COUNT:', menus.length);
  menus.forEach(m => {
    console.log(`- [${m.codigo}] ${m.nombre} (${m.options?.length || 0} opciones)`);
  });

  const users = await p.user.findMany({ select: { id: true, username: true } });
  if (users.length > 0) {
    const adminUser = users.find(u => u.username === 'admin') || users[0];
    const userMenus = await repo.findUserMenus(adminUser.id, true);
    console.log(`Admin user [${adminUser.username}] accessible menus:`, userMenus.length);

    const userPerms = await repo.findUserPermissions(adminUser.id, true);
    console.log(`Admin user [${adminUser.username}] permissions count:`, userPerms.length);
  }
}

main().catch(console.error).finally(() => p.$disconnect());
