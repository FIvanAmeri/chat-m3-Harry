import { buildConversation, getFriendlyError, isValidMessage } from './utils.js';

export async function requestHarryReply(message, history, fetchImpl = fetch) {
  if (!isValidMessage(message)) {
    throw new Error('Escribí un mensaje de entre 1 y 2000 caracteres.');
  }
  const response = await fetchImpl('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation: buildConversation(history, message) })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(getFriendlyError(response.status, response.headers.get('retry-after')));
    error.status = response.status;
    throw error;
  }
  if (typeof payload.reply !== 'string' || !payload.reply.trim()) {
    throw new Error('La respuesta llegó vacía. Probá de nuevo.');
  }
  return payload.reply.trim();
}
