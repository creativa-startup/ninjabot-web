-- ============================================================
-- Migration: Alinear tipos del Frontend con la Base de Datos
-- ============================================================
-- Fecha: 2026-07-26
-- Descripción: Normaliza los valores de LeadStage y SenderType
--              para que coincidan con los tipos definidos en types.ts
-- ============================================================

-- 1. Actualizar valores de lead_stage en la tabla contacts
--    (mapeo de valores antiguos a nuevos)
UPDATE contacts
SET lead_stage = 'Lead Nuevo'
WHERE lead_stage = 'Lead nuevo';

UPDATE contacts
SET lead_stage = 'Cerrado'
WHERE lead_stage = 'Cliente';

UPDATE contacts
SET lead_stage = 'Perdido'
WHERE lead_stage = 'Perdidos';

-- 2. Actualizar valores de sender_type en la tabla messages
--    (mapeo de valores antiguos a nuevos)
UPDATE messages
SET sender_type = 'agent'
WHERE sender_type = 'human_agent';

-- 3. Si usas enums de PostgreSQL, actualizar los tipos
--    (descomentar si aplica)
-- ALTER TYPE lead_stage_enum RENAME TO lead_stage_enum_old;
-- CREATE TYPE lead_stage_enum AS ENUM (
--   'Lead Nuevo',
--   'Contactado',
--   'Interesado',
--   'Cotización',
--   'En negociación',
--   'Cerrado',
--   'Perdido'
-- );
-- ALTER TABLE contacts ALTER COLUMN lead_stage TYPE lead_stage_enum
--   USING lead_stage::text::lead_stage_enum;
-- DROP TYPE lead_stage_enum_old;

-- ALTER TYPE sender_type_enum RENAME TO sender_type_enum_old;
-- CREATE TYPE sender_type_enum AS ENUM ('user', 'ia', 'agent', 'system');
-- ALTER TABLE messages ALTER COLUMN sender_type TYPE sender_type_enum
--   USING sender_type::text::sender_type_enum;
-- DROP TYPE sender_type_enum_old;

-- 4. Agregar columna de etapa en funnels si no existe
--    (opcional, según esquema actual)
-- ALTER TABLE funnels ADD COLUMN IF NOT EXISTS lead_stage lead_stage_enum DEFAULT 'Lead Nuevo';