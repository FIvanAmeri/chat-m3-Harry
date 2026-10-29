import { describe, expect, it, vi } from 'vitest';
import { requestHarryReply } from '../src/chat.js';

describe('requestHarryReply', () => {
  it('envía historial al endpoint y devuelve la respuesta', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ reply: '¡Hola!' }), headers: { get: () => null } });
    await expect(requestHarryReply('Hola', [{ role: 'model', text: 'Bienvenido' }], fetchMock)).resolves.toBe('¡Hola!');
    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({ method: 'POST' }));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.conversation).toHaveLength(2);
  });
  it('rechaza entrada vacía sin llamar a la API', async () => {
    const fetchMock = vi.fn();
    await expect(requestHarryReply(' ', [], fetchMock)).rejects.toThrow('Escribí un mensaje');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('maneja el 429 con mensaje amigable', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}), headers: { get: () => '5' } });
    await expect(requestHarryReply('Hola', [], fetchMock)).rejects.toThrow('5 segundos');
  });
});
