export default {
  command: ['pescar', 'fish'],
  category: 'economy',
  description: 'Ganar coins pescando.',
  run: async (client, m, args, usedPrefix, command) => {
    const chat = global.db.data.chats[m.chat];
    if (chat.adminonly || !chat.economy) {
      return m.reply(`🐉🌀 Los comandos de *Economía* están desactivados en este grupo.\n\n⚡ Un *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = global.db.data.settings[botId];
    const currency = settings.currency;
    
    if (!global.db.data.chats[m.chat].users[m.sender]) {
      global.db.data.chats[m.chat].users[m.sender] = {};
    }
    if (!global.db.data.chats[m.chat].users[m.sender].tools) {
      global.db.data.chats[m.chat].users[m.sender].tools = {};
    }
    if (!global.db.data.chats[m.chat].users[m.sender].lastfish) {
      global.db.data.chats[m.chat].users[m.sender].lastfish = 0;
    }
    
    let user = global.db.data.chats[m.chat].users[m.sender];
    
    if (user.tools && typeof user.tools === 'string') {
      try { user.tools = JSON.parse(user.tools); } catch { user.tools = {}; }
    }
    if (!user.stamina) user.stamina = 100;
    if (!user.coins) user.coins = 0;
    
    const staminaConsumed = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    if (user.stamina < staminaConsumed) {
      return m.reply(`🐉🌀 No tienes suficiente energía para pescar.\n⚡ Usa *${usedPrefix}heal* para curarte.`);
    }
    
    if (!user.tools?.caña) {
      return m.reply(`🐉🌀 Necesitas una Caña de pescar.\n⚡ Compra una con: *${usedPrefix}buy caña*`);
    }
    
    if (user.tools.caña.durability <= 10) {
      delete user.tools.caña;
      return m.reply(`🐉🌀 Tu Caña se ha roto.\n⚡ Compra una nueva con: *${usedPrefix}buy caña*`);
    }
    
    const remainingTime = user.lastfish - Date.now();
    if (remainingTime > 0) {
      return m.reply(`🐉🌀 Debes esperar *${msToTime(remainingTime)}* antes de volver a pescar.`);
    }
    
    user.stamina -= staminaConsumed;
    
    const rand = Math.random();
    const durabilityConsumed = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
    let cantidad;
    let message;
    
    if (rand < 0.4) {
      user.tools.caña.durability -= durabilityConsumed;
      if (user.tools.caña.durability <= 10) {
        delete user.tools.caña;
      }
      cantidad = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
      user.coins += cantidad;
      
      const successMessages = [
        `🐉 ¡Pescaste un Salmón! Ganaste *${cantidad.toLocaleString()} ${currency}* ⚡`,
        `🌀 ¡Pescaste una Trucha! Ganaste *${cantidad.toLocaleString()} ${currency}* 🐉`,
        `⚡ ¡Capturaste un Tiburón! Ganaste *${cantidad.toLocaleString()} ${currency}* 🌀`,
        `🐉 ¡Pescaste una Ballena! Ganaste *${cantidad.toLocaleString()} ${currency}* ⚡`
      ];
      message = pickRandom(successMessages);
    } else if (rand < 0.7) {
      user.tools.caña.durability -= durabilityConsumed;
      if (user.tools.caña.durability <= 10) {
        delete user.tools.caña;
      }
      cantidad = Math.floor(Math.random() * (6500 - 5000 + 1)) + 5000;
      const total = (user.coins || 0) + (user.bank || 0);
      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins -= cantidad;
        } else {
          const restante = cantidad - user.coins;
          user.coins = 0;
          user.bank = (user.bank || 0) - restante;
        }
      } else {
        cantidad = total;
        user.coins = 0;
        user.bank = 0;
      }
      
      const failMessages = [
        `🐉 El anzuelo se enredó, perdiste *${cantidad.toLocaleString()} ${currency}* ⚡`,
        `🌀 Una corriente arrastró tu caña, perdiste *${cantidad.toLocaleString()} ${currency}* 🐉`,
        `⚡ Un pez grande rompió tu línea, perdiste *${cantidad.toLocaleString()} ${currency}* 🌀`
      ];
      message = pickRandom(failMessages);
    } else {
      const neutralMessages = [
        `🐉 Pasaste la tarde pescando sin suerte.`,
        `🌀 Los peces no mordieron el anzuelo.`,
        `⚡ El agua estuvo tranquila, solo viste peces nadar.`
      ];
      message = pickRandom(neutralMessages);
    }
    
    user.lastfish = Date.now() + 8 * 60 * 1000;
    await m.reply(`🐉 ${message} 🌀`);
  }
};

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const min = minutes < 10 ? '0' + minutes : minutes;
  const sec = seconds < 10 ? '0' + seconds : seconds;
  return min === '00' ? `${sec} segundo${sec > 1 ? 's' : ''}` : `${min} minuto${min > 1 ? 's' : ''}, ${sec} segundo${sec > 1 ? 's' : ''}`;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}