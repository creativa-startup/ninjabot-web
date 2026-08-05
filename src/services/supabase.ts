import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[Supabase] Faltan variables de entorno: VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. " +
    "Verifica que estén definidas en .env.production / el entorno del pipeline de despliegue."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// IDENTIDAD ÚNICA (handle) — /@handle
// ==========================================

/**
 * Genera un handle único a partir del email o nombre completo.
 * Formato válido: solo letras minúsculas, números y guiones bajos (^[a-z0-9_]+$).
 *
 * @param email - Correo del usuario (se usa la parte antes del @)
 * @param name - Nombre completo (fallback si no hay email)
 * @returns Handle limpio y normalizado
 */
export function generateUniqueHandle(email?: string, name?: string): string {
  // 1. Fuente primaria: parte del email antes del @
  let source = (email || '').split('@')[0] || '';
  // 2. Fallback: nombre completo limpio
  if (!source) {
    source = (name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // quita tildes
  }

  // 3. Normalizar: minúsculas + solo [a-z0-9_] + sin tildes
  const cleaned = source
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  // 4. Fallback final si queda vacío
  return cleaned || 'ninjabot';
}

/**
 * Realiza el upsert del perfil con reintento automático ante
 * colisión de unicidad del handle (constraint profiles_handle_key).
 *
 * Si Supabase devuelve código 23505 (unique_violation), añade un
 * sufijo numérico aleatorio (ej. _842) y reintenta — cero fricción.
 *
 * @param profile - Datos del perfil a insertar/actualizar
 * @param maxAttempts - Máximo de reintentos (default 3)
 * @returns true si el upsert fue exitoso
 */
async function upsertProfileWithHandle(
  profile: Record<string, any>,
  maxAttempts = 3,
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });

    if (!error) return true;

    // Solo reintentar ante violación de unicidad del handle
    const isUniqueViolation =
      error.code === '23505' &&
      (error.message?.includes('profiles_handle_key') ||
        error.message?.includes('handle'));

    if (!isUniqueViolation) {
      console.warn('[upsertProfileWithHandle] Error no recuperable:', error.message);
      return false;
    }

    // Colisión de handle: añadir sufijo numérico aleatorio y reintentar
    const suffix = Math.floor(100 + Math.random() * 900); // 100–999
    profile.handle = `${(profile.handle || '').replace(/_\d{3}$/, '')}_${suffix}`;
    console.warn(`[upsertProfileWithHandle] Handle colisionó, reintento ${attempt + 1} con: ${profile.handle}`);
  }

  return false;
}

/**
 * Busca un perfil público por su handle. Útil para el enrutamiento /@handle.
 *
 * NOTA: el RLS estricto de profiles (auth.uid() = id) garantiza que solo
 * usuarios autenticados con acceso puedan consultar — el "Club Privado" se
 * cumple en backend sin abrir campos al rol anon.
 */
export async function getProfileByHandle(handle: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ==========================================
// SERVICIOS DE CONTACTOS (CRUD) - tabla contacts
// ==========================================

export const getContactos = async () => {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

/** Valores válidos del enum PostgreSQL messaging_platform (incluye 'ninjabot' tras la migración add_ninjabot_to_messaging_platform_enum) */
const DB_MESSAGING_PLATFORMS = ['whatsapp', 'messenger', 'instagram', 'ninjabot'];

/**
 * Normaliza una plataforma de UI a un valor válido del enum messaging_platform.
 * 'ninjabot' es un valor nativo del enum desde la migración de producción.
 */
function toDbPlatform(platform: any): string {
  if (typeof platform === 'string' && DB_MESSAGING_PLATFORMS.includes(platform)) {
    return platform;
  }
  return 'whatsapp';
}

export const createContacto = async (nuevoContacto: any) => {
  const sanitized = nuevoContacto.platform !== undefined
    ? { ...nuevoContacto, platform: toDbPlatform(nuevoContacto.platform) }
    : nuevoContacto;

  const { data, error } = await supabase
    .from("contacts")
    .insert([sanitized])
    .select();

  if (error) throw error;
  return data[0];
};

export const updateContacto = async (id: string, cambios: any) => {
  const { data, error } = await supabase
    .from("contacts")
    .update(cambios)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteContacto = async (id: string) => {
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};

// ==========================================
// SERVICIOS DE AUTENTICACION
// ==========================================

export const loginUsuario = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sincroniza la entidad de origen (auth_source) del usuario en la tabla profiles.
 * Trazabilidad: 'google' si el proveedor OAuth es Google, 'facebook' si es Facebook,
 * 'ninjabot' (nativo) para cualquier otro registro (email+password o sin proveedor).
 *
 * Idempotente: usa upsert con onConflict 'id' — inserta el perfil si no existe
 * o actualiza auth_source si ya existe (por ejemplo, un usuario Google antiguo
 * cuyo perfil se creó con default 'ninjabot').
 *
 * @param user - Usuario autenticado de Supabase Auth (o null si no hay sesión)
 * @returns true si la sincronización fue exitosa
 */
export const syncAuthSourceFromUser = async (user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
} | null | undefined): Promise<boolean> => {
  if (!user || !user.id) return false;

  // Supabase Auth expone el proveedor real del login en app_metadata.provider
  const provider = user.app_metadata?.provider as string | undefined;
  const authSource = provider === 'google' ? 'google' : provider === 'facebook' ? 'facebook' : 'ninjabot';

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Usuario';

  // Identidad Única: auto-generar handle desde email o nombre (sin fricción)
  const handle = generateUniqueHandle(user.email || undefined, fullName);

  const ok = await upsertProfileWithHandle({
    id: user.id,
    email: user.email || '',
    full_name: fullName,
    role: 'agente',
    auth_source: authSource,
    handle,
  });

  if (!ok) {
    console.warn('[syncAuthSourceFromUser] No se pudo sincronizar auth_source/handle');
    return false;
  }

  return true;
};

/**
 * Registra un nuevo usuario con Email, Password y Nombre Completo (cero fricción).
 * El nombre se guarda en user_metadata para que exista en el perfil.
 *
 * Trazabilidad: tras crear el usuario, inserta/actualiza el perfil con
 * auth_source = 'ninjabot' (entidad de origen nativa de la plataforma web).
 */
export const registrarUsuario = async (email: string, password: string, full_name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, name: full_name },
    },
  });

  if (error) throw error;

  // Trazabilidad: el registro directo (email+password) es fuente 'ninjabot'
  if (data.user) {
    await syncAuthSourceFromUser(data.user);
  }

  return data;
};

/**
 * Inicia sesión / registra con Google OAuth (Supabase Auth).
 * Redirige a /app tras el callback OAuth.
 *
 * Trazabilidad: tras la autenticación exitosa, verifica el proveedor en los
 * metadatos de Supabase Auth y actualiza/inserta 'google' en auth_source.
 * NOTA: En el flujo con redirect, la sesión se restaura en App.tsx
 * (onAuthStateChange) que también invoca syncAuthSourceFromUser.
 */
export const loginConGoogle = async () => {
  const redirectTo = `${window.location.origin}/app`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;

  // Cubre el flujo popup (sin redirect): la sesión ya existe aquí
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await syncAuthSourceFromUser(user);
  }

  return data;
};

/**
 * Inicia sesión / registra con Facebook OAuth (Supabase Auth).
 * Redirige a /app tras el callback OAuth.
 */
export const loginConFacebook = async () => {
  const redirectTo = `${window.location.origin}/app`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo,
    },
  });

  if (error) throw error;
  return data;
};

export const logoutUsuario = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
};

/**
 * Lee el flag `pwa_installed` del perfil en Supabase.
 * Indica si el usuario ya instaló la Power App (persistente por cuenta).
 */
export const getPwaInstalada = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("pwa_installed")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return false;
  return data.pwa_installed === true;
};

/**
 * Marca el flag `pwa_installed = true` en el perfil del usuario.
 * Se invoca cuando el navegador confirma la instalación PWA (evento appinstalled).
 */
export const marcarPwaInstalada = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update({ pwa_installed: true })
    .eq("id", user.id);

  if (error) {
    console.warn('[marcarPwaInstalada] No se pudo actualizar pwa_installed:', error.message);
  }
};

// ==========================================
// META GRAPH API — OBTENER NÚMEROS DE TELÉFONO
// ==========================================

/**
 * Representa un número de teléfono obtenido de la Graph API de Meta.
 */
export interface WabaPhoneNumber {
  /** ID del número de teléfono en Meta */
  phoneNumberId: string;
  /** Número formateado para mostrar (ej: "+1 555-555-5555") */
  displayPhoneNumber: string;
  /** Nombre verificado del negocio asociado */
  verifiedName: string;
  /** Rating de calidad: 'GREEN', 'YELLOW', 'RED' */
  qualityRating: 'GREEN' | 'YELLOW' | 'RED' | null;
  /** Tipo de número: 'WHATSAPP_MANAGED' u otros */
  codeVerificationStatus: string | null;
}

/**
 * Obtiene la lista de números de teléfono asociados a una WABA
 * mediante la Graph API de Meta.
 *
 * GET https://graph.facebook.com/v19.0/{waba_id}/phone_numbers
 *
 * @param wabaId - ID de la WhatsApp Business Account
 * @param accessToken - Token de acceso de Meta
 * @returns Lista de números de teléfono
 */
export async function fetchWabaPhoneNumbers(
  wabaId: string,
  accessToken: string
): Promise<WabaPhoneNumber[]> {
  const GRAPH_API_VERSION = 'v19.0';
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${wabaId}/phone_numbers?access_token=${encodeURIComponent(accessToken)}`;

  console.log('[fetchWabaPhoneNumbers] Consultando Graph API de Meta...');
  console.log('[fetchWabaPhoneNumbers] URL:', url.replace(accessToken, '***'));

  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[fetchWabaPhoneNumbers] Error HTTP:', response.status, errorBody);
    throw new Error(
      `Error al obtener números de la WABA desde Meta. HTTP ${response.status}: ${errorBody}`
    );
  }

  const json = await response.json();
  console.log('[fetchWabaPhoneNumbers] Respuesta de Meta:', JSON.stringify(json, null, 2));

  if (!json.data || !Array.isArray(json.data)) {
    console.warn('[fetchWabaPhoneNumbers] No se encontraron números en la respuesta de Meta.');
    return [];
  }

  const numbers: WabaPhoneNumber[] = json.data.map((item: any) => ({
    phoneNumberId: item.id,
    displayPhoneNumber: item.display_phone_number || '',
    verifiedName: item.verified_name || '',
    qualityRating: item.quality_rating || null,
    codeVerificationStatus: item.code_verification_status || null,
  }));

  console.log(`[fetchWabaPhoneNumbers] Se encontraron ${numbers.length} números:`);
  numbers.forEach((n) =>
    console.log(`  - ${n.displayPhoneNumber} (ID: ${n.phoneNumberId}) [${n.qualityRating || 'sin rating'}]`)
  );

  return numbers;
}

// ==========================================
// META EMBEDDED SIGNUP — PERSISTENCIA EN DB
// ==========================================

/**
 * Payload completo de datos de Meta Embedded Signup.
 * Representa la información que Meta devuelve tras el
 * flujo de Embedded Signup (WABA, perfil, etc.).
 *
 * phoneNumberId y phoneNumber ya no vienen del payload
 * inicial de Meta, sino que se obtienen consultando
 * la Graph API (fetchWabaPhoneNumbers).
 */
export interface MetaSignupData {
  facebookUserId: string;
  email: string;
  name: string;
  wabaId: string;
  phoneNumberId: string;
  phoneNumber: string;
  businessName: string;
  accessToken: string;
  /** Lista de números obtenidos de la Graph API */
  phoneNumbers?: WabaPhoneNumber[];
}

/**
 * Persiste los datos capturados de Meta Embedded Signup
 * directamente en las tablas de Supabase.
 *
 * Ahora también guarda CADA número de teléfono obtenido
 * de la Graph API como un registro individual en
 * `whatsapp_phone_numbers`, además de actualizar
 * `whatsapp_integrations`.
 *
 * @param data - Datos obtenidos de Meta Embedded Signup
 * @returns Objeto con email, name y la lista de números
 */
export async function persistMetaSignupData(
  data: MetaSignupData
): Promise<{ email: string; name: string; phoneNumbers: WabaPhoneNumber[] }> {
  const {
    facebookUserId,
    email,
    name,
    wabaId,
    phoneNumberId,
    phoneNumber,
    businessName,
    accessToken,
    phoneNumbers = [],
  } = data;

  console.log('[persistMetaSignupData] Guardando datos de Meta en Supabase...');
  console.log('[persistMetaSignupData] facebookUserId:', facebookUserId);
  console.log('[persistMetaSignupData] email:', email);
  console.log('[persistMetaSignupData] Números a persistir:', phoneNumbers.length);

  try {
    // 1. Guardar/actualizar en meta_users
    const { error: metaUserError } = await supabase
      .from('meta_users')
      .upsert(
        {
          facebook_user_id: facebookUserId,
          email,
          name,
          waba_id: wabaId,
          phone_number_id: phoneNumberId || phoneNumbers[0]?.phoneNumberId || null,
          phone_number: phoneNumber || phoneNumbers[0]?.displayPhoneNumber || null,
          business_name: businessName,
          access_token: accessToken,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'facebook_user_id' }
      );

    if (metaUserError) {
      console.error('[persistMetaSignupData] Error en meta_users:', metaUserError);
    } else {
      console.log('[persistMetaSignupData] meta_users: OK');
    }

    // 2. Guardar/actualizar en profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          email,
          full_name: name,
        },
        { onConflict: 'email' }
      );

    if (profileError) {
      console.error('[persistMetaSignupData] Error en profiles:', profileError);
    } else {
      console.log('[persistMetaSignupData] profiles: OK');
    }

    // 3. Guardar/actualizar en whatsapp_integrations (registro principal de la WABA)
    const { error: waError } = await supabase
      .from('whatsapp_integrations')
      .upsert(
        {
          waba_id: wabaId,
          phone_number_id: phoneNumberId || phoneNumbers[0]?.phoneNumberId || null,
          phone_number: phoneNumber || phoneNumbers[0]?.displayPhoneNumber || null,
          business_name: businessName,
          access_token: accessToken,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'waba_id' }
      );

    if (waError) {
      console.error('[persistMetaSignupData] Error en whatsapp_integrations:', waError);
    } else {
      console.log('[persistMetaSignupData] whatsapp_integrations: OK');
    }

    // 4. Guardar cada número de teléfono en whatsapp_phone_numbers
    if (phoneNumbers.length > 0) {
      const phoneNumberRecords = phoneNumbers.map((num) => ({
        waba_id: wabaId,
        phone_number_id: num.phoneNumberId,
        display_phone_number: num.displayPhoneNumber,
        verified_name: num.verifiedName,
        quality_rating: num.qualityRating,
        code_verification_status: num.codeVerificationStatus,
        is_active: true,
        updated_at: new Date().toISOString(),
      }));

      const { error: pnError } = await supabase
        .from('whatsapp_phone_numbers')
        .upsert(phoneNumberRecords, { onConflict: 'phone_number_id' });

      if (pnError) {
        console.error('[persistMetaSignupData] Error en whatsapp_phone_numbers:', pnError);
      } else {
        console.log(`[persistMetaSignupData] whatsapp_phone_numbers: ${phoneNumbers.length} registros OK`);
      }
    }

    console.log('[persistMetaSignupData] Todos los datos persistidos correctamente.');
  } catch (err) {
    console.error('[persistMetaSignupData] Error inesperado:', err);
  }

  return { email, name, phoneNumbers };
}

/**
 * Verifica si el usuario autenticado actualmente tiene
 * una integración de WhatsApp Business activa.
 */
export async function checkUserWhatsAppStatus(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("whatsapp_integrations")
    .select("is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return false;
  return data.is_active === true;
}

// ==========================================
// PERFIL ACTUAL (tabla profiles)
// ==========================================

export const getPerfilActual = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No hay usuario autenticado");

  const { data: perfil, error: perfilError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Si el perfil no existe en producción, lo creamos automáticamente
  // con la entidad de origen detectada del proveedor OAuth (trazabilidad)
  // y con handle auto-generado (Identidad Única).
  if (!perfil && !perfilError) {
    const provider = (user.app_metadata?.provider as string) || '';
    const authSource = provider === 'google' ? 'google' : provider === 'facebook' ? 'facebook' : 'ninjabot';
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';

    const defaultProfile = {
      id: user.id,
      email: user.email || '',
      full_name: fullName,
      role: 'user',
      auth_source: authSource,
      handle: generateUniqueHandle(user.email || undefined, fullName),
      created_at: new Date().toISOString(),
    };

    const { data: newPerfil, error: createError } = await supabase
      .from("profiles")
      .insert([defaultProfile])
      .select()
      .maybeSingle();

    if (createError) {
      console.warn('[getPerfilActual] No se pudo crear perfil automático:', createError.message);
      // Retornamos datos mínimos del usuario aunque falle la creación
      return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        phone: '',
        role: 'user',
        auth_source: authSource,
        handle: generateUniqueHandle(user.email || undefined, user.user_metadata?.full_name || user.email?.split('@')[0]),
      };
    }

    return {
      id: user.id,
      email: newPerfil?.email || user.email || '',
      full_name: newPerfil?.full_name || newPerfil?.nombre || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
      phone: newPerfil?.phone || newPerfil?.telefono || '',
      role: newPerfil?.role || newPerfil?.rol || 'user',
      auth_source: authSource,
      handle: newPerfil?.handle || generateUniqueHandle(user.email || undefined, user.user_metadata?.full_name || user.email?.split('@')[0]),
    };
  }

  if (perfilError) {
    console.warn('[getPerfilActual] Error al leer perfil, retornando datos mínimos:', perfilError.message);
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
      phone: '',
      role: 'user',
      handle: generateUniqueHandle(user.email || undefined, user.user_metadata?.full_name || user.email?.split('@')[0]),
    };
  }

  return {
    id: user.id,
    email: user.email || perfil.email,
    full_name: perfil.full_name || perfil.nombre || "",
    phone: perfil.phone || perfil.telefono || "",
    role: perfil.role || perfil.rol || "",
    auth_source: perfil.auth_source || 'ninjabot',
    handle: perfil.handle || generateUniqueHandle(user.email || undefined, perfil.full_name || perfil.nombre),
  };
};

// ==========================================
// PERFIL CON EMPRESA (tablas profiles + companies)
// ==========================================

export const getPerfilConEmpresa = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No hay usuario autenticado");

  const { data: perfil, error: perfilError } = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  if (perfilError) throw perfilError;

  return {
    id: user.id,
    email: user.email || perfil.email,
    full_name: perfil.full_name || perfil.nombre || "",
    phone: perfil.phone || perfil.telefono || "",
    role: perfil.role || perfil.rol || "",
    company_id: perfil.company_id || perfil.empresa_id,
    company: perfil.companies || perfil.empresas || null,
  };
};

// ==========================================
// SERVICIOS DE COMPANIES (tabla companies)
// ==========================================

export const createEmpresa = async (empresaData: {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}) => {
  const { data, error } = await supabase
    .from("companies")
    .insert([empresaData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEmpresa = async (empresaId: number, empresaData: {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}) => {
  const { data, error } = await supabase
    .from("companies")
    .update(empresaData)
    .eq("id", empresaId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePerfil = async (perfilId: string, perfilData: {
  full_name?: string;
  phone?: string;
  email?: string;
}) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(perfilData)
    .eq("id", perfilId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const asignarEmpresaAPerfil = async (perfilId: string, companyId: number) => {
  const { error } = await supabase
    .from("profiles")
    .update({ company_id: companyId })
    .eq("id", perfilId);

  if (error) throw error;
  return true;
};
