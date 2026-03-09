require('dotenv').config();
const { Telegraf } = require('telegraf');
const http = require('http');

// Obtener token desde variables de entorno
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

if (!TELEGRAM_TOKEN) {
  console.log('⚠️ Token no encontrado. Configúralo en las variables de entorno.');
  process.exit(1);
}

const bot = new Telegraf(TELEGRAM_TOKEN);

// Configuración del puerto para Render
const PORT = process.env.PORT || 3000;

// Crear servidor simple para mantener el puerto abierto
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('APOLO está activo\n');
});

// ============================================
// REGLAS DE APOLO - Secretario Personal de Enzo
// ============================================

const APOLO_CONFIG = {
  ownerName: "Enzo",
  birthday: "19 de diciembre",
  anniversary: "17 de noviembre",
  Harley: true,
  BMW: true
};

// ============================================
// COMANDOS DEL BOT
// ============================================

bot.start((ctx) => {
  ctx.reply(`👋 Hola, soy APOLO
Secretario personal de ${APOLO_CONFIG.ownerName}.

¿En qué puedo ayudarte?

📋 Comandos:
/start - Saludo
/agenda - Ver agenda del día
/recordar - Agregar recordatorio
/pendientes - Ver pendientes
/fechas - Fechas importantes
/moto - Revisión de moto
/ayuda - Ver todos los comandos`);
});

bot.help((ctx) => {
  ctx.reply(`📚 *Comandos de APOLO*

/start - Saludo
/agenda - Ver agenda del día
/recordar [nota] - Agregar recordatorio
/pendientes - Ver pendientes
/fechas - Fechas importantes
/moto harley - Revisión Harley
/moto bmw - Revisión BMW
/ayuda - Ver comandos
/configurar [nombre] - Configurar tu nombre`, { parse_mode: 'Markdown' });
});

bot.command('agenda', (ctx) => {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fecha = now.toLocaleDateString('es-ES', options);
  ctx.replyWithMarkdown(`📅 *Agenda de Hoy*\n\n${fecha}\n\n⏰ Buenos días, ${APOLO_CONFIG.ownerName}\n¿Tienes alguna reunión o compromiso hoy?\n\n💡 Usa /recordar [tu nota] para agregar pendientes`);
});

bot.command('recordar', (ctx) => {
  const args = ctx.message.text.split(' ');
  args.shift();
  const reminder = args.join(' ');
  if (!reminder) {
    ctx.reply('⚠️ Escribe tu nota después de /recordar\nEjemplo: /recordar Comprar leche');
    return;
  }
  ctx.replyWithMarkdown(`✅ *Recordatorio Agregado*\n\n"${reminder}"\n\nAnotado, ${APOLO_CONFIG.ownerName} ✍️`);
});

bot.command('pendientes', (ctx) => {
  ctx.replyWithMarkdown(`📋 *Tus Pendientes*\n\nAún no hay pendientes guardados.\nUsa /recordar [mensaje] para agregar uno.`);
});

bot.command('fechas', (ctx) => {
  ctx.replyWithMarkdown(`🎂 *Fechas Importantes*\n\n❤️ *17 de Noviembre* - Aniversario con Sari 🎉\n🎈 *19 de Diciembre* - Cumpleaños de ${APOLO_CONFIG.ownerName} 🎂\n\nAPOLO nunca olvida estas fechas ✨`);
});

bot.command('moto', (ctx) => {
  const args = ctx.message.text.split(' ');
  args.shift();
  const moto = args.join(' ').toLowerCase();
  let motoNombre = '';
  if (moto.includes('harley')) {
    motoNombre = 'Harley-Davidson';
  } else if (moto.includes('bmw')) {
    motoNombre = 'BMW';
  } else {
    ctx.reply('⚠️ Especifica: /moto harley o /moto bmw');
    return;
  }
  ctx.replyWithMarkdown(`🏍️ *Recordatorio de Moto* - ${motoNombre}\n\nAntes de salir:\n\n✅ Revisa el aceite - Nivel y estado\n🛞 Revisa las llantas - Presión y desgaste\n🌤 Revisa el clima - Condiciones de la carretera\n\n¡Que tengas un buen viaje, ${APOLO_CONFIG.ownerName}! 🛣️`);
});

bot.command('configurar', (ctx) => {
  const args = ctx.message.text.split(' ');
  args.shift();
  const nombre = args.join(' ');
  if (!nombre) {
    ctx.reply('⚠️ Escribe tu nombre después de /configurar\nEjemplo: /configurar Carlos');
    return;
  }
  APOLO_CONFIG.ownerName = nombre;
  ctx.reply(`✅ *Configuración Actualizada*\n\nAhora sé que tú eres *${nombre}*`, { parse_mode: 'Markdown' });
});

// Respuestas automáticas
bot.on('text', (ctx) => {
  const text = ctx.message.text.toLowerCase();
  if (text.includes('clinic') || text.includes('fucsi') || text.includes('negocio')) {
    ctx.replyWithMarkdown(`📝 *Anotado*\n\nHe tomado nota de ese tema.\n¿ quieres que te ayude con algo más relacionado a tu agenda personal?`);
    return;
  }
  if (text.includes('apple') || text.includes('suscrib') || text.includes('netflix') || text.includes('spotify')) {
    ctx.replyWithMarkdown(`📝 *Nota de Suscripción*\n\nHe anotado esta suscripción.\nTe recordaré verificar el pago el próximo mes para evitar bloqueos.\n\nAPOLO: Previniendo problemas ✅`);
    return;
  }
});

// ============================================
// INICIAR EL BOT
// ============================================

// Iniciar el servidor web (necesario para Render)
server.listen(PORT, () => {
  console.log(`🌐 Servidor web activo en puerto ${PORT}`);
});

// Iniciar el bot
console.log('🚀 Iniciando APOLO en Telegram...');
bot.launch();

bot.catch((err, ctx) => {
  console.log('❌ Error:', err);
});

process.once('SIGINT', () => {
  bot.stop('SIGINT');
  server.close();
  console.log('🛑 APOLO detenido');
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  server.close();
  console.log('🛑 APOLO detenido');
});
