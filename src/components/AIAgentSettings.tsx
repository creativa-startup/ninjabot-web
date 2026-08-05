import React, { useState } from 'react';
import { Send, Sparkles, Bot } from 'lucide-react';

interface TestMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
}

interface AIAgentSettingsProps {
  customInstruction: string;
  setCustomInstruction: (text: string) => void;
  globalAiEnabled: boolean;
  setGlobalAiEnabled: (enabled: boolean) => void;
}

export const AIAgentSettings: React.FC<AIAgentSettingsProps> = ({
  customInstruction, setCustomInstruction, globalAiEnabled, setGlobalAiEnabled,
}) => {
  const [testMessages, setTestMessages] = useState<TestMessage[]>([
    { id: "1", sender: "ai", text: "Mensaje de prueba", time: "08:00 pm" },
    { id: "2", sender: "user", text: "Mensaje de prueba", time: "08:00 pm" },
  ]);
  const [inputTestMessage, setInputTestMessage] = useState("");
  const [isTestingAi, setIsTestingAi] = useState(false);

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
          contactName: "Prueba",
          contactPhone: "",
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
    <div className="p-5 sm:p-6 max-w-2xl space-y-6">
      {/* Toggle Global */}
      <div>
        <h3 className="font-extrabold text-base sm:text-lg text-gray-900 mb-4">Agente IA</h3>
        <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-800">Activar atención en todos los chats</span>
          </div>
          <button
            onClick={() => setGlobalAiEnabled(!globalAiEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${globalAiEnabled ? "bg-emerald-500" : "bg-gray-400"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${globalAiEnabled ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Custom Instruction */}
      <div>
        <h4 className="font-extrabold text-sm text-gray-900 mb-2">Instrucción personalizada</h4>
        <textarea
          value={customInstruction}
          onChange={(e) => setCustomInstruction(e.target.value)}
          rows={3}
          className="w-full bg-white rounded-xl p-3 text-xs font-medium text-gray-900 border border-gray-200 shadow-xs outline-none focus:ring-2 focus:ring-black/20 resize-none"
        />
      </div>

      {/* Training Simulator */}
      <div>
        <h4 className="font-extrabold text-sm text-gray-900 mb-3">Entrenar a la IA</h4>
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-200 flex flex-col min-h-[320px]">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3 max-h-[240px]">
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
                <span>Ninjabot está pensando...</span>
              </div>
            )}
          </div>
          <form onSubmit={handleSendTest} className="mt-auto">
            <div className="bg-[#ededed] rounded-full px-4 py-2 flex items-center gap-2 border border-gray-200 focus-within:ring-2 focus-within:ring-black/20">
              <input
                type="text"
                value={inputTestMessage}
                onChange={(e) => setInputTestMessage(e.target.value)}
                placeholder="Mensaje de prueba..."
                className="flex-1 bg-transparent text-xs text-gray-900 outline-none font-medium placeholder-gray-500"
              />
              <button type="submit" disabled={!inputTestMessage.trim() || isTestingAi} className="text-black hover:text-purple-600 disabled:opacity-40 transition-colors p-1 cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};