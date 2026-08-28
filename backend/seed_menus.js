const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding menus and menu options...');

  const menusData = [
    {
      codigo: 'INCIDENCIAS',
      nombre: 'Incidencias y Soluciones',
      descripcion: 'Gestión y trazabilidad de incidencias y pasos de solución técnica',
      icono: 'bug_report',
      orden: 1,
      activo: true,
      options: [
        {
          codigo: 'INC_LISTA',
          nombre: 'Consulta de Incidencias',
          descripcion: 'Bandeja principal y búsqueda avanzada de incidencias',
          ruta: '/incidencias',
          icono: 'list_alt',
          orden: 1,
          activo: true,
        },
        {
          codigo: 'INC_NUEVA',
          nombre: 'Registro de Incidencias',
          descripcion: 'Formulario de registro y apertura de nueva incidencia',
          ruta: '/incidencias/nueva',
          icono: 'add_circle',
          orden: 2,
          activo: true,
        },
        {
          codigo: 'INC_DETALLE',
          nombre: 'Detalle de Incidencia',
          descripcion: 'Vista de detalle, edición y trazabilidad de resolución',
          ruta: '/incidencias/:id',
          icono: 'visibility',
          orden: 3,
          activo: true,
        },
        {
          codigo: 'SOL_PASOS',
          nombre: 'Pasos de Solución y Scripts',
          descripcion: 'Registro y ejecución de pasos técnicos, consultas SQL y rollbacks',
          ruta: '/incidencias/:id/pasos',
          icono: 'terminal',
          orden: 4,
          activo: true,
        },
      ],
    },
    {
      codigo: 'SEGURIDAD',
      nombre: 'Gestión de Usuarios y Seguridad',
      descripcion: 'Administración de usuarios, roles de seguridad y asignación de accesos',
      icono: 'admin_panel_settings',
      orden: 2,
      activo: true,
      options: [
        {
          codigo: 'USR_LISTA',
          nombre: 'Gestión de Usuarios',
          descripcion: 'Consulta y administración de cuentas de usuario',
          ruta: '/usuarios',
          icono: 'group',
          orden: 1,
          activo: true,
        },
        {
          codigo: 'USR_CREAR',
          nombre: 'Registro de Usuario',
          descripcion: 'Creación de nuevas cuentas de usuario',
          ruta: '/usuarios',
          icono: 'person_add',
          orden: 2,
          activo: true,
        },
        {
          codigo: 'USR_EDITAR',
          nombre: 'Edición de Usuario',
          descripcion: 'Actualización de datos y roles de usuario',
          ruta: '/usuarios',
          icono: 'manage_accounts',
          orden: 3,
          activo: true,
        },
        {
          codigo: 'SEG_ROLES',
          nombre: 'Roles de Seguridad',
          descripcion: 'Definición de roles y perfiles en el sistema',
          ruta: '/roles',
          icono: 'shield',
          orden: 4,
          activo: true,
        },
        {
          codigo: 'SEG_PERMISOS',
          nombre: 'Matriz de Permisos',
          descripcion: 'Configuración granular de accesos por rol y pantalla',
          ruta: '/roles',
          icono: 'lock_person',
          orden: 5,
          activo: true,
        },
      ],
    },
    {
      codigo: 'CONFIGURACION',
      nombre: 'Configuración y Auditoría',
      descripcion: 'Configuración del sistema, estructura de menús y bitácoras de auditoría',
      icono: 'settings',
      orden: 3,
      activo: true,
      options: [
        {
          codigo: 'CONF_MENUS',
          nombre: 'Gestión de Menús y Opciones',
          descripcion: 'Consulta, registro y edición de pantallas y opciones del menú',
          ruta: '/menus',
          icono: 'menu_open',
          orden: 1,
          activo: true,
        },
        {
          codigo: 'SEG_BITACORA',
          nombre: 'Logs de Auditoría',
          descripcion: 'Historial detallado de operaciones y bitácora de seguridad',
          ruta: '/audit-logs',
          icono: 'receipt_long',
          orden: 2,
          activo: true,
        },
      ],
    },
  ];

  for (const menuData of menusData) {
    const { options, ...mFields } = menuData;
    const menu = await prisma.menu.upsert({
      where: { codigo: mFields.codigo },
      update: {
        nombre: mFields.nombre,
        descripcion: mFields.descripcion,
        icono: mFields.icono,
        orden: mFields.orden,
        activo: mFields.activo,
      },
      create: mFields,
    });

    console.log(`Menu [${menu.codigo}] upserted with ID ${menu.id}`);

    for (const opt of options) {
      await prisma.menuOption.upsert({
        where: { codigo: opt.codigo },
        update: {
          menuId: menu.id,
          nombre: opt.nombre,
          descripcion: opt.descripcion,
          ruta: opt.ruta,
          icono: opt.icono,
          orden: opt.orden,
          activo: opt.activo,
        },
        create: {
          ...opt,
          menuId: menu.id,
        },
      });
      console.log(`  Option [${opt.codigo}] upserted`);
    }
  }

  // Asignar permisos automáticos al rol 'CONSULTOR' si existe para que pueda consultar incidencias
  const consultorRole = await prisma.role.findUnique({ where: { codigo: 'CONSULTOR' } });
  if (consultorRole) {
    const incListaOpt = await prisma.menuOption.findUnique({ where: { codigo: 'INC_LISTA' } });
    const incDetalleOpt = await prisma.menuOption.findUnique({ where: { codigo: 'INC_DETALLE' } });
    
    if (incListaOpt) {
      await prisma.roleOptionAccess.upsert({
        where: {
          roleId_menuOptionId_acceso: {
            roleId: consultorRole.id,
            menuOptionId: incListaOpt.id,
            acceso: 'ver',
          },
        },
        update: { permitido: true },
        create: {
          roleId: consultorRole.id,
          menuOptionId: incListaOpt.id,
          acceso: 'ver',
          permitido: true,
        },
      });
    }

    if (incDetalleOpt) {
      await prisma.roleOptionAccess.upsert({
        where: {
          roleId_menuOptionId_acceso: {
            roleId: consultorRole.id,
            menuOptionId: incDetalleOpt.id,
            acceso: 'ver',
          },
        },
        update: { permitido: true },
        create: {
          roleId: consultorRole.id,
          menuOptionId: incDetalleOpt.id,
          acceso: 'ver',
          permitido: true,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
