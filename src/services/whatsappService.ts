// ==========================================
// SERVICIO DE INTEGRACIÓN META CLOUD API (WHATSAPP)
// ==========================================

// Interfaz para la respuesta de activación
export interface WhatsAppActivationResult {
  success: boolean;
  message: string;
  wabaId?: string; // WhatsApp Business Account ID
  phoneNumberId?: string;
}

/**
 * Simula la activación de la integración con Meta Cloud API para un número de teléfono.
 * En producción, esto llamaría a los endpoints de Meta:
 *   POST /v21.0/{waba-id}/phone_numbers
 *   POST /v21.0/{phone-number-id}/register
 *
 * @param phoneNumber - Número de teléfono del contacto a activar
 * @param contactName - Nombre del contacto
 * @returns Promise con el resultado de la activación
 */
export async function activateWhatsAppIntegration(
  phoneNumber: string,
  contactName: string
): Promise<WhatsAppActivationResult> {
  // Simulación de latencia de red (1.5 a 3 segundos)
  const delay = 1500 + Math.random() * 1500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // --- EN PRODUCCIÓN: Reemplazar con llamada real a Meta Cloud API ---
  // const token = import.meta.env.VITE_META_ACCESS_TOKEN;
  // const wabaId = import.meta.env.VITE_META_WABA_ID;
  //
  // const response = await fetch(
  //   `https://graph.facebook.com/v21.0/${wabaId}/phone_numbers`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       phone_number: phoneNumber,
  //       display_name: contactName,
  //     }),
  //   }
  // );
  //
  // if (!response.ok) {
  //   const errorData = await response.json();
  //   throw new Error(errorData.error?.message || 'Error al activar WhatsApp');
  // }
  //
  // const data = await response.json();
  // return {
  //   success: true,
  //   message: `WhatsApp activado para ${contactName}`,
  //   wabaId: data.waba_id,
  //   phoneNumberId: data.id,
  // };
  // --- FIN BLOQUE PRODUCCIÓN ---

  // Simulación: 90% de éxito para demostración
  const isSuccess = Math.random() > 0.1;

  if (!isSuccess) {
    throw new Error(
      `No se pudo activar WhatsApp para ${contactName}. Verifica que el número ${phoneNumber} sea válido y esté registrado en WhatsApp.`
    );
  }

  return {
    success: true,
    message: `Integración de WhatsApp activada exitosamente para ${contactName}`,
    wabaId: '123456789',
    phoneNumberId: `whatsapp-${phoneNumber.replace(/[^0-9]/g, '')}`,
  };
}

/**
 * Verifica el estado de la integración con Meta Cloud API para un número.
 * @param phoneNumber - Número de teléfono
 * @returns Estado de la integración
 */
export async function checkWhatsAppIntegrationStatus(
  _phoneNumber: string
): Promise<{ active: boolean; details?: string }> {
  // Simulación: en producción llamaría a GET /v21.0/{phone-number-id}
  // Para demo, asumimos que la integración no está activa si no tiene el flag
  return { active: false };
}
