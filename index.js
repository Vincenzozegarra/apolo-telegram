require('dotenv').config();
const { Telegraf } = require('telegraf');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
if (!TELEGRAM_TOKEN) {
  console.error('❌ Falta TELEGRAM_TOKEN en las variables de entorno');
  process.exit(1);
}

const bot = new Telegraf(TELEGRAM_TOKEN);

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
  ctx.reply(`👋 Hola, soy APOLO\nSecretario personal de ${APOLO_CONFIG.ownerName}.\n\n¿En qué puedo ayudarte?\n\n📋 Comandos:\n/start - Saludo\n/agenda - Ver agenda del día\n/recordar - Agregar recordatorio\n/pendientes - Ver pendientes\n/fechas - Fechas importantes\n/moto - Revisión de moto\n/ayuda - Ver todos los comandos`);
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

// ============================================
// RESPUESTAS AUTOMÁTICAS - Mensajes Fluidos
// ============================================

bot.on('text', (ctx) => {
  const text = ctx.message.text.toLowerCase();
  const mensaje = ctx.message.text;

  if (mensaje.startsWith('/')) {
    return;
  }

  if (text.includes('clinic') || text.includes('fucsi') || text.includes('negocio')) {
    ctx.replyWithMarkdown(`📝 *Anotado*\n\nHe tomado nota de ese tema.\n¿ quieres que te ayude con algo más relacionado a tu agenda personal?`);
    return;
  }

  if (text.includes('apple') || text.includes('suscrib') || text.includes('netflix') || text.includes('spotify') || text.includes('comprar') || text.includes('compra')) {
    ctx.replyWithMarkdown(`📝 *Nota de Suscripción/Compra*\n\nHe anotado esto.\nTe recordaré verificar el pago el próximo mes para evitar bloqueos.\n\nAPOLO: Previniendo problemas ✅`);
    return;
  }

  if (text.includes('harley') || text.includes('bmw') || text.includes('moto')) {
    ctx.replyWithMarkdown(`🏍️ *Recordatorio de Moto*\n\n¿Quieres que te recuerde revisar tu moto antes de salir?\nUsa /moto harley o /moto bmw para ver los tips.`);
    return;
  }

  if (text.includes('cumple') || text.includes('aniversario') || text.includes('sari') || text.includes('17') || text.includes('19')) {
    ctx.replyWithMarkdown(`🎂 *Fechas Importantes*\n\n❤️ *17 de Noviembre* - Aniversario con Sari 🎉\n🎈 *19 de Diciembre* - Cumpleaños de ${APOLO_CONFIG.ownerName} 🎂\n\nAPOLO nunca olvida estas fechas ✨`);
    return;
  }

  const respuestas = [
    `👂 Te escucho, ${APOLO_CONFIG.ownerName}. ¿Necesitas algo relacionado a tu agenda?`,
    `📝 Anotado. ¿Hay algo más en lo que pueda ayudarte?`,
    `✅ ¿Te refieres a algo de tu agenda personal?`,
    `🤔 Puedo ayudarte con recordatorios, tu agenda o tus pendientes. ¿Qué necesitas?`,
    `📋 Estoy aquí para ayudarte. Usa /ayuda para ver lo que puedo hacer.`
  ];

  const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];
  ctx.reply(respuestaAleatoria);
});

// ============================================
// INICIAR EL BOT
// ============================================

console.log('🚀 Iniciando APOLO en Telegram...');
bot.launch();

bot.catch((err, ctx) => {
  console.log('❌ Error:', err);
});

process.once('SIGINT', () => {
  bot.stop('SIGINT');
  console.log('🛑 APOLO detenido');
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  console.log('🛑 APOLO detenido');
});
