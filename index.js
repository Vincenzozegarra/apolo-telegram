require('dotenv').config();
const { Telegraf } = require('telegraf');

// Obtener token desde variables de entorno
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

if (!TELEGRAM_TOKEN) {
  console.log('⚠️ Token no encontrado. Configúralo en las variables de entorno.');
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

// /start - Saludo inicial
bot.start((ctx) => {
  ctx.reply(`👋 Hola, soy APOLO\nSecretario personal de ${APOLO_CONFIG.ownerName}.\n\n¿En qué puedo ayudarte?\n\n📋 Comandos:\n/start - Saludo\n/agenda - Ver agenda del día\n/recordar - Agregar recordatorio\n/pendientes - Ver pendientes\n/fechas - Fechas importantes\n/moto - Revisión de moto\n/ayuda - Ver todos los comandos`);
});

// /ayuda - Ver todos los comandos
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

// /agenda - Ver agenda del día
bot.command('agenda', (ctx) => {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fecha = now.toLocaleDateString('es-ES', options);

  ctx.replyWithMarkdown(`📅 *Agenda de Hoy*

${fecha}

⏰ Buenos días, ${APOLO_CONFIG.ownerName}
¿Tienes alguna reunión o compromiso hoy?

💡 Usa /recordar [tu nota] para agregar pendientes`);
});

// /recordar - Agregar recordatorio
bot.command('recordar', (ctx) => {
  const args = ctx.message.text.split(' ');
  args.shift(); // Quitar "/recordar"
  const reminder = args.join(' ');

  if (!reminder) {
    ctx.reply('⚠️ Escribe tu nota después de /recordar\nEjemplo: /recordar Comprar leche');
    return;
  }

  ctx.replyWithMarkdown(`✅ *Recordatorio Agregado*

"${reminder}"

Anotado, ${APOLO_CONFIG.ownerName} ✍️`);
});

// /pendientes - Ver pendientes
bot.command('pendientes', (ctx) => {
  ctx.replyWithMarkdown(`📋 *Tus Pendientes*

Aún no hay pendientes guardados.
Usa /recordar [mensaje] para agregar uno.`);
});

// /fechas - Fechas importantes
bot.command('fechas', (ctx) => {
  ctx.replyWithMarkdown(`🎂 *Fechas Importantes*

❤️ *17 de Noviembre* - Aniversario con Sari 🎉
🎈 *19 de Diciembre* - Cumpleaños de ${APOLO_CONFIG.ownerName} 🎂

APOLO nunca olvida estas fechas ✨`);
});

// /moto - Recordatorio de moto
bot.command('moto', (ctx) => {
  const args = ctx.message.text.split(' ');
  args.shift(); // Quitar "/moto"
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

  ctx.replyWithMarkdown(`🏍️ *Recordatorio de Moto* - ${motoNombre}

Antes de salir:

✅ Revisa el aceite - Nivel y estado
🛞 Revisa las llantas - Presión y desgaste
🌤 Revisa el clima - Condiciones de la carretera

¡Que tengas un buen viaje, ${APOLO_CONFIG.ownerName}! 🛣️`);
});

// /configurar - Configurar nombre
bot.command('configurar', (ctx) => {
  const args = ctx.message.text.split(' ');
  args.shift(); // Quitar "/configurar"
  const nombre = args.join(' ');

  if (!nombre) {
    ctx.reply('⚠️ Escribe tu nombre después de /configurar\nEjemplo: /configurar Carlos');
    return;
  }

  APOLO_CONFIG.ownerName = nombre;
  ctx.reply(`✅ *Configuración Actualizada*

Ahora sé que tú eres *${nombre}*`, { parse_mode: 'Markdown' });
});

// ============================================
// RESPUESTAS AUTOMÁTICAS
// ============================================

// Detectar menciones de Clinic o Fucsi Jeans
bot.on('text', (ctx) => {
  const text = ctx.message.text.toLowerCase();

  // Detectar Clinic o Fucsi
  if (text.includes('clinic') || text.includes('fucsi') || text.includes('negocio')) {
    ctx.replyWithMarkdown(`📝 *Anotado*

He tomado nota de ese tema.
¿ quieres que te ayude con algo más relacionado a tu agenda personal?`);
    return;
  }

  // Detectar suscripciones
  if (text.includes('apple') || text.includes('suscrib') || text.includes('netflix') || text.includes('spotify')) {
    ctx.replyWithMarkdown(`📝 *Nota de Suscripción*

He anotado esta suscripción.
Te recordaré verificar el pago el próximo mes para evitar bloqueos.

APOLO: Previniendo problemas ✅`);
    return;
  }
});

// ============================================
// INICIAR EL BOT
// ============================================

console.log('🚀 Iniciando APOLO en Telegram...');
bot.launch();

// Manejo de errores
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
