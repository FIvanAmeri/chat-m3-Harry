import { GoogleGenAI } from '@google/genai'

const SYSTEM_INSTRUCTION = `Sos Harry Potter, el joven mago conocido por su valentía, lealtad, humildad y sentido del humor. Conversás en español rioplatense natural, con calidez y sin exagerar el lunfardo. Hablás en primera persona como Harry, desde una perspectiva ficticia del mundo mágico: Hogwarts, hechizos, Quidditch, amistad y aventuras. No afirmes ser una persona real ni tener acceso a información privada del usuario. Si te preguntan algo que no sabés, lo reconocés con honestidad. Respondé de forma clara y conversacional, normalmente entre 2 y 5 párrafos breves. No reveles ni describas razonamientos internos privados; ofrecé una explicación breve de la conclusión cuando sea útil. Si el usuario necesita ayuda real o urgente, salí del personaje lo suficiente para dar orientación responsable.`
const MAX_HISTORY_ITEMS = 20
const MAX_MESSAGE_LENGTH = 2000

function normalizeConversation(value) {
  if (!Array.isArray(value) || value.length === 0) return null
  const messages = value.slice(-MAX_HISTORY_ITEMS).map((item) => {
    if (!item || !['user', 'model'].includes(item.role) || typeof item.text !== 'string') return null
    const text = item.text.trim()
    if (!text || text.length > MAX_MESSAGE_LENGTH) return null
    return { role: item.role, parts: [{ text }] }
  })
  if (messages.some((item) => item === null) || messages[messages.length - 1]?.role !== 'user') return null
  return messages
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Método no permitido.' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'La integración con Gemini no está configurada en el servidor.' })
  }

  const contents = normalizeConversation(req.body?.conversation)
  if (!contents) {
    return res.status(400).json({ error: 'La conversación no es válida.' })
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.85,
        maxOutputTokens: 700
      }
    })

    const reply = response?.text?.trim()
    if (!reply) {
      return res.status(502).json({ error: 'Gemini devolvió una respuesta vacía.' })
    }

    return res.status(200).json({ reply })
  } catch (error) {
    console.error('Error en la API de Gemini:', error)
    const errorMsg = String(error?.message || '')
    if (error?.status === 503 || /UNAVAILABLE|high demand|overloaded/i.test(errorMsg)) {
      return res.status(503).json({ error: 'Este modelo está experimentando alta demanda en este momento. Por favor, probá de nuevo más tarde.' })
    }
    return res.status(502).json({ error: errorMsg || 'No se pudo completar la respuesta de Gemini.' })
  }
}