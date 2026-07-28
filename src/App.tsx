import { loginUsuario, logoutUsuario, getPerfilActual, getPerfilConEmpresa, supabase } from './services/supabase';
import { useState, useEffect } from 'react';
import type { Contact, Funnel, LeadStage, NavigationTab } from './types';

import { Header } from './components/Header';
import { SidebarPC } from './components/SidebarPC';
import { MobileTabs } from './components/MobileTabs';
import { ChatListPanel } from './components/ChatListPanel';
import { ChatDetailPanel } from './components/ChatDetailPanel';
import { FunnelPanel } from './components/FunnelPanel';
import { ContactsPanel } from './components/ContactsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { NewContactModal } from './components/NewContactModal';
import { LoginScreen } from './components/LoginScreen';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<NavigationTab>('chats');
  const [mobileSubView, setMobileSubView] = useState<'list' | 'chat'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [globalAiEnabled, setGlobalAiEnabled] = useState(true);
  const [customInstruction, setCustomInstruction] = useState(
    "Eres un asesor de ventas de Ninjabot para WhatsApp Business. Responde en espaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±ol de forma muy concisa, amable y profesional (mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ximo 2 oraciones). Tu meta es ofrecer informaciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n sobre la automatizaciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n de WhatsApp Business y agendar demostraciones."
  );

  const activeContact = contacts.find((c) => c.id === activeContactId) || null;

  // Escuchar cambios de sesiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n en tiempo real
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const perfil = await getPerfilActual();
          setUserEmail(perfil.email);
          setUserName(perfil.full_name || perfil.nombre || '');
          setIsLoggedIn(true);
        } catch {
          // Fallback si no hay perfil en la tabla perfiles
          setUserEmail(session.user.email || '');
          setUserName(session.user.email?.split('@')[0] || 'Usuario');
          setIsLoggedIn(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setUserEmail('');
        setUserName('');
        setIsLoggedIn(false);
      }
    });

    // Verificar si ya hay una sesiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n activa al cargar
    const restaurarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const perfil = await getPerfilActual();
          setUserEmail(perfil.email);
          setUserName(perfil.full_name || perfil.nombre || '');
          setIsLoggedIn(true);
        } catch {
          setUserEmail(session.user.email || '');
          setUserName(session.user.email?.split('@')[0] || 'Usuario');
          setIsLoggedIn(true);
        }
      }
    };
    restaurarSesion();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUsuario();
    } catch (err) {
      console.error('Error al cerrar sesiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n:', err);
    }
    setUserEmail('');
    setUserName('');
    setIsLoggedIn(false);
  };

  const handleAddFunnel = (newFunnel: Funnel) => {
    setFunnels((prev) => [...prev, newFunnel]);
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
      sender: (isFromUser ? 'user' : 'agent') as 'user' | 'agent' | 'ia',
      text,
      timestamp: timeString,
      channel: 'whatsapp' as const,
      status: 'sent' as const,
    };

    const updatedMessages = [...(activeContact.messages || []), newMessage];
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContact.id
          ? {
              ...c,
              messages: updatedMessages,
              lastMessage: text,
              lastTime: timeString,
            }
          : c
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
        const replyText = data.reply || "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡Saludos desde Ninjabot! ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿En quÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© puedo guiarte hoy?";

        const aiMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ia' as const,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: 'ia' as const,
          status: 'read' as const,
        };

        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContact.id
              ? {
                  ...c,
                  messages: [...(c.messages || []), aiMessage],
                  lastMessage: replyText,
                  lastTime: aiMessage.timestamp,
                }
              : c
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
      id: newId,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone,
      city: city || 'Quito',
      leadType: 'Servicio',
      interest: interest || funnels[0]?.interes || 'Meta Ads Esencial',
      source: 'WhatsApp',
      leadStage,
      purchases: '0',
      unreadCount: 1,
      lastMessage: firstMessage,
      lastTime: timeString,
      aiAgentEnabled: globalAiEnabled,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          text: firstMessage,
          timestamp: timeString,
          channel: 'whatsapp',
        },
      ],
    };

    setContacts([newContact, ...contacts]);
    setActiveContactId(newId);
    setActiveTab('chats');
    setMobileSubView('chat');
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === updatedContact.id ? updatedContact : c))
    );
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    if (activeContactId === contactId) {
      const remaining = contacts.filter((c) => c.id !== contactId);
      setActiveContactId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleAddRawContact = (newContact: Contact) => {
    setContacts((prev) => [newContact, ...prev]);
  };

  const handleLoadDataset = (datasetContacts: Contact[]) => {
    setContacts(datasetContacts);
    if (datasetContacts.length > 0) {
      setActiveContactId(datasetContacts[0].id);
    }
  };

  // Fetch contacts from Supabase and map to Contact type
  const fetchContactos = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const mapped: Contact[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name || '',
          email: item.email || '',
          phone: item.phone || '',
          city: item.city || 'Quito',
          leadType: item.lead_type || 'Servicio',
          interest: item.interest || 'Meta Ads',
          source: item.source || 'WhatsApp',
          leadStage: (item.lead_stage || 'Lead Nuevo') as LeadStage,
          purchases: String(item.purchases ?? '0'),
          unreadCount: item.unread_count ?? 0,
          lastMessage: item.last_message || '',
          lastTime: item.last_time || '',
          aiAgentEnabled: item.ai_agent_enabled ?? true,
          notes: item.notes || '',
          messages: item.messages || [],
        }));
        setContacts(mapped);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden font-sans">

      <main className="flex-1 w-full h-full overflow-hidden flex">
        {window.innerWidth >= 768 && (
          <div className="w-full h-full bg-white flex overflow-hidden">
            <SidebarPC
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogoutClick={handleLogout}
            />

            <div className="flex-1 flex flex-col h-full min-w-0">
              <Header
                subtitle="MensajerÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a Inteligente"
                showLogoIcon={false}
                userName={userName}
              />

              <div className="flex-1 flex h-full min-h-0 overflow-hidden">
                {activeTab === 'chats' && (
                  <>
                    <div className="w-80 lg:w-96 shrink-0 h-full">
                      <ChatListPanel
                        contacts={contacts}
                        activeContactId={activeContactId}
                        onSelectContact={handleSelectContact}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onNewContactClick={() => setIsNewContactModalOpen(true)}
                      />
                    </div>
                    <div className="flex-1 h-full min-w-0">
                      {activeContact ? (
                        <ChatDetailPanel
                          contact={activeContact}
                          onSendMessage={handleSendMessage}
                          onToggleAiAgent={handleToggleAiAgent}
                          onChangeLeadStage={(stage) => handleChangeLeadStage(stage)}
                          isLoadingAi={isLoadingAi}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#eaeaea] text-gray-500 text-sm">
                          Selecciona un chat para comenzar
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === 'contacts' && (
                  <ContactsPanel
                    contacts={contacts}
                    funnels={funnels}
                    onSelectContact={(c) => {
                      handleSelectContact(c);
                      setActiveTab('chats');
                    }}
                    onUpdateContact={handleUpdateContact}
                    onDeleteContact={handleDeleteContact}
                    onAddContact={handleAddRawContact}
                    onLoadDataset={handleLoadDataset}
                    onNewContactClick={() => setIsNewContactModalOpen(true)}
                    fetchContactos={fetchContactos}
                    isMobileLayout={false}
                  />
                )}

                {activeTab === 'funnel' && (
                  <FunnelPanel
                    contacts={contacts}
                    funnels={funnels}
                    onAddFunnel={handleAddFunnel}
                    onSelectContact={(c) => {
                      handleSelectContact(c);
                      setActiveTab('chats');
                      setMobileSubView('chat');
                    }}
                    onChangeLeadStage={(id, stage) => handleChangeLeadStage(stage, id)}
                    isMobileLayout={false}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsPanel
                    customInstruction={customInstruction}
                    setCustomInstruction={setCustomInstruction}
                    globalAiEnabled={globalAiEnabled}
                    setGlobalAiEnabled={setGlobalAiEnabled}
                    userName={userName}
                    userEmail={userEmail}
                    isMobileLayout={false}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {window.innerWidth < 768 && (
          <div className="w-full h-full bg-white flex flex-col overflow-hidden relative">
            {activeTab === 'chats' && (
              <>
                {mobileSubView === 'list' && (
                  <div className="w-full h-full flex flex-col">
                    <Header subtitle="MensajerÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a Inteligente" userName={userName} />
                    <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="flex-1 overflow-hidden">
                      <ChatListPanel
                        contacts={contacts}
                        activeContactId={activeContactId}
                        onSelectContact={handleSelectContact}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onNewContactClick={() => setIsNewContactModalOpen(true)}
                      />
                    </div>
                  </div>
                )}

                {(mobileSubView === 'chat') && (
                  <div className="w-full h-full flex flex-col">
                    <Header
                      subtitle="MensajerÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a Inteligente"
                      showBackArrow={true}
                      onBackClick={() => setMobileSubView('list')}
                      userName={userName}
                    />
                    <div className="flex-1 overflow-hidden">
                      {activeContact ? (
                        <ChatDetailPanel
                          contact={activeContact}
                          onSendMessage={handleSendMessage}
                          onToggleAiAgent={handleToggleAiAgent}
                          onChangeLeadStage={(stage) => handleChangeLeadStage(stage)}
                          showBackArrow={false}
                          onBackClick={() => setMobileSubView('list')}
                          isLoadingAi={isLoadingAi}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#eaeaea]">
                          Selecciona un chat
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab !== 'chats' && (
              <div className="w-full h-full flex flex-col">
                <Header subtitle="MensajerÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a Inteligente" userName={userName} />
                <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="flex-1 overflow-hidden">
                  {activeTab === 'contacts' && (
                    <ContactsPanel
                      contacts={contacts}
                      funnels={funnels}
                      onSelectContact={(c) => {
                        handleSelectContact(c);
                        setActiveTab('chats');
                      }}
                      onUpdateContact={handleUpdateContact}
                      onDeleteContact={handleDeleteContact}
                      onAddContact={handleAddRawContact}
                      onLoadDataset={handleLoadDataset}
                      onNewContactClick={() => setIsNewContactModalOpen(true)}
                      fetchContactos={fetchContactos}
                      isMobileLayout={true}
                    />
                  )}

                  {activeTab === 'funnel' && (
                    <FunnelPanel
                      contacts={contacts}
                      funnels={funnels}
                      onAddFunnel={handleAddFunnel}
                      onSelectContact={(c) => {
                        handleSelectContact(c);
                        setActiveTab('chats');
                        setMobileSubView('chat');
                      }}
                      onChangeLeadStage={(id, stage) => handleChangeLeadStage(stage, id)}
                      isMobileLayout={true}
                    />
                  )}

                  {activeTab === 'settings' && (
                    <SettingsPanel
                      customInstruction={customInstruction}
                      setCustomInstruction={setCustomInstruction}
                      globalAiEnabled={globalAiEnabled}
                      setGlobalAiEnabled={setGlobalAiEnabled}
                      userName={userName}
                      userEmail={userEmail}
                      isMobileLayout={true}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <NewContactModal
        isOpen={isNewContactModalOpen}
        onClose={() => setIsNewContactModalOpen(false)}
        funnels={funnels}
        onAddContact={handleAddContact}
      />
    </div>
  );
}

export default App;