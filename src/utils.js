export const ROUTES = Object.freeze({ HOME: '/home', CHAT: '/chat', ABOUT: '/about' });

export function normalizePath(pathname) {
  if (pathname === '/' || pathname === '') return ROUTES.HOME;
  const cleanPath = pathname.replace(/\/+$/, '');
  return Object.values(ROUTES).includes(cleanPath) ? cleanPath : ROUTES.HOME;
}

export function buildConversation(history, message, limit = 20) {
  const safeHistory = Array.isArray(history)
    ? history.filter((item) => item && ['user', 'model'].includes(item.role) && typeof item.text === 'string')
    : [];
  const clipped = safeHistory.slice(-(limit - 1));
  return [...clipped, { role: 'user', text: message.trim() }];
}

export function getFriendlyError(status, retryAfter) {
  if (status === 429) {
    const seconds = Number(retryAfter);
    return Number.isFinite(seconds) && seconds > 0
      ? `El Gran Comedor está muy concurrido. Esperá ${Math.ceil(seconds)} segundos antes de volver a intentarlo.`
      : 'El Gran Comedor está muy concurrido. Esperá un momento antes de volver a intentarlo.';
  }
  if (status === 400) return 'Ese mensaje llegó con un hechizo incompleto. Probá escribirlo de otra manera.';
  if (status === 503) return 'La magia no está disponible por ahora. Intentá de nuevo en unos instantes.';
  return 'La lechuza no pudo entregar tu mensaje. Revisá tu conexión e intentá otra vez.';
}

export function isValidMessage(message) {
  return typeof message === 'string' && message.trim().length > 0 && message.trim().length <= 2000;
}
