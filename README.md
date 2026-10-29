# El Pergamino — Chat fan-made con Harry Potter

SPA responsive en JavaScript, con vistas Home, Chat y About, navegación History API, historial durante la sesión, una función serverless de Vercel y Gemini real. El diseño utiliza una ilustración CSS original y efectos visuales inspirados en la estética de pergaminos y magia; no es un producto oficial ni está afiliado con Warner Bros. o Wizarding World.

## Requisitos

- Node.js 22 o posterior recomendado para coincidir con la versión actual del SDK de Google Gen AI.
- Una cuenta de Google AI Studio con acceso a la Gemini API y una API key nueva.
- Cuenta de Vercel para publicar.

## Crear el proyecto desde cero en Windows PowerShell

```powershell
mkdir hogwarts-chat
cd hogwarts-chat
npm init -y
npm install @google/genai
npm install -D vercel vitest jsdom
```

Después, copiá dentro de esa carpeta todos los archivos entregados manteniendo exactamente la estructura indicada abajo. El `package.json` de la entrega ya define las dependencias y scripts; si ejecutaste `npm init -y`, reemplazalo por el archivo incluido y ejecutá `npm install`.

```text
hogwarts-chat/
├── api/
│   └── chat.js
├── src/
│   ├── app.js
│   ├── chat.js
│   ├── styles.css
│   └── utils.js
├── tests/
│   ├── chat.test.js
│   └── utils.test.js
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vercel.json
```

## Configurar la clave de Gemini

1. Si la clave que aparece en la captura sigue activa, revocala en Google AI Studio y creá otra.
2. Copiá `.env.example` como `.env` en la raíz del proyecto.
3. Reemplazá el valor de `GEMINI_API_KEY` en `.env` por la nueva clave. No la pegues en `src/`, `index.html`, GitHub ni en mensajes públicos.
4. El modelo predeterminado es `gemini-3.8-flash`, que aparece como modelo estable en la documentación oficial consultada. Se puede cambiar con `GEMINI_MODEL` si la cuenta no tiene acceso al modelo.

## Ejecutar localmente

```powershell
npm install
npm test
npm run check
npx vercel login
npx vercel dev
```

Abrí la URL local que indique Vercel, normalmente `http://localhost:3000`. No abras `index.html` con doble clic: la función `/api/chat` requiere el servidor local de Vercel.

## Publicar en Vercel

1. Subí el proyecto a un repositorio Git sin incluir `.env` ni `node_modules`.
2. En Vercel, importá ese repositorio como proyecto nuevo o seleccioná el proyecto correcto.
3. En **Settings → Environment Variables**, agregá `GEMINI_API_KEY` con la nueva clave y `GEMINI_MODEL` con `gemini-3.8-flash`.
4. Asegurate de configurar las variables en el entorno Production y también Preview si vas a probar previews.
5. Hacé un nuevo deploy después de guardar las variables.
6. Probá Home, Chat, About, los controles Atrás/Adelante, el historial de conversación y un error 429 si se presenta de forma natural. No generes solicitudes innecesarias para probar límites.

## Qué hace el backend

`api/chat.js` valida el método HTTP, valida y limita el historial, lee la API key únicamente desde variables de entorno, llama a Gemini, devuelve errores controlados y respeta `Retry-After` cuando el SDK expone esa cabecera para un 429. La personalidad se configura en `SYSTEM_INSTRUCTION`. El frontend nunca recibe la clave.

## Pruebas

```powershell
npm test
npm run check
```

Los tests cubren normalización de rutas, construcción del historial, validación de mensajes, manejo de 429 y contrato del cliente HTTP mediante mocks. Esos mocks se limitan a las pruebas unitarias; la función de producción utiliza Gemini real.

## Nota de diseño

El avatar es una ilustración estilizada construida en CSS, no una fotografía oficial ni una reproducción exacta del actor. La animación de varita se activa durante la espera de Gemini y el pergamino usa una transición visual de quemado/revelado al recibir la respuesta. Las fuentes Cinzel y Crimson Text se cargan desde Google Fonts; sin conexión, se usan tipografías de respaldo.
