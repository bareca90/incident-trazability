-- ============================================================================
-- SCRIPT DE RESETEO DE CONTRASEÑA Y DESBLOQUEO DE USUARIO
-- Proyecto: Trazabilidad de Incidencias
-- Motor: PostgreSQL 16
-- Esquema: trazabilidad
-- ============================================================================

-- INSTRUCCIONES DE USO:
-- 1. Reemplaza 'admin@trazabilidad.local' o el username por el usuario a desbloquear.
-- 2. Elige el hash de contraseña deseado (ejemplos provistos abajo).
-- 3. Ejecuta estas sentencias SQL en tu gestor (Navicat, DBeaver, psql).

--------------------------------------------------------------------------------
-- HASHES DE EJEMPLO DISPONIBLES (BCRYPT cost=10):
-- 'Admin123456' -> $2b$10$9IkC80kZEN5RElOvrREukuD5tZVmpEvnbBFVr.NMObXtbmd8p0Jo6
-- 'Usuario123'  -> $2b$10$ML1b8vx4rrXF9TVriTeJXus8r495taBCkjK25Xcr9iIl6eeDWIGva
-- 'Cambiar123'  -> $2b$10$J26QKXFyG4Mzghvm5CqPOewxGj.fXfKLTZcMi62Cb/Gy2zyEl.x1S
--------------------------------------------------------------------------------

SET search_path TO trazabilidad, public;

-- Opción 1: Desbloquear usuario y resetear su clave a 'Admin123456'
UPDATE trazabilidad.users
SET 
    password_hash = '$2b$10$9IkC80kZEN5RElOvrREukuD5tZVmpEvnbBFVr.NMObXtbmd8p0Jo6',
    intentos_login = 0,
    estado = 'activo',
    must_change_pwd = false,
    updated_at = NOW()
WHERE email = 'admin@trazabilidad.local'; -- O cambia por el correo/username deseado


-- Opción 2: Desbloquear cualquier usuario por username especificando clave 'Cambiar123' y exigiendo cambio de clave al entrar
/*
UPDATE trazabilidad.users
SET 
    password_hash = '$2b$10$J26QKXFyG4Mzghvm5CqPOewxGj.fXfKLTZcMi62Cb/Gy2zyEl.x1S',
    intentos_login = 0,
    estado = 'activo',
    must_change_pwd = true,
    updated_at = NOW()
WHERE username = 'mi_usuario';
*/


-- Consulta de verificación para revisar el estado del usuario desbloqueado
SELECT 
    id, 
    username, 
    email, 
    estado, 
    intentos_login, 
    must_change_pwd, 
    ultimo_login, 
    updated_at
FROM trazabilidad.users
WHERE email = 'admin@trazabilidad.local';
