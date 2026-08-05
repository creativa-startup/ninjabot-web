# 🛡️🌐 AGENTE BACKEND, SUPABASE & INTEGRACIONES OMNICANAL

## 📋 DIAGNÓSTICO: SINCRONIZACIÓN FRONTEND ↔ BACKEND EN PRODUCCIÓN

**Fecha:** 8 Mayo 2026 | **Proyecto:** `qyudscnbmdgaghsiunga` | **Estado:** ✅ Realtime Total implementado

---

## 🎯 Problema
El frontend no reflejaba los cambios del backend en producción. Supabase tenía los datos pero la lista N2 no se actualizaba.

## 🔴 CAUSA RAÍZ: Suscripción Realtime Incompleta
`useChatsData.ts` solo se suscribía a `messages` y `conversation_notes`. **Faltaban `contacts` y `conversations`**.

| Evento backend | Antes | Ahora |
|---|---|---|
| Bot crea contacto (INSERT contacts) | ❌ No aparecía | ✅ Al instante |
| Update contacto (UPDATE contacts) | ❌ Sin reflejo | ✅ Se propaga |
| Mensaje → trigger update `last_message` | ❌ Sin cambio preview | ✅ N2 en vivo |

## ✅ REMEDIACIÓN IMPLEMENTADA

### `src/services/chatService.ts` — 2 nuevos métodos:
- **`subscribeToContacts(userId, onInsert, onUpdate)`** — canal `contacts:{userId}` con listeners INSERT/UPDATE filtrados por `user_id`.
- **`subscribeToConversations(userId, onUpdate)`** — canal `conversations:{userId}` con listener UPDATE (disparado por el trigger `update_conversation_last_message`).

### `src/hooks/useChatsData.ts` — conexión en `loadData()`:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  contactsSubscription.current = subscribeToContacts(user.id,
    (nc) => setContacts(prev => prev.some(c => c.id === nc.id) ? prev : [nc, ...prev]),
    (uc) => setContacts(prev => prev.map(c => c.id === uc.id ? { ...c, ...uc } : c)),
  );
  conversationsSubscription.current = subscribeToConversations(user.id, (conv) => {
    setContacts(prev => prev.map(c => c.id !== conv.contact_id ? c : { ...c, lastMessage: conv.last_message || c.lastMessage, lastTime: /* formateado */ }));
  });
}
```
- Limpieza idempotente al desmontar: `contactsSubscription.current?.()` + `conversationsSubscription.current?.()`.
- Import estático de `supabase` (elimina `INEFFECTIVE_DYNAMIC_IMPORT` del build).

## 🟡 PENDIENTE: RLS en `contacts` y `conversations`
`migration.sql` no habilita RLS en estas 2 tablas. **SQL a ejecutar en Supabase:**

```sql
BEGIN;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_select_own" ON contacts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "contacts_insert_own" ON contacts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "contacts_update_own" ON contacts FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "contacts_delete_own" ON contacts FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_select_own" ON conversations FOR SELECT USING (user_id = auth.uid() OR contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid()));
CREATE POLICY "conversations_insert_own" ON conversations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "conversations_update_own" ON conversations FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "conversations_delete_own" ON conversations FOR DELETE USING (user_id = auth.uid());
COMMIT;
```

## 🟡 RIESGO: Contactos huérfanos
Contactos sin `user_id` se asignaron a `renatomasa@gmail.com`. Verificar que el bot copie el `user_id` correcto del tenant al insertar.

## ✅ VERIFICACIÓN
| Validación | Resultado |
|---|---|
| `npm run build` | ✅ 0 errores TypeScript |
| `subscribeToContacts` / `subscribeToConversations` | ✅ Exportados |
| Listener Realtime en hook | ✅ Conectado + limpieza |