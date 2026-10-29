import { requestHarryReply } from './chat.js';
import { ROUTES, normalizePath } from './utils.js';

const app = document.querySelector('#app');
const history = [];
let busy = false;

function avatarMarkup() {
  return `<div class="avatar" aria-label="Ilustración original de Harry Potter" role="img"><div class="avatar__hair"></div><div class="avatar__face"><span class="avatar__scar"></span><span class="avatar__glasses avatar__glasses--left"></span><span class="avatar__glasses avatar__glasses--right"></span><span class="avatar__bridge"></span><span class="avatar__eye avatar__eye--left"></span><span class="avatar__eye avatar__eye--right"></span><span class="avatar__nose"></span><span class="avatar__mouth"></span></div><div class="avatar__robe"></div><div class="avatar__wand"></div><span class="avatar__spark avatar__spark--one">✦</span><span class="avatar__spark avatar__spark--two">✧</span></div>`;
}

function renderHome() {
  app.innerHTML = `<section class="hero page-enter"><div class="hero__eyebrow"><span></span> EL MUNDO MÁGICO TE ESPERA <span></span></div><div class="hero__portrait">${avatarMarkup()}<div class="portrait-glow"></div></div><p class="overline">UNA LECHUZA HA LLEGADO</p><h1>Un mensaje<br><em>desde Hogwarts</em></h1><p class="hero__copy">Sentate junto al fuego, desenrollá el pergamino y conversá con Harry Potter. La próxima aventura empieza con una pregunta.</p><a class="button button--gold" href="/chat" data-link>Comenzar la conversación <span>✧</span></a><div class="hero__footnote">✦ No hace falta una carta de aceptación ✦</div></section>`;
}

function renderAbout() {
  app.innerHTML = `<section class="about page-enter"><p class="overline">SOBRE ESTA EXPERIENCIA</p><h1>Magia hecha<br><em>con palabras</em></h1><div class="about__card"><span class="about__icon">✧</span><h2>Una conversación encantada</h2><p>Esta experiencia fan-made combina una interfaz inspirada en pergaminos y castillos con Gemini, una inteligencia artificial de Google. Harry es interpretado mediante instrucciones de personalidad y el contexto de la conversación se conserva mientras la sesión está abierta.</p><p>Las respuestas se generan en tiempo real. El movimiento de la varita y la revelación del pergamino son efectos visuales de la interfaz.</p></div><a class="text-link" href="/chat" data-link>Ir a conversar <span>→</span></a></section>`;
}

function renderChat() {
  app.innerHTML = `<section class="chat-layout page-enter"><aside class="character-panel"><div class="character-panel__frame">${avatarMarkup()}</div><p class="overline">GRYFFINDOR</p><h1>Harry Potter</h1><p class="character-panel__quote">“No son nuestras habilidades las que muestran quiénes somos, sino nuestras elecciones.”</p><div class="status"><span class="status__dot"></span> Disponible en la sala común</div><div class="character-panel__rule">✦ ━━━━━ ✦</div><p class="character-panel__hint">La magia empieza cuando preguntás.</p></aside><section class="conversation" aria-label="Conversación con Harry"><div class="conversation__header"><div><p class="overline">CANAL ENCANTADO</p><h2>Tu correspondencia</h2></div><button class="clear-button" id="clear-chat" type="button">Nuevo pergamino ↺</button></div><div class="messages" id="messages" aria-live="polite"><div class="welcome-note"><span class="welcome-note__seal">H</span><p>La tinta todavía está fresca. Escribí tu mensaje y dejá que una nueva historia comience.</p><span class="welcome-note__flourish">✧</span></div></div><form class="composer" id="composer"><label class="sr-only" for="message-input">Tu mensaje para Harry</label><textarea id="message-input" name="message" maxlength="2000" rows="1" placeholder="Escribí tu mensaje, mago…" required></textarea><button class="send-button" id="send-button" type="submit" aria-label="Enviar mensaje"><span>Enviar</span><span aria-hidden="true">✦</span></button></form><p class="composer__note">Enter para enviar · Shift + Enter para nueva línea</p></section></section>`;
  history.forEach((item) => appendMessage(item.role === 'user' ? 'user' : 'harry', item.text, { animate: false }));
  document.querySelector('#composer').addEventListener('submit', handleSend);
  document.querySelector('#message-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#composer').requestSubmit();
    }
  });
  document.querySelector('#clear-chat').addEventListener('click', () => {
    history.length = 0;
    renderChat();
  });
}

function appendMessage(role, text, { animate = false } = {}) {
  const messages = document.querySelector('#messages');
  if (!messages) return;
  messages.querySelector('.welcome-note')?.remove();
  const article = document.createElement('article');
  article.className = `message-card message-card--${role}`;

  if (role === 'harry') {
    article.innerHTML = `<div class="message-card__label">${avatarMarkup()}<span>Harry Potter</span><span class="message-card__star">✦</span></div><div class="parchment"><p class="parchment__text"></p><span class="parchment__edge" aria-hidden="true"></span></div>`;
    const textContainer = article.querySelector('.parchment__text');
    const parchment = article.querySelector('.parchment');

    if (animate) {
      parchment.classList.add('parchment--typing');
      let index = 0;
      const speed = 15; 
      function typeWriter() {
        if (index < text.length) {
          textContainer.textContent += text.charAt(index);
          index++;
          messages.scrollTop = messages.scrollHeight;
          setTimeout(typeWriter, speed);
        } else {
          parchment.classList.remove('parchment--typing');
          parchment.classList.add('parchment--flash');
          setTimeout(() => parchment.classList.remove('parchment--flash'), 600);
        }
      }
      setTimeout(typeWriter, 100);
    } else {
      textContainer.textContent = text;
    }
  } else {
    article.innerHTML = `<div class="user-message__label">TU MENSAJE</div><p class="user-message__text"></p>`;
    article.querySelector('.user-message__text').textContent = text;
  }

  messages.append(article);
  messages.scrollTop = messages.scrollHeight;
  return article;
}

function setThinking(active) {
  const panel = document.querySelector('.character-panel');
  panel?.classList.toggle('is-thinking', active);
  const send = document.querySelector('#send-button');
  if (send) {
    send.disabled = active;
    send.innerHTML = active ? '<span>Consultando</span><span aria-hidden="true">✧</span>' : '<span>Enviar</span><span aria-hidden="true">✦</span>';
  }
  const messages = document.querySelector('#messages');
  if (active && messages) {
    const thinking = document.createElement('div');
    thinking.className = 'thinking-note';
    thinking.id = 'thinking-note';
    thinking.innerHTML = `<span class="thinking-note__spark">✧</span><span>Harry está pensando…</span><span class="thinking-dots"><i></i><i></i><i></i></span>`;
    messages.append(thinking);
    messages.scrollTop = messages.scrollHeight;
  } else {
    document.querySelector('#thinking-note')?.remove();
  }
}

async function handleSend(event) {
  event.preventDefault();
  if (busy) return;
  const input = document.querySelector('#message-input');
  const message = input.value.trim();
  if (!message) return;
  busy = true;
  appendMessage('user', message);
  input.value = '';
  input.disabled = true;
  setThinking(true);
  try {
    const reply = await requestHarryReply(message, history);
    history.push({ role: 'user', text: message }, { role: 'model', text: reply });
    appendMessage('harry', reply, { animate: true });
  } catch (error) {
    appendMessage('harry', error.message || 'Algo salió mal. Intentá de nuevo.');
  } finally {
    setThinking(false);
    input.disabled = false;
    input.focus();
    busy = false;
  }
}

function renderRoute() {
  const route = normalizePath(window.location.pathname);
  document.querySelectorAll('[data-link]').forEach((link) => link.classList.toggle('is-active', normalizePath(new URL(link.href).pathname) === route));
  if (route === ROUTES.CHAT) renderChat();
  else if (route === ROUTES.ABOUT) renderAbout();
  else renderHome();
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-link]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const destination = new URL(link.href, window.location.origin);
  if (destination.origin !== window.location.origin) return;
  event.preventDefault();
  const path = normalizePath(destination.pathname);
  if (window.location.pathname !== path) window.history.pushState({}, '', path);
  renderRoute();
});
window.addEventListener('popstate', renderRoute);
renderRoute();
