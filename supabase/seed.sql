-- ==========================================================================
-- SCRIPT DE SEED DE DATOS DE PRUEBA (NINJABOT SANDBOX & DEV ENVIRONMENT)
-- ==========================================================================
-- NOTA: Este script fue corregido y validado contra el esquema REAL de la
-- base de datos (qyudscnbmdgaghsiunga). Cambios clave:
--   1. auth_source ahora existe (migración add_auth_source_traceability aplicada).
--   2. UUID del admin reemplazado por el auth.uid() real: 392f2333-...
--   3. El INSERT del perfil admin usa ON CONFLICT (id) DO UPDATE para
--      garantizar nombre/handle/company sin duplicar filas.
--   4. La empresa usa ON CONFLICT (id) DO UPDATE para asegurar el nombre demo.
-- Idempotente: seguro de re-ejecutar (ON CONFLICT DO NOTHING / DO UPDATE).
-- ==========================================================================

-- ==========================================================================
-- 1. CREACIÓN DE LA EMPRESA DEMO (Multi-Tenant)
-- ==========================================================================
INSERT INTO public.companies (id, name, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Taller Ninja Inc.',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = now();

-- ==========================================================================
-- 2. PERFIL ADMINISTRADOR REAL (auth.uid() = 392f2333-...)
-- ==========================================================================
-- Este es el perfil autenticado real del usuario. Usa DO UPDATE para
-- garantizar que obtenga el nombre demo y el handle @muro_ninja sin duplicar.
INSERT INTO public.profiles (id, full_name, email, role, company_id, auth_source, handle, created_at)
VALUES (
  '392f2333-49e3-46d4-b950-fccc1a3ccf1b',
  'Muro Ninja',
  'muro@ninjabot.app',
  'admin',
  '11111111-1111-1111-1111-111111111111',
  'ninjabot',
  'muro_ninja',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  company_id = EXCLUDED.company_id,
  auth_source = EXCLUDED.auth_source,
  handle = EXCLUDED.handle;

-- ==========================================================================
-- 3. PERFIL DE USUARIO SECUNDARIO (Pedro Creador - "Club Privado")
-- ==========================================================================
-- Nota: Pedro debe existir en auth.users (FK perfiles_id_fkey). El trigger
-- handle_new_user crea su fila en profiles; este DO UPDATE le asigna
-- company_id y handle del demo.
INSERT INTO public.profiles (id, full_name, email, role, company_id, auth_source, handle, created_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Pedro Creador',
  'pedro@ninjabot.app',
  'agent',
  '11111111-1111-1111-1111-111111111111',
  'google',
  'pedrito_reels',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  company_id = EXCLUDED.company_id,
  auth_source = EXCLUDED.auth_source,
  handle = EXCLUDED.handle;

-- ==========================================================================
-- 4. RELACIÓN DE AMISTAD/CONEXIÓN ("Club Privado")
-- ==========================================================================
-- Sin esta conexión en estado 'accepted', las políticas RLS bloquearían
-- ver los posts de Pedro en el feed social.
INSERT INTO public.connections (id, requester_id, addressee_id, status, created_at, updated_at)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  '392f2333-49e3-46d4-b950-fccc1a3ccf1b', -- Muro Ninja (admin real)
  '55555555-5555-5555-5555-555555555555', -- Pedro Creador
  'accepted'::connection_status,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================================================
-- 5. CONTACTOS OMNICANAL EN EL CRM
-- ==========================================================================
-- Contacto A: WhatsApp
INSERT INTO public.contacts (id, user_id, name, email, phone, city, lead_stage, platform, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '392f2333-49e3-46d4-b950-fccc1a3ccf1b',
  'Carlos Cliente',
  'carlos@gmail.com',
  '+54911223344',
  'Buenos Aires',
  'Contactado',
  'whatsapp'::messaging_platform,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Contacto B: Instagram
INSERT INTO public.contacts (id, user_id, name, email, phone, city, lead_stage, platform, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333334',
  '392f2333-49e3-46d4-b950-fccc1a3ccf1b',
  'Ana Seguidora',
  'ana@instagram.com',
  NULL,
  'Santiago',
  'Interesado',
  'instagram'::messaging_platform,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================================================
-- 6. CONVERSACIONES OMNICANAL ACTIVAS
-- ==========================================================================
-- Conversación WhatsApp
INSERT INTO public.conversations (id, user_id, contact_id, status, last_message, platform, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '392f2333-49e3-46d4-b950-fccc1a3ccf1b',
  '33333333-3333-3333-3333-333333333333',
  'open',
  '¿Tienen stock disponible para los pases del sábado?',
  'whatsapp'::messaging_platform,
  now() - interval '2 hours',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Conversación Instagram
INSERT INTO public.conversations (id, user_id, contact_id, status, last_message, platform, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444445',
  '392f2333-49e3-46d4-b950-fccc1a3ccf1b',
  '33333333-3333-3333-3333-333333333334',
  'open',
  'Me encantó tu último post de microblogging, ¡quiero registrarme!',
  'instagram'::messaging_platform,
  now() - interval '1 hour',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================================================
-- 7. HISTORIAL DE MENSAJES
-- ==========================================================================
-- Mensajes de WhatsApp
INSERT INTO public.messages (id, conversation_id, type, content, sender, is_agent, platform, timestamp, created_at)
VALUES
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'text', 'Hola! Me interesan los tickets P2P para el evento.', 'client', false, 'whatsapp', now() - interval '10 minutes', now() - interval '10 minutes'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'text', 'Hola Carlos, por supuesto. ¿Para qué fecha los buscas?', 'agent', true, 'whatsapp', now() - interval '8 minutes', now() - interval '8 minutes'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'text', '¿Tienen stock disponible para los pases del sábado?', 'client', false, 'whatsapp', now() - interval '5 minutes', now() - interval '5 minutes')
ON CONFLICT (id) DO NOTHING;

-- Mensajes de Instagram
INSERT INTO public.messages (id, conversation_id, type, content, sender, is_agent, platform, timestamp, created_at)
VALUES
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444445', 'text', 'Hola! Me encantó el post del Taller Ninja.', 'client', false, 'instagram', now() - interval '20 minutes', now() - interval '20 minutes'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444445', 'text', 'Me encantó tu último post de microblogging, ¡quiero registrarme!', 'client', false, 'instagram', now() - interval '15 minutes', now() - interval '15 minutes')
ON CONFLICT (id) DO NOTHING;

-- ==========================================================================
-- 8. BURBUJAS DE NOTAS DE LA IA Y DEL CRM
-- ==========================================================================
INSERT INTO public.conversation_notes (id, conversation_id, user_id, content, is_ai_generated, include_in_context, created_at)
VALUES
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '392f2333-49e3-46d4-b950-fccc1a3ccf1b', 'Carlos busca comprar 3 tickets para el sábado. Prefiere pagar por transferencia bancaria.', false, true, now() - interval '5 minutes'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '392f2333-49e3-46d4-b950-fccc1a3ccf1b', 'Ninjabot: El cliente califica como lead caliente debido a su alto interés interactivo.', true, true, now() - interval '2 minutes')
ON CONFLICT (id) DO NOTHING;

-- ==========================================================================
-- 9. PUBLICACIONES DE MICROBLOGGING / REELS
-- ==========================================================================
-- Post de Muro Ninja (Admin)
INSERT INTO public.posts (id, user_id, content, channel, metrics, is_online, created_at)
VALUES (
  gen_random_uuid(),
  '392f2333-49e3-46d4-b950-fccc1a3ccf1b',
  '¡Ya está listo el Sandbox con persistencia real en Supabase! La UI de 4 paneles está respondiendo a 60 FPS estables. #Ninjabot #React #Supabase',
  'instagram',
  '{"likes": 24, "comments": 8, "shares": 3}'::jsonb,
  true,
  now() - interval '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- Post de Pedro Creador (Amigo - Visible gracias al RLS de conexiones)
INSERT INTO public.posts (id, user_id, content, channel, metrics, is_online, created_at)
VALUES (
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  'Probando la nueva grilla de productos desde la pestaña Tienda del perfil. La cohesión del diseño editorial con glassmorphism oscuro es increíble. 🚀 #DesignTokens #Tailwind',
  'linkedin',
  '{"likes": 42, "comments": 15, "shares": 7}'::jsonb,
  true,
  now() - interval '5 hours'
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================================================
-- 10. PRODUCTOS DEL CATÁLOGO DE LA TIENDA
-- ==========================================================================
INSERT INTO public.products (id, user_id, meta_product_id, sku, name, price, currency, image_url, updated_at)
VALUES
  (gen_random_uuid(), '392f2333-49e3-46d4-b950-fccc1a3ccf1b', 'meta-1', 'TKT-SAT-P2P', 'Pase de Acceso - Sábado de Taller', 15.00, 'USD', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400', now()),
  (gen_random_uuid(), '392f2333-49e3-46d4-b950-fccc1a3ccf1b', 'meta-2', 'TKT-SUN-P2P', 'Pase de Acceso - Domingo Vip', 25.00, 'USD', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400', now()),
  (gen_random_uuid(), '392f2333-49e3-46d4-b950-fccc1a3ccf1b', 'meta-3', 'DEV-CAP-NINJA', 'Gorra Oficial "Ninjabot Developer"', 19.99, 'USD', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', now())
ON CONFLICT (id) DO NOTHING;