import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase, getPerfilConEmpresa } from "../services/supabase";
import { SettingsSidebar } from "./SettingsSidebar";
import type { SettingsTab } from "./SettingsSidebar";
import { ProfileSettings } from "./ProfileSettings";
import { CompanySettings } from "./CompanySettings";
import { AIAgentSettings } from "./AIAgentSettings";

interface SettingsPanelProps {
  customInstruction: string;
  setCustomInstruction: (text: string) => void;
  globalAiEnabled: boolean;
  setGlobalAiEnabled: (enabled: boolean) => void;
  userName?: string;
  userEmail?: string;
  isMobileLayout?: boolean;
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
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
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

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      if (perfilId) {
        const perfilPayload: { full_name?: string; phone?: string; email?: string } = {};
        if (tempUser.full_name !== userData.full_name) perfilPayload.full_name = tempUser.full_name;
        if (tempUser.phone !== userData.phone) perfilPayload.phone = tempUser.phone;

        if (Object.keys(perfilPayload).length > 0) {
          const { error: perfilError } = await supabase
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
        const { error: empresaError } = await supabase
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

  const renderRightPanel = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileSettings
            userData={userData}
            tempUser={tempUser}
            setTempUser={setTempUser}
            isEditing={isEditing}
            isLoading={isLoadingPerfil}
            isSaving={isSaving}
            onEdit={() => setIsEditing(true)}
            onSave={handleSaveSettings}
            onCancel={handleCancelSettings}
          />
        );
      case "company":
        return (
          <CompanySettings
            businessData={businessData}
            tempBusiness={tempBusiness}
            setTempBusiness={setTempBusiness}
            isEditing={isEditing}
            isLoading={isLoadingPerfil}
            isSaving={isSaving}
            onEdit={() => setIsEditing(true)}
            onSave={handleSaveSettings}
            onCancel={handleCancelSettings}
          />
        );
      case "ai_agent":
        return (
          <AIAgentSettings
            customInstruction={customInstruction}
            setCustomInstruction={setCustomInstruction}
            globalAiEnabled={globalAiEnabled}
            setGlobalAiEnabled={setGlobalAiEnabled}
          />
        );
    }
  };

  // Mobile: tab horizontal
  if (isMobileLayout) {
    const MOBILE_TABS: { id: SettingsTab; label: string }[] = [
      { id: "profile", label: "Perfil" },
      { id: "company", label: "Empresa" },
      { id: "ai_agent", label: "Agente IA" },
    ];

    return (
      <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden select-none font-sans">
        <div className="flex items-center gap-1 px-3 py-2.5 bg-white border-b border-slate-200 shrink-0 overflow-x-auto">
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id ? "bg-black text-white shadow-sm" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {renderRightPanel()}
        </div>
        {isSaving && <SavingOverlay />}
      </div>
    );
  }

  // PC: Master-Detail layout
  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block h-full">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Right panel */}
      <div className="flex-1 h-full overflow-y-auto p-8">
        {renderRightPanel()}
      </div>

      {isSaving && <SavingOverlay />}
    </div>
  );
};

const SavingOverlay: React.FC = () => (
  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-lg">
      <Loader2 className="w-5 h-5 animate-spin text-gray-800" />
      <span className="text-sm font-bold text-gray-800">Guardando...</span>
    </div>
  </div>
);