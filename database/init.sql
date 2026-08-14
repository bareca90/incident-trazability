-- =============================================================================
-- INIT.SQL — Trazabilidad de Incidencias
-- Motor: PostgreSQL 16
-- Encoding: UTF-8
-- Descripcion: Esquema relacional completo para gestion de incidencias,
--              control de accesos y trazabilidad de acciones de usuario.
-- =============================================================================

-- Habilitar extension para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SCHEMA PRINCIPAL
-- =============================================================================
CREATE SCHEMA IF NOT EXISTS trazabilidad;
SET search_path TO trazabilidad, public;

-- =============================================================================
-- TIPOS ENUMERADOS
-- =============================================================================

CREATE TYPE estado_usuario     AS ENUM ('activo', 'inactivo', 'bloqueado', 'pendiente');
CREATE TYPE tipo_acceso        AS ENUM ('ver', 'crear', 'editar', 'eliminar', 'exportar', 'aprobar');
CREATE TYPE nivel_log          AS ENUM ('info', 'warning', 'error', 'critico', 'debug');
CREATE TYPE estado_incidencia  AS ENUM ('abierta', 'en_proceso', 'resuelta', 'cerrada', 'cancelada', 'reabierta');
CREATE TYPE prioridad          AS ENUM ('baja', 'media', 'alta', 'critica');
CREATE TYPE tipo_paso          AS ENUM ('consulta_sql', 'comando', 'nota', 'archivo', 'configuracion', 'diagnostico', 'rollback', 'otro');
CREATE TYPE tipo_adjunto       AS ENUM ('imagen', 'documento', 'script', 'log', 'comprimido', 'otro');

-- =============================================================================
-- 1. TABLA: users (Usuarios del sistema)
-- =============================================================================
CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(80)     NOT NULL UNIQUE,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,
    nombres         VARCHAR(150)    NOT NULL,
    apellidos       VARCHAR(150)    NOT NULL,
    telefono        VARCHAR(25),
    avatar_url      TEXT,
    estado          estado_usuario  NOT NULL DEFAULT 'pendiente',
    intentos_login  SMALLINT        NOT NULL DEFAULT 0,
    ultimo_login    TIMESTAMPTZ,
    must_change_pwd BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ     -- soft-delete

    CONSTRAINT chk_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_intentos CHECK (intentos_login >= 0)
);

COMMENT ON TABLE  users IS 'Usuarios del sistema de trazabilidad de incidencias';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt/argon2 de la contrasena. Nunca texto plano.';
COMMENT ON COLUMN users.estado IS 'Estado de la cuenta: activo, inactivo, bloqueado, pendiente';
COMMENT ON COLUMN users.must_change_pwd IS 'Obliga al usuario a cambiar la contrasena en el proximo login';

-- =============================================================================
-- 2. TABLA: menus (Agrupacion de opciones en menus)
-- =============================================================================
CREATE TABLE menus (
    id          SERIAL          PRIMARY KEY,
    codigo      VARCHAR(50)     NOT NULL UNIQUE,
    nombre      VARCHAR(150)    NOT NULL,
    descripcion TEXT,
    icono       VARCHAR(100),
    orden       SMALLINT        NOT NULL DEFAULT 0,
    activo      BOOLEAN         NOT NULL DEFAULT TRUE,
    parent_id   INTEGER         REFERENCES menus(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE menus IS 'Agrupacion jerarquica de menus. Soporta submenus via parent_id';

-- =============================================================================
-- 3. TABLA: menu_options (Opciones/pantallas dentro de cada menu)
-- =============================================================================
CREATE TABLE menu_options (
    id          SERIAL          PRIMARY KEY,
    menu_id     INTEGER         NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    codigo      VARCHAR(100)    NOT NULL UNIQUE,
    nombre      VARCHAR(200)    NOT NULL,
    descripcion TEXT,
    ruta        VARCHAR(500),
    icono       VARCHAR(100),
    orden       SMALLINT        NOT NULL DEFAULT 0,
    activo      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  menu_options IS 'Opciones navegables dentro de un menu. Mapeadas a rutas del frontend.';
COMMENT ON COLUMN menu_options.ruta IS 'Ruta del frontend (ej: /incidencias/lista)';

-- =============================================================================
-- 4. TABLA: roles (Roles de seguridad)
-- =============================================================================
CREATE TABLE roles (
    id          SERIAL          PRIMARY KEY,
    codigo      VARCHAR(80)     NOT NULL UNIQUE,
    nombre      VARCHAR(150)    NOT NULL,
    descripcion TEXT,
    es_admin    BOOLEAN         NOT NULL DEFAULT FALSE,
    activo      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  roles IS 'Roles de seguridad del sistema. Un rol agrupa permisos sobre opciones de menu.';
COMMENT ON COLUMN roles.es_admin IS 'Si TRUE el rol tiene acceso irrestricto (super-admin)';

-- =============================================================================
-- 5. TABLA: user_roles (Asignacion de roles a usuarios — N:M)
-- =============================================================================
CREATE TABLE user_roles (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     INTEGER         NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    asignado_por UUID           REFERENCES users(id) ON DELETE SET NULL,
    vigencia_desde  DATE        NOT NULL DEFAULT CURRENT_DATE,
    vigencia_hasta  DATE,
    activo      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_role UNIQUE (user_id, role_id),
    CONSTRAINT chk_vigencia CHECK (vigencia_hasta IS NULL OR vigencia_hasta >= vigencia_desde)
);

COMMENT ON TABLE user_roles IS 'Relacion N:M entre usuarios y roles, con vigencia y trazabilidad del asignador.';

-- =============================================================================
-- 6. TABLA: role_option_access (Permisos de un rol sobre una opcion de menu)
-- =============================================================================
CREATE TABLE role_option_access (
    id              BIGSERIAL       PRIMARY KEY,
    role_id         INTEGER         NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    menu_option_id  INTEGER         NOT NULL REFERENCES menu_options(id) ON DELETE CASCADE,
    acceso          tipo_acceso     NOT NULL,
    permitido       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_role_option_acceso UNIQUE (role_id, menu_option_id, acceso)
);

COMMENT ON TABLE  role_option_access IS 'Permisos granulares: que acciones puede hacer un rol sobre cada opcion de menu.';
COMMENT ON COLUMN role_option_access.acceso IS 'Tipo de acceso: ver, crear, editar, eliminar, exportar, aprobar';
COMMENT ON COLUMN role_option_access.permitido IS 'TRUE = permitido, FALSE = denegado explicitamente (deny)';

-- =============================================================================
-- 7. TABLA: audit_logs (Bitacora de acciones de usuario)
-- =============================================================================
CREATE TABLE audit_logs (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         UUID            REFERENCES users(id) ON DELETE SET NULL,
    session_id      VARCHAR(128),
    nivel           nivel_log       NOT NULL DEFAULT 'info',
    modulo          VARCHAR(100),
    accion          VARCHAR(200)    NOT NULL,
    descripcion     TEXT,
    -- Valores antes/despues del cambio (para ediciones)
    valor_anterior  JSONB,
    valor_nuevo     JSONB,
    -- Referencia al recurso afectado
    entidad         VARCHAR(100),
    entidad_id      VARCHAR(100),
    -- Datos de red
    ip_address      INET,
    user_agent      TEXT,
    -- Resultado
    exitoso         BOOLEAN         NOT NULL DEFAULT TRUE,
    detalle_error   TEXT,
    duracion_ms     INTEGER,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
)
PARTITION BY RANGE (created_at);

COMMENT ON TABLE  audit_logs IS 'Bitacora inmutable de todas las acciones de usuario. Particionada por mes.';
COMMENT ON COLUMN audit_logs.valor_anterior IS 'Estado del registro ANTES del cambio (JSON). Para operaciones UPDATE/DELETE.';
COMMENT ON COLUMN audit_logs.valor_nuevo    IS 'Estado del registro DESPUES del cambio (JSON). Para INSERT/UPDATE.';
COMMENT ON COLUMN audit_logs.entidad        IS 'Nombre de la tabla/entidad afectada (ej: incidents, users)';
COMMENT ON COLUMN audit_logs.entidad_id     IS 'ID del registro afectado dentro de la entidad';
COMMENT ON COLUMN audit_logs.exitoso        IS 'FALSE si la operacion fallo (para logs de error)';

-- Particiones por anio/mes (extender segun necesidad)
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE audit_logs_2025_03 PARTITION OF audit_logs FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE audit_logs_2025_04 PARTITION OF audit_logs FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE audit_logs_2025_05 PARTITION OF audit_logs FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE audit_logs_2025_06 PARTITION OF audit_logs FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE audit_logs_2025_07 PARTITION OF audit_logs FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE audit_logs_2025_08 PARTITION OF audit_logs FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE audit_logs_2025_09 PARTITION OF audit_logs FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE audit_logs_2025_10 PARTITION OF audit_logs FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE audit_logs_2025_11 PARTITION OF audit_logs FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE audit_logs_2025_12 PARTITION OF audit_logs FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE audit_logs_2026_04 PARTITION OF audit_logs FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE audit_logs_2026_05 PARTITION OF audit_logs FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE audit_logs_2026_06 PARTITION OF audit_logs FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE audit_logs_2026_07 PARTITION OF audit_logs FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE audit_logs_2026_08 PARTITION OF audit_logs FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE audit_logs_2026_09 PARTITION OF audit_logs FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE audit_logs_2026_10 PARTITION OF audit_logs FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE audit_logs_2026_11 PARTITION OF audit_logs FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE audit_logs_2026_12 PARTITION OF audit_logs FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- =============================================================================
-- 8. TABLA: incidents (Cabecera de incidencias / soluciones)
-- =============================================================================
CREATE TABLE incidents (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero          VARCHAR(30)     NOT NULL UNIQUE,    -- ej: INC-2026-00001
    titulo          VARCHAR(500)    NOT NULL,
    descripcion     TEXT            NOT NULL,
    estado          estado_incidencia NOT NULL DEFAULT 'abierta',
    prioridad       prioridad       NOT NULL DEFAULT 'media',
    categoria       VARCHAR(150),
    subcategoria    VARCHAR(150),
    -- Ambiente/entorno afectado
    ambiente        VARCHAR(100),   -- produccion, staging, desarrollo
    servidor        VARCHAR(200),
    base_datos      VARCHAR(200),
    -- Responsables
    reportado_por   UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    asignado_a      UUID            REFERENCES users(id) ON DELETE SET NULL,
    -- Tiempos
    fecha_reporte   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    fecha_inicio    TIMESTAMPTZ,
    fecha_resolucion TIMESTAMPTZ,
    fecha_cierre    TIMESTAMPTZ,
    tiempo_resolucion_min INTEGER   GENERATED ALWAYS AS (
        CASE
            WHEN fecha_resolucion IS NOT NULL
            THEN EXTRACT(EPOCH FROM (fecha_resolucion - fecha_reporte))::INTEGER / 60
            ELSE NULL
        END
    ) STORED,
    -- Impacto
    impacto         TEXT,
    causa_raiz      TEXT,
    solucion_resumida TEXT,
    -- Control
    es_recurrente   BOOLEAN         NOT NULL DEFAULT FALSE,
    incident_padre  UUID            REFERENCES incidents(id) ON DELETE SET NULL,
    etiquetas       TEXT[],
    metadata        JSONB,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ

    CONSTRAINT chk_fechas_incidencia CHECK (
        fecha_inicio IS NULL OR fecha_inicio >= fecha_reporte
    )
);

COMMENT ON TABLE  incidents IS 'Cabecera de incidencias/soluciones. Una incidencia agrupa multiples pasos de solucion.';
COMMENT ON COLUMN incidents.numero IS 'Numero de ticket auto-generado en formato INC-AAAA-NNNNN';
COMMENT ON COLUMN incidents.tiempo_resolucion_min IS 'Columna calculada: minutos entre reporte y resolucion';
COMMENT ON COLUMN incidents.incident_padre IS 'Permite encadenar incidencias relacionadas o recurrentes';
COMMENT ON COLUMN incidents.etiquetas IS 'Array de etiquetas/tags para busqueda rapida';
COMMENT ON COLUMN incidents.metadata IS 'Datos adicionales no estructurados (JSON flexible)';

-- Secuencia para numeracion automatica de tickets
CREATE SEQUENCE IF NOT EXISTS incident_seq START WITH 1 INCREMENT BY 1;

-- Funcion para generar numero de ticket
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero IS NULL OR NEW.numero = '' THEN
        NEW.numero := 'INC-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                      LPAD(nextval('incident_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incident_number
    BEFORE INSERT ON incidents
    FOR EACH ROW EXECUTE FUNCTION generate_incident_number();

-- =============================================================================
-- 9. TABLA: solution_steps (Pasos detallados de resolucion)
-- =============================================================================
CREATE TABLE solution_steps (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id     UUID            NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    numero_paso     SMALLINT        NOT NULL,
    tipo            tipo_paso       NOT NULL DEFAULT 'nota',
    titulo          VARCHAR(300)    NOT NULL,
    descripcion     TEXT,
    -- Contenido especifico segun tipo
    contenido       TEXT,           -- SQL, comando, nota libre, etc.
    -- Contexto de ejecucion
    ambiente        VARCHAR(100),
    servidor        VARCHAR(200),
    base_datos      VARCHAR(200),
    usuario_db      VARCHAR(100),
    -- Resultado de la ejecucion
    resultado       TEXT,
    exitoso         BOOLEAN,
    tiempo_ejecucion_ms INTEGER,
    -- Control de versiones del paso
    version         SMALLINT        NOT NULL DEFAULT 1,
    es_rollback     BOOLEAN         NOT NULL DEFAULT FALSE,
    -- Responsable del paso
    ejecutado_por   UUID            REFERENCES users(id) ON DELETE SET NULL,
    revisado_por    UUID            REFERENCES users(id) ON DELETE SET NULL,
    fecha_ejecucion TIMESTAMPTZ,
    fecha_revision  TIMESTAMPTZ,
    -- Notas adicionales
    notas_internas  TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_incident_paso UNIQUE (incident_id, numero_paso),
    CONSTRAINT chk_numero_paso  CHECK (numero_paso > 0)
);

COMMENT ON TABLE  solution_steps IS 'Pasos detallados de resolucion de una incidencia. Cada paso puede ser SQL, comando, nota, etc.';
COMMENT ON COLUMN solution_steps.contenido IS 'Cuerpo del paso: query SQL, script de comando, texto de nota, etc.';
COMMENT ON COLUMN solution_steps.exitoso   IS 'NULL = no ejecutado todavia, TRUE = ok, FALSE = fallo';
COMMENT ON COLUMN solution_steps.es_rollback IS 'TRUE si este paso es un procedimiento de rollback/reversion';
COMMENT ON COLUMN solution_steps.version   IS 'Contador de versiones del paso (por si se edita y se desea historico)';

-- =============================================================================
-- 10. TABLA: step_attachments (Adjuntos de cada paso)
-- =============================================================================
CREATE TABLE step_attachments (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_id         UUID            NOT NULL REFERENCES solution_steps(id) ON DELETE CASCADE,
    tipo            tipo_adjunto    NOT NULL DEFAULT 'documento',
    nombre_original VARCHAR(500)    NOT NULL,
    nombre_storage  VARCHAR(500)    NOT NULL UNIQUE,   -- nombre en el sistema de archivos/S3
    ruta_storage    TEXT            NOT NULL,
    mime_type       VARCHAR(255),
    tamano_bytes    BIGINT,
    checksum_sha256 CHAR(64),
    descripcion     TEXT,
    subido_por      UUID            REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_tamano CHECK (tamano_bytes IS NULL OR tamano_bytes > 0)
);

COMMENT ON TABLE  step_attachments IS 'Archivos adjuntos de cada paso: capturas, scripts, logs, documentos, etc.';
COMMENT ON COLUMN step_attachments.nombre_storage IS 'Nombre unico con el que se almacena en disco o en el bucket S3/MinIO';
COMMENT ON COLUMN step_attachments.checksum_sha256 IS 'Hash SHA-256 para verificar integridad del archivo';

-- =============================================================================
-- INDICES DE RENDIMIENTO
-- =============================================================================

-- users
CREATE INDEX idx_users_email    ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_estado   ON users(estado);

-- user_roles
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- role_option_access
CREATE INDEX idx_roa_role   ON role_option_access(role_id);
CREATE INDEX idx_roa_option ON role_option_access(menu_option_id);

-- menu_options
CREATE INDEX idx_menu_options_menu  ON menu_options(menu_id);
CREATE INDEX idx_menu_options_orden ON menu_options(menu_id, orden);

-- audit_logs
CREATE INDEX idx_audit_user   ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_entidad ON audit_logs(entidad, entidad_id);
CREATE INDEX idx_audit_nivel   ON audit_logs(nivel, created_at DESC);
CREATE INDEX idx_audit_accion  ON audit_logs(accion);

-- incidents
CREATE INDEX idx_incidents_estado     ON incidents(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_incidents_prioridad  ON incidents(prioridad) WHERE deleted_at IS NULL;
CREATE INDEX idx_incidents_asignado   ON incidents(asignado_a) WHERE deleted_at IS NULL;
CREATE INDEX idx_incidents_reportado  ON incidents(reportado_por);
CREATE INDEX idx_incidents_fecha      ON incidents(fecha_reporte DESC);
CREATE INDEX idx_incidents_numero     ON incidents(numero);
CREATE INDEX idx_incidents_etiquetas  ON incidents USING GIN (etiquetas);
CREATE INDEX idx_incidents_metadata   ON incidents USING GIN (metadata);
CREATE INDEX idx_incidents_texto      ON incidents USING GIN (
    to_tsvector('spanish', titulo || ' ' || descripcion)
);

-- solution_steps
CREATE INDEX idx_steps_incident ON solution_steps(incident_id, numero_paso);
CREATE INDEX idx_steps_tipo     ON solution_steps(tipo);
CREATE INDEX idx_steps_ejecutado ON solution_steps(ejecutado_por);

-- step_attachments
CREATE INDEX idx_attachments_step ON step_attachments(step_id);
CREATE INDEX idx_attachments_tipo ON step_attachments(tipo);

-- =============================================================================
-- TRIGGERS: updated_at automatico
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_menu_options_updated_at
    BEFORE UPDATE ON menu_options
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_roa_updated_at
    BEFORE UPDATE ON role_option_access
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_incidents_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_solution_steps_updated_at
    BEFORE UPDATE ON solution_steps
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- VISTA: Permisos efectivos de un usuario (union de todos sus roles)
-- =============================================================================
CREATE OR REPLACE VIEW v_user_effective_permissions AS
SELECT DISTINCT
    u.id            AS user_id,
    u.username,
    mo.id           AS menu_option_id,
    mo.codigo       AS opcion_codigo,
    mo.nombre       AS opcion_nombre,
    mo.ruta,
    m.codigo        AS menu_codigo,
    m.nombre        AS menu_nombre,
    roa.acceso,
    roa.permitido
FROM users u
JOIN user_roles     ur  ON ur.user_id = u.id  AND ur.activo = TRUE
                        AND (ur.vigencia_hasta IS NULL OR ur.vigencia_hasta >= CURRENT_DATE)
JOIN roles          r   ON r.id = ur.role_id  AND r.activo = TRUE
JOIN role_option_access roa ON roa.role_id = r.id AND roa.permitido = TRUE
JOIN menu_options   mo  ON mo.id = roa.menu_option_id AND mo.activo = TRUE
JOIN menus          m   ON m.id = mo.menu_id  AND m.activo = TRUE
WHERE u.deleted_at IS NULL AND u.estado = 'activo';

COMMENT ON VIEW v_user_effective_permissions IS
    'Permisos efectivos de cada usuario activo, consolidando todos sus roles vigentes.';

-- =============================================================================
-- VISTA: Resumen de incidencias con conteo de pasos y adjuntos
-- =============================================================================
CREATE OR REPLACE VIEW v_incidents_summary AS
SELECT
    i.id,
    i.numero,
    i.titulo,
    i.estado,
    i.prioridad,
    i.categoria,
    i.ambiente,
    i.fecha_reporte,
    i.fecha_resolucion,
    i.tiempo_resolucion_min,
    ru.username      AS reportado_por,
    au.username      AS asignado_a,
    COUNT(DISTINCT ss.id)  AS total_pasos,
    COUNT(DISTINCT sa.id)  AS total_adjuntos,
    MAX(ss.updated_at)     AS ultima_actualizacion_paso
FROM incidents i
LEFT JOIN users ru ON ru.id = i.reportado_por
LEFT JOIN users au ON au.id = i.asignado_a
LEFT JOIN solution_steps ss ON ss.incident_id = i.id
LEFT JOIN step_attachments sa ON sa.step_id = ss.id
WHERE i.deleted_at IS NULL
GROUP BY i.id, ru.username, au.username;

COMMENT ON VIEW v_incidents_summary IS
    'Resumen de incidencias con conteo de pasos y adjuntos asociados.';

-- =============================================================================
-- DATOS SEMILLA (SEED DATA)
-- =============================================================================

-- ---- Roles base ----
INSERT INTO roles (codigo, nombre, descripcion, es_admin, activo) VALUES
    ('SUPER_ADMIN', 'Super Administrador',  'Acceso total al sistema sin restricciones',       TRUE,  TRUE),
    ('ADMIN',       'Administrador',         'Administra usuarios, roles y configuraciones',    FALSE, TRUE),
    ('ANALISTA',    'Analista TI',           'Crea y gestiona incidencias y soluciones',        FALSE, TRUE),
    ('SUPERVISOR',  'Supervisor',            'Supervisa incidencias, aprueba resoluciones',     FALSE, TRUE),
    ('CONSULTOR',   'Consultor (Solo Leer)', 'Solo puede visualizar incidencias y reportes',   FALSE, TRUE);

-- ---- Menus base ----
INSERT INTO menus (codigo, nombre, icono, orden, activo) VALUES
    ('DASHBOARD',      'Dashboard',           'dashboard',        1, TRUE),
    ('INCIDENCIAS',    'Incidencias',          'bug_report',       2, TRUE),
    ('SOLUCIONES',     'Soluciones',           'build',            3, TRUE),
    ('USUARIOS',       'Usuarios',             'people',           4, TRUE),
    ('SEGURIDAD',      'Seguridad',            'security',         5, TRUE),
    ('REPORTES',       'Reportes',             'bar_chart',        6, TRUE),
    ('CONFIGURACION',  'Configuracion',        'settings',         7, TRUE);

-- ---- Opciones de menu ----
INSERT INTO menu_options (menu_id, codigo, nombre, ruta, orden, activo) VALUES
    -- Dashboard
    (1, 'DASH_HOME',         'Inicio',                    '/dashboard',                   1, TRUE),
    (1, 'DASH_KPI',          'KPIs y Metricas',           '/dashboard/kpis',              2, TRUE),
    -- Incidencias
    (2, 'INC_LISTA',         'Listado de Incidencias',    '/incidencias',                 1, TRUE),
    (2, 'INC_NUEVA',         'Nueva Incidencia',          '/incidencias/nueva',           2, TRUE),
    (2, 'INC_DETALLE',       'Detalle de Incidencia',     '/incidencias/:id',             3, TRUE),
    (2, 'INC_ASIGNAR',       'Asignar Incidencia',        '/incidencias/:id/asignar',     4, TRUE),
    -- Soluciones
    (3, 'SOL_PASOS',         'Pasos de Solucion',         '/soluciones/:id/pasos',        1, TRUE),
    (3, 'SOL_ADJUNTOS',      'Adjuntos',                  '/soluciones/:id/adjuntos',     2, TRUE),
    -- Usuarios
    (4, 'USR_LISTA',         'Listado de Usuarios',       '/usuarios',                    1, TRUE),
    (4, 'USR_CREAR',         'Crear Usuario',             '/usuarios/crear',              2, TRUE),
    (4, 'USR_EDITAR',        'Editar Usuario',            '/usuarios/:id/editar',         3, TRUE),
    -- Seguridad
    (5, 'SEG_ROLES',         'Roles',                     '/seguridad/roles',             1, TRUE),
    (5, 'SEG_PERMISOS',      'Permisos por Rol',          '/seguridad/permisos',          2, TRUE),
    (5, 'SEG_BITACORA',      'Bitacora de Acciones',      '/seguridad/bitacora',          3, TRUE),
    -- Reportes
    (6, 'REP_INCIDENCIAS',   'Reporte de Incidencias',    '/reportes/incidencias',        1, TRUE),
    (6, 'REP_USUARIOS',      'Reporte de Usuarios',       '/reportes/usuarios',           2, TRUE),
    (6, 'REP_TIEMPOS',       'Tiempos de Resolucion',     '/reportes/tiempos',            3, TRUE),
    -- Configuracion
    (7, 'CONF_GENERAL',      'Configuracion General',     '/configuracion',               1, TRUE),
    (7, 'CONF_CATEGORIAS',   'Categorias de Incidencia',  '/configuracion/categorias',    2, TRUE);

-- ---- Permisos para ANALISTA (puede ver, crear, editar incidencias/soluciones) ----
INSERT INTO role_option_access (role_id, menu_option_id, acceso, permitido)
SELECT
    r.id,
    mo.id,
    a.acceso,
    TRUE
FROM roles r
CROSS JOIN menu_options mo
CROSS JOIN (VALUES ('ver'::tipo_acceso)) AS a(acceso)
WHERE r.codigo = 'CONSULTOR'
ON CONFLICT (role_id, menu_option_id, acceso) DO NOTHING;

-- Permisos completos para ANALISTA en incidencias y soluciones
INSERT INTO role_option_access (role_id, menu_option_id, acceso, permitido)
SELECT
    r.id, mo.id, a.acceso::tipo_acceso, TRUE
FROM roles r
CROSS JOIN menu_options mo
CROSS JOIN (VALUES ('ver'), ('crear'), ('editar')) AS a(acceso)
WHERE r.codigo = 'ANALISTA'
  AND mo.codigo IN ('INC_LISTA','INC_NUEVA','INC_DETALLE','SOL_PASOS','SOL_ADJUNTOS','DASH_HOME','DASH_KPI')
ON CONFLICT (role_id, menu_option_id, acceso) DO NOTHING;

-- ---- Usuario administrador inicial ----
-- Contrasena inicial: Admin@2026! (hash bcrypt rounds=12 — cambiar en primer login)
INSERT INTO users (username, email, password_hash, nombres, apellidos, estado, must_change_pwd)
VALUES (
    'admin',
    'admin@trazabilidad.local',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TdxmjxHxgGq5vVk9HNmAeODYJ8S2',
    'Administrador',
    'Sistema',
    'activo',
    TRUE
);

-- Asignar rol SUPER_ADMIN al usuario admin
INSERT INTO user_roles (user_id, role_id, activo)
SELECT u.id, r.id, TRUE
FROM users u, roles r
WHERE u.username = 'admin' AND r.codigo = 'SUPER_ADMIN';

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================
