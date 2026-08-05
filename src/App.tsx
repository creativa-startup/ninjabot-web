import { logoutUsuario, getPerfilActual, supabase, syncAuthSourceFromUser } from './services/supabase';
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Contact, Funnel, LeadStage, MessagingPlatform, NavigationTab, PlatformConnection } from './types';

import { AuthScreen } from './auth/AuthScreen';
import { PowerAppGuard } from './components/guard/PowerAppGuard';
import { MainLayout } from './components/layout/MainLayout';
import { PublicNinjatLayout } from './components/layout/PublicNinjatLayout';
import { LayoutDemo } from './demo/LayoutDemo';
import { useEnvironment } from './env/EnvironmentContext';
import { useIsMobile } from './hooks/useIsMobile';

export function App() {
  const { environment } = useEnvironment();
  const isMobile = useIsMobile();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  const [, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [funnels] = useState<Funnel[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<NavigationTab>('chats');
  const [integrationsEnabled, setIntegrationsEnabled] = useState<boolean>(false);
  const [mobileSubView, setMobileSubView] = useState<'list' | 'chat'>('list');

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [globalAiEnabled] = useState(true);
  const [customInstruction] = useState(
    "Eres un asesor de ventas de Ninjabot para WhatsApp Business. Responde en español de forma muy concisa, amable y profesional (máximo 2 oraciones). Tu meta es ofrecer información sobre la automatización de WhatsApp Business y agendar demostraciones."
  );

  // Platform connection status for omnichannel filter tabs
  const [platformStatus, setPlatformStatus] = useState<Record<string, PlatformConnection>>({
    whatsapp: 'connected',
    messenger: 'disconnected',
    instagram: 'disconnected',
  });
  const [platformToConnect, setPlatformToConnect] = useState<MessagingPlatform | null>(null);

  const [saleModalContactId, setSaleModalContactId] = useState<string | null>(null);
  const [capiActive] = useState<boolean>(true);

  // Al cruzar de móvil a PC: solo chats/contacts existen en desktop,
  // evita que aparezcan módulos antiguos no integrados al cambiar de dispositivo.
  useEffect(() => {
    if (!isMobile) {
      setActiveTab((prev) => (prev === 'chats' || prev === 'contacts' ? prev : 'chats'));
      setMobileSubView('list');
    }
  }, [isMobile]);

  const handlePlatformConnectSuccess = useCallback((_email: string, _name: string) => {
    if (platformToConnect) {
      setPlatformStatus((prev) => ({ ...prev, [platformToConnect]: 'connected' }));
    }
  }, [platformToConnect]);

  const unreadMessagesCount = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const activeContact = contacts.find((c) => c.id === activeContactId) || null;

  const activeContactForSale = saleModalContactId
    ? contacts.find((c) => c.id === saleModalContactId) || null
    : activeContact;

  const handleRegisterSale = async (saleData: { contactId: string; amount: number; description: string }) => {
    console.log('[Venta Registrada]', saleData);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setContacts((prev) =>
      prev.map((c) =>
        c.id === saleData.contactId ? { ...c, leadStage: 'Purchased' as LeadStage } : c
      )
    );
  };

  // Escuchar cambios de sesión en tiempo real
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Trazabilidad: sincroniza la entidad de origen (google/ninjabot/facebook)
          await syncAuthSourceFromUser(session.user);
          const perfil = await getPerfilActual();
          setUserEmail(perfil.email);
          setUserName(perfil.full_name || '');
          setAvatarUrl(session.user.user_metadata?.avatar_url || null);
          setIsLoggedIn(true);
        } catch {
          setUserEmail(session.user.email || '');
          setUserName(session.user.email?.split('@')[0] || 'Usuario');
          setAvatarUrl(session.user.user_metadata?.avatar_url || null);
          setIsLoggedIn(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setUserEmail('');
        setUserName('');
        setAvatarUrl(null);
        setIsLoggedIn(false);
      }
    });

    const restaurarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          // Trazabilidad: sincroniza la entidad de origen al restaurar sesión
          await syncAuthSourceFromUser(session.user);
          const perfil = await getPerfilActual();
          setUserEmail(perfil.email);
          setUserName(perfil.full_name || '');
          setAvatarUrl(session.user.user_metadata?.avatar_url || null);
          setIsLoggedIn(true);
        } catch {
          setUserEmail(session.user.email || '');
          setUserName(session.user.email?.split('@')[0] || 'Usuario');
          setAvatarUrl(session.user.user_metadata?.avatar_url || null);
          setIsLoggedIn(true);
        }
      }
      setIsAuthReady(true);
    };
    restaurarSesion();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUsuario();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    setUserEmail('');
    setUserName('');
    setAvatarUrl(null);
    setIsLoggedIn(false);
  };

  const handleSelectContact = (contact: Contact) => {
    setActiveContactId(contact.id);
    setMobileSubView('chat');
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleToggleAiAgent = (enabled: boolean) => {
    if (!activeContact) return;
    setContacts((prev) =>
      prev.map((c) => (c.id === activeContact.id ? { ...c, aiAgentEnabled: enabled } : c))
    );
  };

  const handleChangeLeadStage = (stage: LeadStage, targetContactId?: string) => {
    const idToUpdate = targetContactId || activeContactId;
    if (!idToUpdate) return;
    setContacts((prev) =>
      prev.map((c) => (c.id === idToUpdate ? { ...c, leadStage: stage } : c))
    );
  };

  const handleSendMessage = async (text: string, isFromUser: boolean = false) => {
    if (!activeContact) return;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: (isFromUser ? 'user' : 'agent') as 'user' | 'agent',
      text,
      timestamp: timeString,
      channel: 'whatsapp' as const,
      status: 'sent' as const,
    };

    const updatedMessages = [...(activeContact.messages || []), newMessage];
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContact.id ? { ...c, messages: updatedMessages, lastMessage: text, lastTime: timeString } : c
      )
    );

    if (isFromUser && activeContact.aiAgentEnabled) {
      setIsLoadingAi(true);
      try {
        const response = await fetch('/api/chat/ai-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactName: activeContact.name,
            contactPhone: activeContact.phone,
            leadStage: activeContact.leadStage,
            messages: updatedMessages,
            customInstruction,
          }),
        });
        const data = await response.json();
        const replyText = data.reply || "¡Saludos desde Ninjabot! ¿En qué puedo guiarte hoy?";
        const aiMessage = {
          id: `ai-${Date.now()}`,
          sender: 'agent' as const,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: 'ia' as const,
          status: 'read' as const,
        };
        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContact.id ? { ...c, messages: [...(c.messages || []), aiMessage], lastMessage: replyText, lastTime: aiMessage.timestamp } : c
          )
        );
      } catch (err) {
        console.error("AI Reply error:", err);
      } finally {
        setIsLoadingAi(false);
      }
    }
  };

  const handleAddContact = (
    name: string,
    phone: string,
    leadStage: LeadStage,
    firstMessage: string,
    city?: string,
    interest?: string
  ) => {
    const newId = String(Date.now());
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newContact: Contact = {
      id: newId, name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone, city: city || 'Quito',
      leadType: 'Servicio', interest: interest || funnels[0]?.interes || 'Meta Ads Esencial',
      source: 'WhatsApp', leadStage, purchases: '0', unreadCount: 1,
      lastMessage: firstMessage, lastTime: timeString, aiAgentEnabled: globalAiEnabled,
      messages: [{ id: `msg-${Date.now()}`, sender: 'user', text: firstMessage, timestamp: timeString, channel: 'whatsapp' }],
    };
    setContacts([newContact, ...contacts]);
    setActiveContactId(newId);
    setActiveTab('chats');
    setMobileSubView('chat');
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    if (activeContactId === contactId) {
      const remaining = contacts.filter((c) => c.id !== contactId);
      setActiveContactId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const fetchContactos = async () => {
    try {
      const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const mapped: Contact[] = data.map((item: any) => ({
          id: String(item.id), name: item.name || '', email: item.email || '', phone: item.phone || '',
          city: item.city || 'Quito', leadType: item.lead_type || 'Servicio', interest: item.interest || 'Meta Ads',
          source: item.source || 'WhatsApp', leadStage: (item.lead_stage || 'Lead') as LeadStage,
          purchases: String(item.purchases ?? '0'), unreadCount: item.unread_count ?? 0,
          lastMessage: item.last_message || '', lastTime: item.last_time || '',
          aiAgentEnabled: item.ai_agent_enabled ?? true, notes: item.notes || '', messages: item.messages || [],
        }));
        setContacts(mapped);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  // Antes de saber si hay sesión restaurada, evitamos destellos/redirecciones falsas
  if (!isAuthReady) {
    return (
      <div className="bg-black h-screen w-full flex items-center justify-center font-sans select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Cargando Ninjabot...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Rama Pública: /auth (sin N1-N4, sin headers globales) ─── */}
        <Route
          path="/auth"
          element={
            isLoggedIn ? (
              <Navigate to="/app" replace />
            ) : (
              <AuthScreen onAuthSuccess={handleAuthSuccess} />
            )
          }
        />

        {/* ─── Rama Privada: /app (protegida por PowerAppGuard) ─── */}
        <Route
          path="/app"
          element={
            environment === 'sandbox' ? (
              <LayoutDemo />
            ) : (
            <PowerAppGuard isLoggedIn={isLoggedIn}>
              <MainLayout
                userName={userName}
                avatarUrl={avatarUrl}
                onLogout={handleLogout}
                contacts={contacts}
                activeContactId={activeContactId}
                activeContact={activeContact}
                unreadMessagesCount={unreadMessagesCount}
                funnels={funnels}
                capiActive={capiActive}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isMobile={isMobile}
                mobileSubView={mobileSubView}
                onMobileSubViewChange={setMobileSubView}
                onSelectContact={handleSelectContact}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                isLoadingAi={isLoadingAi}
                onSendMessage={handleSendMessage}
                onToggleAiAgent={handleToggleAiAgent}
                onChangeLeadStage={handleChangeLeadStage}
                onAddContact={handleAddContact}
                onDeleteContact={handleDeleteContact}
                fetchContactos={fetchContactos}
                integrationsEnabled={integrationsEnabled}
                onToggleIntegrations={setIntegrationsEnabled}
                platformStatus={platformStatus}
                onConnectPlatform={(p) => setPlatformToConnect(p)}
                isNewContactModalOpen={isNewContactModalOpen}
                onNewContactModalClose={() => setIsNewContactModalOpen(false)}
                platformToConnect={platformToConnect}
                onPlatformConnectClose={() => setPlatformToConnect(null)}
                onPlatformConnectSuccess={handlePlatformConnectSuccess}
                saleModalContactId={saleModalContactId}
                onSaleModalClose={() => setSaleModalContactId(null)}
                onOpenSaleModal={() => setSaleModalContactId(activeContact?.id || null)}
                activeContactForSale={activeContactForSale}
                onRegisterSale={handleRegisterSale}
              />
            </PowerAppGuard>
            )
          }
        />

        {/* ─── Perfil Ninjat: /@handle (Club Privado — Cadenero + PowerAppGuard) ─── */}
        <Route
          path="/@:handle"
          element={
            <PublicNinjatLayout isLoggedIn={isLoggedIn}>
              {environment === 'sandbox' ? (
                <LayoutDemo />
              ) : (
              <PowerAppGuard isLoggedIn={isLoggedIn}>
                <MainLayout
                  userName={userName}
                  avatarUrl={avatarUrl}
                  onLogout={handleLogout}
                  contacts={contacts}
                  activeContactId={activeContactId}
                  activeContact={activeContact}
                  unreadMessagesCount={unreadMessagesCount}
                  funnels={funnels}
                  capiActive={capiActive}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  isMobile={isMobile}
                  mobileSubView={mobileSubView}
                  onMobileSubViewChange={setMobileSubView}
                  onSelectContact={handleSelectContact}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  isLoadingAi={isLoadingAi}
                  onSendMessage={handleSendMessage}
                  onToggleAiAgent={handleToggleAiAgent}
                  onChangeLeadStage={handleChangeLeadStage}
                  onAddContact={handleAddContact}
                  onDeleteContact={handleDeleteContact}
                  fetchContactos={fetchContactos}
                  integrationsEnabled={integrationsEnabled}
                  onToggleIntegrations={setIntegrationsEnabled}
                  platformStatus={platformStatus}
                  onConnectPlatform={(p) => setPlatformToConnect(p)}
                  isNewContactModalOpen={isNewContactModalOpen}
                  onNewContactModalClose={() => setIsNewContactModalOpen(false)}
                  platformToConnect={platformToConnect}
                  onPlatformConnectClose={() => setPlatformToConnect(null)}
                  onPlatformConnectSuccess={handlePlatformConnectSuccess}
                  saleModalContactId={saleModalContactId}
                  onSaleModalClose={() => setSaleModalContactId(null)}
                  onOpenSaleModal={() => setSaleModalContactId(activeContact?.id || null)}
                  activeContactForSale={activeContactForSale}
                  onRegisterSale={handleRegisterSale}
                />
              </PowerAppGuard>
              )}
            </PublicNinjatLayout>
          }
        />

        {/* ─── Fallback: redirige según sesión ─── */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? '/app' : '/auth'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}