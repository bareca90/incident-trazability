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
          codigo: 'CONF_SISTEMAS',
          nombre: 'Sistemas Afectados',
          descripcion: 'Catálogo y gestión de sistemas informáticos afectados por incidencias',
          ruta: '/sistemas',
          icono: 'dns',
          orden: 2,
          activo: true,
        },
        {
          codigo: 'SEG_BITACORA',
          nombre: 'Logs de Auditoría',
          descripcion: 'Historial detallado de operaciones y bitácora de seguridad',
          ruta: '/audit-logs',
          icono: 'receipt_long',
          orden: 3,
          activo: true,
        },
      ],
    },
  ];

  // Seed Systems
  const defaultSystems = [
    { codigo: 'SYS_FACTURACION', nombre: 'Sistema de Facturación Electrónica', descripcion: 'Emisión, anulación y timbrado de comprobantes electrónicos' },
    { codigo: 'SYS_ERP', nombre: 'ERP Financiero y Contable', descripcion: 'Módulos de contabilidad, cuentas por pagar/cobrar y tesorería' },
    { codigo: 'SYS_PORTAL', nombre: 'Portal de Clientes B2B', descripcion: 'Plataforma web de autogestión de pedidos y facturas para clientes' },
    { codigo: 'SYS_WMS', nombre: 'WMS Logística y Bodegas', descripcion: 'Control de inventarios, despachos y recepciones en centro de distribución' },
    { codigo: 'SYS_NOMINA', nombre: 'Nómina y Recursos Humanos', descripcion: 'Cálculo de sueldos, asistencias y beneficios sociales' },
  ];

  for (const sys of defaultSystems) {
    await prisma.system.upsert({
      where: { codigo: sys.codigo },
      update: { nombre: sys.nombre, descripcion: sys.descripcion, activo: true },
      create: { ...sys, activo: true },
    });
    console.log(`System [${sys.codigo}] upserted`);
  }

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

  // Crear roles estándar si no existen
  const defaultRoles = [
    { codigo: 'CONSULTOR', nombre: 'Consultor de Incidencias', descripcion: 'Acceso de solo lectura a incidencias y soluciones', esAdmin: false },
    { codigo: 'DESARROLLADOR', nombre: 'Desarrollador / Técnico', descripcion: 'Registro, edición y resolución de incidencias', esAdmin: false },
    { codigo: 'OPERADOR', nombre: 'Operador de Soporte', descripcion: 'Apertura y seguimiento de incidencias', esAdmin: false },
  ];

  for (const roleData of defaultRoles) {
    await prisma.role.upsert({
      where: { codigo: roleData.codigo },
      update: { nombre: roleData.nombre, descripcion: roleData.descripcion },
      create: roleData,
    });
    console.log(`Role [${roleData.codigo}] upserted`);
  }

  // Definir matriz de permisos por defecto para roles no-admin
  const rolePermissionsMap = {
    CONSULTOR: [
      { codigoOpcion: 'INC_LISTA', acceso: 'ver' },
      { codigoOpcion: 'INC_DETALLE', acceso: 'ver' },
      { codigoOpcion: 'CONF_SISTEMAS', acceso: 'ver' },
    ],
    DESARROLLADOR: [
      { codigoOpcion: 'INC_LISTA', acceso: 'ver' },
      { codigoOpcion: 'INC_NUEVA', acceso: 'ver' },
      { codigoOpcion: 'INC_NUEVA', acceso: 'crear' },
      { codigoOpcion: 'INC_DETALLE', acceso: 'ver' },
      { codigoOpcion: 'INC_DETALLE', acceso: 'editar' },
      { codigoOpcion: 'SOL_PASOS', acceso: 'ver' },
      { codigoOpcion: 'SOL_PASOS', acceso: 'crear' },
      { codigoOpcion: 'SOL_PASOS', acceso: 'editar' },
      { codigoOpcion: 'CONF_SISTEMAS', acceso: 'ver' },
    ],
    OPERADOR: [
      { codigoOpcion: 'INC_LISTA', acceso: 'ver' },
      { codigoOpcion: 'INC_NUEVA', acceso: 'ver' },
      { codigoOpcion: 'INC_NUEVA', acceso: 'crear' },
      { codigoOpcion: 'INC_DETALLE', acceso: 'ver' },
      { codigoOpcion: 'CONF_SISTEMAS', acceso: 'ver' },
    ],
  };

  const allOptions = await prisma.menuOption.findMany();
  const optionMap = new Map(allOptions.map((o) => [o.codigo, o.id]));

  for (const [roleCodigo, perms] of Object.entries(rolePermissionsMap)) {
    const role = await prisma.role.findUnique({ where: { codigo: roleCodigo } });
    if (!role) continue;

    for (const p of perms) {
      const menuOptionId = optionMap.get(p.codigoOpcion);
      if (!menuOptionId) continue;

      await prisma.roleOptionAccess.upsert({
        where: {
          roleId_menuOptionId_acceso: {
            roleId: role.id,
            menuOptionId,
            acceso: p.acceso,
          },
        },
        update: { permitido: true },
        create: {
          roleId: role.id,
          menuOptionId,
          acceso: p.acceso,
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

