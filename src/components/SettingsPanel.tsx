import React, { useState, useEffect } from "react";
import { SlidersHorizontal, Send, Sparkles, Loader2 } from "lucide-react";
import { supabase, getPerfilConEmpresa } from "../services/supabase";

interface SettingsPanelProps {
  customInstruction: string;
  setCustomInstruction: (text: string) => void;
  globalAiEnabled: boolean;
  setGlobalAiEnabled: (enabled: boolean) => void;
  userName?: string;
  userEmail?: string;
  isMobileLayout?: boolean;
}

interface TestMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  customInstruction,
  setCustomInstruction,
  globalAiEnabled,
  setGlobalAiEnabled,
  userName = "Renato",
  userEmail = "renato@ninjabot.com",
  isMobileLayout = false,
}) => {
  const [mobileModule, setMobileModule] = useState<"general" | "agent">("general");
  const [isLoadingPerfil, setIsLoadingPerfil] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [perfilId, setPerfilId] = useState<string | null>(null);

  const [userData, setUserData] = useState({
    full_name: userName || "",
    email: userEmail || "",
    phone: "",
  });

  const [businessData, setBusinessData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
  });

  const [tempUser, setTempUser] = useState({ ...userData });
  const [tempBusiness, setTempBusiness] = useState({ ...businessData });

  useEffect(() => {
    const cargarPerfilYEmpresa = async () => {
      setIsLoadingPerfil(true);
      try {
        const result = await getPerfilConEmpresa();

        setUserData({
          full_name: result.full_name || "",
          email: result.email || "",
          phone: result.phone || "",
        });

        setPerfilId(result.id);

        if (result.company_id && result.company) {
          setCompanyId(result.company_id);
          setBusinessData({
            name: result.company.name || "",
            email: result.company.email || "",
            phone: result.company.phone || "",
            address: result.company.address || "",
            description: result.company.description || "",
          });
        } else {
          setCompanyId(null);
          setBusinessData({ name: "", email: "", phone: "", address: "", description: "" });
        }
      } catch (err) {
        console.error("Error al cargar perfil y empresa:", err);
        setUserData({ full_name: userName || "", email: userEmail || "", phone: "" });
        setBusinessData({ name: "", email: "", phone: "", address: "", description: "" });
      } finally {
        setIsLoadingPerfil(false);
      }
    };
    cargarPerfilYEmpresa();
  }, [userName, userEmail]);

  useEffect(() => {
    setTempUser({ ...userData });
    setTempBusiness({ ...businessData });
  }, [userData, businessData]);

  const [testMessages, setTestMessages] = useState<TestMessage[]>([
    { id: "1", sender: "ai", text: "Mensaje de prueba", time: "08:00 pm" },
    { id: "2", sender: "user", text: "Mensaje de prueba", time: "08:00 pm" },
  ]);
  const [inputTestMessage, setInputTestMessage] = useState("");
  const [isTestingAi, setIsTestingAi] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      if (perfilId) {
        const perfilPayload: { full_name?: string; phone?: string; email?: string } = {};
        if (tempUser.full_name !== userData.full_name) perfilPayload.full_name = tempUser.full_name;
        if (tempUser.phone !== userData.phone) perfilPayload.phone = tempUser.phone;

        if (Object.keys(perfilPayload).length > 0) {
          const { data: perfilResult, error: perfilError } = await supabase
            .from("profiles")
            .update(perfilPayload)
            .eq("id", perfilId)
            .select()
            .single();

          if (perfilError) throw perfilError;
        }
      }

      const companyPayload = {
        name: tempBusiness.name,
        description: tempBusiness.description,
        address: tempBusiness.address,
        phone: tempBusiness.phone,
        email: tempBusiness.email,
      };

      if (companyId) {
        const { data: empresaResult, error: empresaError } = await supabase
          .from("companies")
            .update(companyPayload)
            .eq("id", companyId)
            .select()
            .single();

          if (empresaError) throw empresaError;
        } else {
          const { data: nuevaEmpresa, error: insertError } = await supabase
            .from("companies")
            .insert([companyPayload])
            .select()
            .single();

          if (insertError) throw insertError;

          const newCompanyId = nuevaEmpresa.id;

          if (perfilId) {
            const { error: assignError } = await supabase
              .from("profiles")
              .update({ company_id: newCompanyId })
              .eq("id", perfilId);

            if (assignError) throw assignError;
          }

          setCompanyId(newCompanyId);
        }

        setUserData({ ...tempUser });
        setBusinessData({ ...tempBusiness });
        setIsEditing(false);
      } catch (err) {
        console.error("Error al guardar datos:", err);
        alert("Error al guardar los datos. Intenta de nuevo.");
      } finally {
        setIsSaving(false);
      }
    };

    const handleCancelSettings = () => {
      setTempUser({ ...userData });
      setTempBusiness({ ...businessData });
      setIsEditing(false);
    };

    const handleSendTest = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!inputTestMessage.trim() || isTestingAi) return;

      const userText = inputTestMessage.trim();
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newUserMsg: TestMessage = { id: String(Date.now()), sender: "user", text: userText, time: nowTime };
      setTestMessages((prev) => [...prev, newUserMsg]);
      setInputTestMessage("");
      setIsTestingAi(true);

      try {
        const response = await fetch("/api/chat/ai-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contactName: userData.full_name,
            contactPhone: userData.phone,
            leadStage: "Prueba Agente",
            messages: [
              ...testMessages.map((m) => ({
                id: m.id,
                sender: m.sender === "user" ? "user" : "ia",
                text: m.text,
                timestamp: m.time,
                channel: "whatsapp",
              })),
              { id: newUserMsg.id, sender: "user", text: userText, timestamp: nowTime, channel: "whatsapp" },
            ],
            customInstruction,
          }),
        });

        const data = await response.json();
        const replyText = data.reply || "Respuesta de prueba del Agente IA de Ninjabot.";

        setTestMessages((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, sender: "ai", text: replyText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ]);
      } catch (err) {
        console.error("Test AI Reply error:", err);
        setTestMessages((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, sender: "ai", text: "Agente Ninjabot: Hola! Estoy activo para responder las consultas de tus clientes.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ]);
      } finally {
        setIsTestingAi(false);
      }
    };

    return (
      <div className="w-full h-full bg-[#eaeaea] flex flex-col overflow-y-auto select-none p-4 sm:p-6 font-sans">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="bg-black text-white px-5 py-2 rounded-full font-black text-sm sm:text-base tracking-tight inline-block shadow-sm">
            Configuraciones
          </div>
          <button
            onClick={() => setMobileModule((prev) => (prev === "general" ? "agent" : "general"))}
            className={`${isMobileLayout ? "block" : "md:hidden"} p-1.5 hover:bg-gray-200 rounded-xl transition-all cursor-pointer text-black`}
            title={mobileModule === "general" ? "Ver Agente IA" : "Ver Datos Generales"}
          >
            <SlidersHorizontal className="w-6 h-6 text-black" />
          </button>
        </div>

        {isSaving && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-lg">
              <Loader2 className="w-5 h-5 animate-spin text-gray-800" />
              <span className="text-sm font-bold text-gray-800">Guardando...</span>
            </div>
          </div>
        )}

        <div className="w-full flex-1 flex flex-col md:flex-row gap-6 min-h-0">
          <div className={`w-full ${isMobileLayout ? "w-full" : "md:w-3/5"} flex-col min-w-0 bg-[#eaeaea] ${
            isMobileLayout ? (mobileModule === "general" ? "flex" : "hidden") : mobileModule === "agent" ? "hidden md:flex" : "flex"
          }`}>
            <div className="mb-6">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 mb-3">Datos Generales</h3>
              {isLoadingPerfil ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse"><div className="h-4 w-24 bg-gray-300 rounded mb-1"></div><div className="h-3 w-16 bg-gray-200 rounded"></div></div>
                  ))}
                </div>
              ) : !isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><div className="text-sm font-extrabold text-gray-900">{userData.full_name || "-"}</div><div className="text-xs text-gray-500 font-medium">Nombre</div></div>
                  <div><div className="text-sm font-extrabold text-gray-900">{userData.email || "-"}</div><div className="text-xs text-gray-500 font-medium">Email</div></div>
                  <div><div className="text-sm font-extrabold text-gray-900">{userData.phone || "-"}</div><div className="text-xs text-gray-500 font-medium">Telefono</div></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" value={tempUser.full_name} onChange={(e) => setTempUser({ ...tempUser, full_name: e.target.value })} placeholder="Nombre" className="bg-white rounded-md px-3 py-2 text-xs font-medium text-gray-900 shadow-2xs outline-none border border-transparent focus:border-gray-400" />
                  <input type="email" value={tempUser.email} onChange={(e) => setTempUser({ ...tempUser, email: e.target.value })} placeholder="Email" className="bg-white rounded-md px-3 py-2 text-xs font-medium text-gray-900 shadow-2xs outline-none border border-transparent focus:border-gray-400" />
                  <input type="text" value={tempUser.phone} onChange={(e) => setTempUser({ ...tempUser, phone: e.target.value })} placeholder="Telefono" className="bg-white rounded-md px-3 py-2 text-xs font-medium text-gray-900 shadow-2xs outline-none border border-transparent focus:border-gray-400" />
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 mb-3">Negocio</h3>
              {isLoadingPerfil ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[1, 2, 3].map((i) => (<div key={i} className="animate-pulse"><div className="h-4 w-24 bg-gray-300 rounded mb-1"></div><div className="h-3 w-16 bg-gray-200 rounded"></div></div>))}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1, 2].map((i) => (<div key={i} className="animate-pulse"><div className="h-4 w-24 bg-gray-300 rounded mb-1"></div><div className="h-3 w-16 bg-gray-200 rounded"></div></div>))}</div>
                </div>
              ) : !isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><div className="text-sm font-extrabold text-gray-900">{businessData.name || "-"}</div><div className="text-xs text-gray-500 font-medium">Nombre del negocio</div></div>
                    <div><div className="text-sm font-extrabold text-gray-900">{businessData.email || "-"}</div><div className="text-xs text-gray-500 font-medium">Email de contacto</div></div>
                    <div><div className="text-sm font-extrabold text-gray-900">{businessData.phone || "-"}</div><div className="text-xs text-gray-500 font-medium">Telefono</div></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><div className="text-sm font-extrabold text-gray-900">{businessData.address || "-"}</div><div className="text-xs text-gray-500 font-medium">Direccion</div></div>
                    <div><div className="text-sm font-extrabold text-gray-900">{businessData.description || "-"}</div><div className="text-xs text-gray-500 font-medium">Descripcion</div></div>
                  </div>
                  <div className="pt-2">
                    <button onClick={() => { setTempUser({ ...userData }); setTempBusiness({ ...businessData }); setIsEditing(true); }} className="underline font-bold text-xs sm:text-sm text-gray-900 cursor-pointer hover:opacity-80">Editar</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" value={tempBusiness.name} onChange={(e) => setTempBusiness({ ...tempBusiness, name: e.target.value })} placeholder="Nombre del negocio" className="bg-white rounded-md px-3 py-2 text-xs font-medium text-gray-900 shadow-2xs outline-none border border-transparent focus:border-gray-400" />
                    <input type="email" value={tempBusiness.email} onChange={(e) => setTempBusiness({ ...tempBusiness, email: e.target.value })} placeholder="Email de contacto" className="bg-white rounded-md px-3 py-2 text-xs font-medium text-gray-900 shadow-2xs outline-none border border-transparent focus:border-gray-400" />
                    <input type="text" value={tempBusiness.phone} onChange={(e) => setTempBusiness({ ...tempBusiness, phone: e.target.value })} placeholder="Telefono" className="bg-white rounded-md px-3 py-2 text-xs font-medium text-gray-900 shadow-2xs outline-none border border-transparent focus:border-gray-400" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={tempBusiness.address} onChange={(e) => setTempBusiness({ ...tempBusiness, address: e.target.value })} placeholder="Direccion" className="bg-white rounded-md px-3 py-2 text-xs font-medium text-gray-900 shadow-2xs outline-none border border-transparent focus:border-gray-400" />
                    <input type="text" value={tempBusiness.description} onChange={(e) => setTempBusiness({ ...tempBusiness, description: e.target.value })} placeholder="Descripcion" className="bg-white rounded-md px-3 py-2 text-xs font-medium text-gray-900 shadow-2xs outline-none border border-transparent focus:border-gray-400" />
                  </div>
                  <div className="pt-4 flex items-center justify-between">
                    <button onClick={handleSaveSettings} disabled={isSaving} className="border-2 border-black bg-transparent hover:bg-black hover:text-white text-black font-bold text-xs sm:text-sm px-6 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed">{isSaving ? "Guardando..." : "Guardar"}</button>
                    <button onClick={handleCancelSettings} disabled={isSaving} className="underline font-bold text-xs sm:text-sm text-gray-900 cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`w-full ${isMobileLayout ? "w-full" : "md:w-2/5"} flex-col min-w-0 bg-[#d8d8db] p-4 sm:p-5 rounded-2xl border border-gray-300 shadow-2xs ${
            isMobileLayout ? (mobileModule === "agent" ? "flex" : "hidden") : mobileModule === "general" ? "hidden md:flex" : "flex"
          }`}>
            <div className="mb-6">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 mb-3">Agente IA</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-gray-800">Activar atencion todos los chats</span>
                <button onClick={() => setGlobalAiEnabled(!globalAiEnabled)} className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${globalAiEnabled ? "bg-emerald-500" : "bg-gray-400"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${globalAiEnabled ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 mb-3">Entrenar a la IA</h3>
              <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-2xs border border-gray-200 flex flex-col flex-1 min-h-[300px] sm:min-h-[360px]">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
                  {testMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`px-3.5 py-2 rounded-2xl text-xs max-w-[85%] font-medium flex items-end gap-3 ${msg.sender === "ai" ? "bg-[#dbe2f0] text-gray-900 rounded-tl-xs" : "bg-[#ececec] text-gray-900 rounded-tr-xs"}`}>
                        <span className="break-words leading-relaxed">{msg.text}</span>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                  {isTestingAi && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                      <span>Ninjabot esta pensando...</span>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendTest} className="mt-auto">
                  <div className="bg-[#ededed] rounded-full px-4 py-2 flex items-center gap-2 border border-gray-200 focus-within:ring-2 focus-within:ring-black/20">
                    <input type="text" value={inputTestMessage} onChange={(e) => setInputTestMessage(e.target.value)} placeholder="Mensaje de prueba..." className="flex-1 bg-transparent text-xs text-gray-900 outline-none font-medium placeholder-gray-500" />
                    <button type="submit" disabled={!inputTestMessage.trim() || isTestingAi} className="text-black hover:text-purple-600 disabled:opacity-40 transition-colors p-1 cursor-pointer"><Send className="w-4 h-4" /></button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
