import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export const createContacto = async (nuevoContacto: any) => {
  const { data, error } = await supabase
    .from("contacts")
    .insert([nuevoContacto])
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

export const logoutUsuario = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
};

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
    .single();

  if (perfilError) throw perfilError;

  return {
    id: user.id,
    email: user.email || perfil.email,
    full_name: perfil.full_name || perfil.nombre || "",
    phone: perfil.phone || perfil.telefono || "",
    role: perfil.role || perfil.rol || "",
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
