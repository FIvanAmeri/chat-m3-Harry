import { describe, expect, it } from 'vitest';
import { buildConversation, getFriendlyError, isValidMessage, normalizePath, ROUTES } from '../src/utils.js';

describe('normalizePath', () => {
  it('normaliza la raíz a Home', () => expect(normalizePath('/')).toBe(ROUTES.HOME));
  it('acepta rutas conocidas y elimina slash final', () => expect(normalizePath('/chat/')).toBe(ROUTES.CHAT));
  it('envía rutas desconocidas a Home', () => expect(normalizePath('/desconocida')).toBe(ROUTES.HOME));
});

describe('buildConversation', () => {
  it('recorta espacios y agrega el mensaje del usuario al final', () => {
    expect(buildConversation([{ role: 'model', text: 'Hola' }], '  Buenas  ')).toEqual([
      { role: 'model', text: 'Hola' }, { role: 'user', text: 'Buenas' }
    ]);
  });
  it('descarta roles no permitidos', () => {
    expect(buildConversation([{ role: 'system', text: 'instrucción' }], 'Hola')).toEqual([{ role: 'user', text: 'Hola' }]);
  });
});

describe('validación y errores', () => {
  it('rechaza mensajes vacíos o demasiado largos', () => {
    expect(isValidMessage('   ')).toBe(false);
    expect(isValidMessage('x'.repeat(2001))).toBe(false);
    expect(isValidMessage('Hola')).toBe(true);
  });
  it('explica el límite 429 y Retry-After', () => {
    expect(getFriendlyError(429, '3')).toContain('3 segundos');
  });
});
