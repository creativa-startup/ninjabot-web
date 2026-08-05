-- ============================================================
-- Migration: add_ninjabot_to_messaging_platform_enum.sql
-- Descripción: Añade el valor 'ninjabot' al tipo enumerado
-- personalizado messaging_platform para habilitar el canal de
-- comunicación nativa de Ninjabot.
--
-- Regla de oro cumplida: NO elimina ni modifica los valores
-- existentes ('whatsapp', 'messenger', 'instagram') para no
-- romper la data actual de Meta.
--
-- El frontend ya incluye 'ninjabot' en sus tipos, por lo que
-- sin esta migración cualquier INSERT o UPDATE con
-- platform='ninjabot' fallaría en PostgREST.
--
-- Requiere ejecutarse ANTES de normalize_contact_platforms.sql
-- (dicha migración ya usa el valor 'ninjabot').
-- ============================================================

ALTER TYPE public.messaging_platform ADD VALUE IF NOT EXISTS 'ninjabot';

-- Verificación opcional: el enum debe listar whatsapp, messenger,
-- instagram y ninjabot
-- SELECT t.typname, e.enumlabel
-- FROM pg_type t
-- JOIN pg_enum e ON t.oid = e.enumtypid
-- WHERE t.typname = 'messaging_platform'
-- ORDER BY e.enumsortorder;


-- ============================================================
-- Migration: normalize_contact_platforms.sql
-- Descripción: Normaliza los contactos existentes para la
-- regla de negocio: "El Registro Origina la Marca, la
-- Interacción Omnicanal Suma Canales"
--
-- Requiere ejecutarse en la base de datos Supabase (SQL Editor).
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Agregar columnas omnicanal si no existen
-- ============================================================
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS origin_platform TEXT DEFAULT NULL;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linked_platforms TEXT[] DEFAULT '{}';

-- ============================================================
-- 2. Normalizar contactos sin plataforma → 'ninjabot'
--    (registros web, creados vía correo/contraseña o carga manual)
-- ============================================================
UPDATE contacts
SET
  platform = 'ninjabot',
  origin_platform = 'ninjabot'
WHERE
  (platform IS NULL OR platform = '' OR platform = 'ninjabot')
  AND (origin_platform IS NULL OR origin_platform = '');

-- ============================================================
-- 3. Inferir origin_platform desde platform cuando falte
-- ============================================================
UPDATE contacts
SET origin_platform = platform
WHERE origin_platform IS NULL
  AND platform IS NOT NULL
  AND platform != '';

-- ============================================================
-- 4. Inicializar linked_platforms como array vacío si es NULL
-- ============================================================
UPDATE contacts
SET linked_platforms = '{}'
WHERE linked_platforms IS NULL;

-- ============================================================
-- 5. Verificación: resumen de normalización
-- ============================================================
SELECT
  origin_platform,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE platform = origin_platform) AS same_as_origin,
  COUNT(*) FILTER (WHERE platform != origin_platform) AS different_active_platform
FROM contacts
GROUP BY origin_platform
ORDER BY total DESC;

-- ============================================================
-- 6. Mostrar contactos que necesitan revisión manual
-- ============================================================
SELECT id, name, email, platform, origin_platform, linked_platforms
FROM contacts
WHERE origin_platform IS NULL
   OR platform IS NULL
   OR platform = '';

COMMIT;


-- ============================================================
-- Migration: enable_rls_strict_tenant_isolation.sql
-- Descripción: Habilita RLS en las 5 tablas vulnerables y aplica
-- políticas estrictas por tenant (auth.uid() + company_id).
-- Origen: Auditoría de producción - Checklist Ninjabot.
-- ============================================================

BEGIN;

-- Helper: company_id del usuario autenticado (SECURITY DEFINER evita recursión RLS)
-- Ubicado en schema 'internal' (NO expuesto a la API REST de PostgREST)
CREATE SCHEMA IF NOT EXISTS internal;
CREATE OR REPLACE FUNCTION internal.get_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION internal.get_company_id() FROM public, anon;
GRANT USAGE ON SCHEMA internal TO authenticated;
GRANT EXECUTE ON FUNCTION internal.get_company_id() TO authenticated;

-- 1. Habilitar RLS en las tablas vulnerables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agente_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_notes ENABLE ROW LEVEL SECURITY;

-- 2. Políticas: profiles
CREATE POLICY "profiles_select_self_or_company" ON public.profiles FOR SELECT
USING (auth.uid() = id OR company_id = internal.get_company_id());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- 2. Políticas: whatsapp_config (contiene tokens sensibles)
CREATE POLICY "whatsapp_config_select_self_or_company" ON public.whatsapp_config FOR SELECT
USING (user_id = auth.uid() OR company_id = internal.get_company_id());
CREATE POLICY "whatsapp_config_insert_own" ON public.whatsapp_config FOR INSERT
WITH CHECK (user_id = auth.uid());
CREATE POLICY "whatsapp_config_update_own" ON public.whatsapp_config FOR UPDATE
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "whatsapp_config_delete_own" ON public.whatsapp_config FOR DELETE
USING (user_id = auth.uid());

-- 2. Políticas: agente_config
CREATE POLICY "agente_config_select_own" ON public.agente_config FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "agente_config_insert_own" ON public.agente_config FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "agente_config_update_own" ON public.agente_config FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "agente_config_delete_own" ON public.agente_config FOR DELETE USING (user_id = auth.uid());

-- 2. Políticas: notifications
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_insert_own" ON public.notifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- 2. Políticas: conversation_notes (columna real: user_id, NO created_by)
CREATE POLICY "conversation_notes_select_self_or_company" ON public.conversation_notes FOR SELECT
USING (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    WHERE c.user_id = auth.uid()
       OR c.user_id IN (SELECT p.id FROM public.profiles p WHERE p.company_id = internal.get_company_id())
  )
);
CREATE POLICY "conversation_notes_insert_own" ON public.conversation_notes FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND conversation_id IN (SELECT c.id FROM public.conversations c WHERE c.user_id = auth.uid())
);
CREATE POLICY "conversation_notes_update_own" ON public.conversation_notes FOR UPDATE
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "conversation_notes_delete_own" ON public.conversation_notes FOR DELETE
USING (user_id = auth.uid());

-- 3. Eliminar default hardcodeado del webhook_verify_token
ALTER TABLE public.whatsapp_config ALTER COLUMN webhook_verify_token DROP DEFAULT;

COMMIT;


-- ============================================================
-- Migration: enable_supabase_vault_for_secrets.sql
-- Descripción: Habilita Supabase Vault (pgsodium) para el cifrado
-- de tokens sensibles (access_token, page_access_token, etc.).
-- Origen: Auditoría de producción - Checklist Ninjabot.
--
-- ⚠️ ACCIÓN MANUAL REQUERIDA:
-- 1. Rotar el token comprometido 'ninjabot_secret_token_2026' en Meta.
-- 2. Migrar los tokens existentes de whatsapp_config a vault.secrets:
--      INSERT INTO vault.secrets (name, secret, description)
--      SELECT 'access_token_' || user_id, access_token, 'Meta Access Token'
--      FROM whatsapp_config WHERE access_token IS NOT NULL;
-- 3. Una vez migrados, limpiar las columnas en texto plano:
--      ALTER TABLE whatsapp_config ALTER COLUMN access_token DROP NOT NULL;
--      UPDATE whatsapp_config SET access_token = NULL;
-- ============================================================

-- Habilitar Supabase Vault (crea esquema vault con tabla secrets cifrada)
CREATE EXTENSION IF NOT EXISTS supabase_vault;


-- ============================================================
-- Migration: fix_trigger_function_search_path.sql
-- Descripción: Fija search_path en la función del trigger
-- update_conversation_last_message para eliminar el WARN del
-- Security Advisor (function_search_path_mutable).
--
-- NOTA: La función NO es SECURITY DEFINER para que no quede
-- expuesta como RPC ejecutable por anon/authenticated.
-- Se ejecuta bajo el rol del usuario del trigger (RLS aplica).
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  -- Actualiza la conversacion asociada con el contenido del nuevo mensaje y la fecha actual
  UPDATE conversations
  SET 
    last_message = NEW.content,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$function$;


-- ============================================================
-- Migration: fix_orphan_contact_and_handle_new_user.sql
-- Descripción: Ajustes finales para demos en producción.
--  1. Asigna el contacto huérfano al usuario de pruebas principal.
--  2. Crea el trigger estándar handle_new_user para que todo
--     nuevo registro en auth.users cree su fila en profiles.
-- Origen: Ajustes de producción - Equipo backend.
-- ============================================================

-- 1. Asignar contacto huérfano al usuario de pruebas (renatomasa@gmail.com)
UPDATE contacts
SET user_id = '392f2333-49e3-46d4-b950-fccc1a3ccf1b'
WHERE user_id IS NULL;

-- 2. Trigger automático de creación de perfil al registrarse
--    (adaptado a columnas reales: full_name, no name; role 'agente')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'agente'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Restringir EXECUTE: el trigger se dispara por la BD (rol supabase_auth_admin),
--    los usuarios NO deben poder invocarla como RPC (elimina WARNs del advisor).
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;


-- ============================================================
-- Migration: add_auth_source_traceability.sql
-- Descripción: Trazabilidad de fuente de registro en profiles.
--  1. Columna auth_source con default 'ninjabot' (registro nativo).
--  2. Refuerzo RLS: política explícita user_id = auth.uid().
--  3. Trigger handle_new_user actualizado: detecta proveedor OAuth
--     (google) desde raw_app_meta_data y guarda 'google' en auth_source.
--
-- Regla de oro: idempotente (IF NOT EXISTS / DROP POLICY IF EXISTS /
-- CREATE OR REPLACE). No toca perfiles existentes (ON CONFLICT DO NOTHING).
-- ============================================================

BEGIN;

-- 1. Columna de trazabilidad de fuente de registro
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_source TEXT DEFAULT 'ninjabot';

-- 2. Reforzar RLS en profiles (idempotente)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own_auth" ON public.profiles;
CREATE POLICY "profiles_select_own_auth" ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Trigger handle_new_user actualizado: detecta proveedor OAuth
--    (google/facebook) desde raw_app_meta_data->>'provider'.
--    Cualquier otro registro (email+password) → 'ninjabot'.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, auth_source)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'agente',
    CASE WHEN new.raw_app_meta_data->>'provider' = 'google' THEN 'google' ELSE 'ninjabot' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Restringir EXECUTE (el trigger lo dispara supabase_auth_admin, no los usuarios)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

COMMIT;


-- ============================================================
-- Migration: social_graph_posts.sql
-- Descripción: Fase 1 y 2 — Grafo social User-to-User + Persistencia
-- de publicaciones (posts).
--
-- 1. ENUM connection_status ('pending', 'accepted', 'rejected', 'blocked')
-- 2. Tabla connections (Modelo User-to-User, clave para la viralidad B2C/C2C):
--      - requester_id / addressee_id → FK directa a profiles
--      - Índice único (requester_id, addressee_id)
--      - CHECK requester_id <> addressee_id (no auto-conexión)
-- 3. Tabla posts:
--      - user_id → FK a profiles
--      - content, channel, metrics (jsonb), is_online
-- 4. RLS en ambas tablas (Blindaje):
--      - posts: SELECT propio O si existe conexión aceptada con el autor
--      - connections: cada usuario solo ve/opera sus propias filas
--
-- Requiere ejecutarse en la base de datos Supabase (SQL Editor).
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ENUM connection_status
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_status') THEN
    CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
  END IF;
END
$$;

-- ============================================================
-- 2. Tabla connections (User-to-User)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.connection_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Regla de oro: no auto-conexión
  CONSTRAINT connections_no_self_connection CHECK (requester_id <> addressee_id),
  -- Una única relación por par de usuarios (sin duplicados en ningún sentido)
  CONSTRAINT connections_unique_pair UNIQUE (requester_id, addressee_id)
);

-- Índice adicional para consultas inversas (addressee_id) y por estado
CREATE INDEX IF NOT EXISTS idx_connections_addressee_status ON public.connections (addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_pair_reverse ON public.connections (addressee_id, requester_id);

-- ============================================================
-- 3. Tabla posts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Usuario Ninjabot',
  author_handle text NOT NULL DEFAULT '@ninjauser',
  author_avatar text NOT NULL DEFAULT 'NU',
  content text NOT NULL,
  channel text NOT NULL DEFAULT 'instagram',
  metrics jsonb NOT NULL DEFAULT '{"comments": 0, "likes": 0, "shares": 0}'::jsonb,
  is_online boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índice principal: feed del usuario + orden cronológico
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts (user_id, created_at DESC);

-- ============================================================
-- 4. RLS en ambas tablas (El Blindaje)
-- ============================================================

-- ── RLS: connections ──
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- SELECT: solo filas donde soy requester o addressee
CREATE POLICY "connections_select_participant" ON public.connections FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- INSERT: solo puedo enviar solicitudes como requester
CREATE POLICY "connections_insert_as_requester" ON public.connections FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- UPDATE: solo quien recibe (addressee) puede aceptar/rechazar/bloquear
CREATE POLICY "connections_update_as_addressee" ON public.connections FOR UPDATE
USING (auth.uid() = addressee_id) WITH CHECK (auth.uid() = addressee_id);

-- DELETE: ambos participantes pueden eliminar la conexión
CREATE POLICY "connections_delete_participant" ON public.connections FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ── RLS: posts ──
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- SELECT: posts propios O posts de usuarios con conexión aceptada
-- (exactamente la política de lectura sugerida)
CREATE POLICY "posts_select_own_or_connected" ON public.posts FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.connections c
    WHERE c.status = 'accepted'
      AND (
        (c.requester_id = auth.uid() AND c.addressee_id = posts.user_id)
        OR
        (c.requester_id = posts.user_id AND c.addressee_id = auth.uid())
      )
  )
);

-- INSERT: solo puedo publicar posts propios
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: solo el autor puede editar su post
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DELETE: solo el autor puede eliminar su post
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE
USING (auth.uid() = user_id);

COMMIT;


-- ============================================================
-- Migration: add_profiles_handle.sql
-- Descripción: Identidad Única (handle) auto-generado para users.
--
-- 1. Columna handle TEXT (nullable — los perfiles existentes lo
--    obtienen en su próximo login/registro).
-- 2. UNIQUE (profiles_handle_key): unicidad global del handle.
-- 3. CHECK (valid_handle): solo letras minúsculas, números y
--    guiones bajos — formato de URL válida /@handle.
--
-- ⚠️ IMPORTANTE: NO se modifica NINGUNA política RLS. El blindaje
-- estricto (auth.uid()) de profiles y posts permanece intacto.
--
-- Regla de oro: idempotente (IF NOT EXISTS / no dropea constrains).
-- PostgreSQL permite múltiples NULL en UNIQUE → no rompe perfiles
-- existentes sin handle.
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle TEXT;

-- Constraint de unicidad (idempotente: solo se crea si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_handle_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_handle_key UNIQUE (handle);
  END IF;
END
$$;

-- Constraint de formato de URL (idempotente: solo se crea si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_handle'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT valid_handle CHECK (handle ~ '^[a-z0-9_]+$');
  END IF;
END
$$;
