require('dotenv').config();
const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!TELEGRAM_TOKEN || !ANTHROPIC_API_KEY) {
  console.error('❌ Faltan variables de entorno. Copia .env.example a .env y completa los valores.');
  process.exit(1);
}

const bot = new Telegraf(TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ============================================
// PERSISTENCIA - Archivo JSON local
// ============================================

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'apolo.json');

function loadData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ pendientes: [], recordatorios: [] }));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ============================================
// HISTORIAL DE CONVERSACIÓN POR USUARIO
// ============================================

const conversaciones = new Map();

function getHistorial(userId) {
  if (!conversaciones.has(userId)) {
    conversaciones.set(userId, []);
  }
  return conversaciones.get(userId);
}

function addMensaje(userId, role, content) {
  const historial = getHistorial(userId);
  historial.push({ role, content });
  // Mantener solo los últimos 20 mensajes para no exceder tokens
  if (historial.length > 20) historial.splice(0, historial.length - 20);
}

// ============================================
// SYSTEM PROMPT - Personalidad de APOLO
// ============================================

function getSystemPrompt() {
  const data = loadData();
  const ahora = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return `Eres APOLO, el secretario personal y asistente de confianza de Enzo (Vincenzo Zegarra).

## Fecha actual
${ahora}

## Quién es Enzo
- Su nombre completo es Vincenzo Zegarra, conocido como Enzo
- Tiene pareja que se llama Sari
- Cumpleaños de Enzo: 19 de diciembre
- Aniversario con Sari: 17 de noviembre
- Tiene dos motos: una Harley-Davidson y una BMW
- Trabaja relacionado a negocios como clinic y FUCSI
- Tiene suscripciones: Apple, Netflix, Spotify

## Pendientes y recordatorios actuales
Pendientes: ${data.pendientes.length > 0 ? data.pendientes.map((p, i) => `${i + 1}. ${p}`).join(', ') : 'ninguno por ahora'}
Recordatorios: ${data.recordatorios.length > 0 ? data.recordatorios.map((r, i) => `${i + 1}. ${r}`).join(', ') : 'ninguno por ahora'}

## Tu personalidad
- Eres cercano, directo y eficiente — no das respuestas largas innecesarias
- Conoces bien a Enzo y anticipas sus necesidades
- Usas español natural y fluido
- Puedes usar algunos emojis pero sin exagerar
- Si Enzo menciona algo importante, lo anotas y lo recuerdas
- Cuando detectas una tarea o pendiente en el mensaje, lo mencionas

## Tus capacidades
- Gestionar agenda, recordatorios y pendientes
- Recordar fechas importantes
- Dar checklists de revisión para las motos
- Conversar con inteligencia sobre cualquier tema relevante para Enzo
- Recordar el contexto de la conversación actual

Responde siempre en español, de forma concisa y útil.`;
}

// ============================================
// LLAMADA A CLAUDE
// ============================================

async function llamarClaude(userId, mensajeUsuario) {
  addMensaje(userId, 'user', mensajeUsuario);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: getSystemPrompt(),
    messages: getHistorial(userId),
  });

  const respuesta = response.content[0].text;
  addMensaje(userId, 'assistant', respuesta);
  return respuesta;
}

// ============================================
// COMANDOS DEL BOT
// ============================================

bot.start(async (ctx) => {
  const respuesta = await llamarClaude(ctx.from.id, '¡Hola! Preséntate brevemente.');
  ctx.reply(respuesta);
});

bot.help((ctx) => {
  ctx.replyWithMarkdown(`📚 *Comandos de APOLO*

/start - Saludo
/agenda - Ver agenda del día
/recordar [nota] - Agregar recordatorio
/pendientes - Ver y gestionar pendientes
/borrar [número] - Borrar un pendiente
/fechas - Fechas importantes
/moto harley o /moto bmw - Checklist de revisión
/limpiar - Reiniciar la conversación`);
});

bot.command('agenda', async (ctx) => {
  const respuesta = await llamarClaude(ctx.from.id, '¿Cómo está mi agenda hoy? Dame un resumen del día.');
  ctx.reply(respuesta);
});

bot.command('recordar', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1).join(' ');
  if (!args) {
    ctx.reply('⚠️ Escribe tu nota después de /recordar\nEjemplo: /recordar Llamar al banco');
    return;
  }
  const data = loadData();
  data.pendientes.push(args);
  saveData(data);
  const respuesta = await llamarClaude(ctx.from.id, `Acabo de agregar este pendiente: "${args}". Confírmame que lo anotaste.`);
  ctx.reply(respuesta);
});

bot.command('pendientes', async (ctx) => {
  const data = loadData();
  if (data.pendientes.length === 0) {
    ctx.reply('✅ No tienes pendientes por ahora.');
    return;
  }
  const lista = data.pendientes.map((p, i) => `${i + 1}. ${p}`).join('\n');
  ctx.replyWithMarkdown(`📋 *Tus Pendientes*\n\n${lista}\n\nUsa /borrar [número] para eliminar uno.`);
});

bot.command('borrar', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1).join(' ');
  const num = parseInt(args);
  const data = loadData();
  if (!num || num < 1 || num > data.pendientes.length) {
    ctx.reply(`⚠️ Número inválido. Tienes ${data.pendientes.length} pendiente(s).`);
    return;
  }
  const borrado = data.pendientes.splice(num - 1, 1)[0];
  saveData(data);
  ctx.reply(`✅ Borrado: "${borrado}"`);
});

bot.command('fechas', async (ctx) => {
  const respuesta = await llamarClaude(ctx.from.id, 'Recuérdame mis fechas importantes.');
  ctx.reply(respuesta);
});

bot.command('moto', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1).join(' ').toLowerCase();
  if (!args.includes('harley') && !args.includes('bmw')) {
    ctx.reply('⚠️ Especifica: /moto harley o /moto bmw');
    return;
  }
  const moto = args.includes('harley') ? 'Harley-Davidson' : 'BMW';
  const respuesta = await llamarClaude(ctx.from.id, `Dame el checklist de revisión para mi ${moto} antes de salir.`);
  ctx.reply(respuesta);
});

bot.command('limpiar', (ctx) => {
  conversaciones.delete(ctx.from.id);
  ctx.reply('🧹 Conversación reiniciada. ¡Hola de nuevo!');
});

// ============================================
// MENSAJES DE TEXTO LIBRES → CLAUDE
// ============================================

bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return;

  try {
    await ctx.sendChatAction('typing');
    const respuesta = await llamarClaude(ctx.from.id, ctx.message.text);
    ctx.reply(respuesta);
  } catch (err) {
    console.error('❌ Error al llamar a Claude:', err.message);
    ctx.reply('Hubo un problema al procesar tu mensaje. Intenta de nuevo.');
  }
});

// ============================================
// INICIAR EL BOT
// ============================================

console.log('🚀 Iniciando APOLO en Telegram...');
bot.launch();

bot.catch((err) => {
  console.error('❌ Error del bot:', err);
});

process.once('SIGINT', () => { bot.stop('SIGINT'); console.log('🛑 APOLO detenido'); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); console.log('🛑 APOLO detenido'); });
