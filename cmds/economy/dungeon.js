export default {
  command: ['dungeon', 'mazmorra'],
  category: 'economy',
  description: 'Explorar mazmorras para ganar coins.',
  run: async (client, m, args, usedPrefix, command) => {
    const chat = global.db.data.chats[m.chat];
    if (chat.adminonly || !chat.economy) {
      return m.reply(`🐉🌀 Los comandos de *Economía* están desactivados en este grupo.\n\n⚡ Un *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = global.db.data.settings[botId];
    const currency = settings.currency;
    
    const user = global.db.data.chats[m.chat].users[m.sender];
    
    if (!user.weapons) user.weapons = {};
    if (typeof user.weapons === 'string') {
      try { user.weapons = JSON.parse(user.weapons); } catch { user.weapons = {}; }
    }
    if (!user.lastdungeon) user.lastdungeon = 0;
    
    const staminaConsumed = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    if (user.stamina < staminaConsumed) {
      return m.reply(`🐉🌀 No tienes suficiente stamina para asaltar la mazmorra.\n⚡ Usa *${usedPrefix}heal* para curarte.`);
    }
    
    let usingMagic = false;
    let usingWeapon = false;
    
    if (user.weapons?.hacha) {
      if (user.weapons.hacha.durability <= 10) {
        delete user.weapons.hacha;
        return m.reply(`🐉🌀 Tu Hacha se ha roto y ha sido eliminada.\n⚡ Compra una nueva con: *${usedPrefix}buy hacha*`);
      }
      usingWeapon = true;
    } else {
      const magicConsumed = Math.floor(Math.random() * (12 - 1 + 1)) + 1;
      if (user.magic < magicConsumed) {
        return m.reply(`🐉🌀 Tu magia está agotada y no tienes arma.\n⚡ Usa *${usedPrefix}heal* o compra un arma con: *${usedPrefix}buy hacha*`);
      }
      usingMagic = true;
      user.magic -= magicConsumed;
    }
    
    if (user.health < 5) {
      return m.reply(`🐉🌀 No tienes suficiente salud para la mazmorra.\n⚡ Usa *${usedPrefix}heal* para curarte.`);
    }
    
    if (Date.now() < user.lastdungeon) {
      const restante = user.lastdungeon - Date.now();
      return m.reply(`🐉🌀 Debes esperar *${msToTime(restante)}* antes de volver a la mazmorra.`);
    }
    
    user.stamina -= staminaConsumed;
    
    const rand = Math.random();
    let cantidad = 0;
    let salud = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
    let durabilityConsumed = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
    let message;
    
    if (rand < 0.4) {
      if (usingWeapon) {
        user.weapons.hacha.durability -= durabilityConsumed;
        if (user.weapons.hacha.durability <= 10) {
          delete user.weapons.hacha;
        }
      }
      cantidad = Math.floor(Math.random() * (15000 - 12000 + 1)) + 12000;
      user.coins = (user.coins || 0) + cantidad;
      user.health = (user.health || 100) - salud;
      if (user.health < 0) user.health = 0;
      
      const successMessages = [
        `🐉 Derrotaste al guardián de las ruinas, ganaste *${cantidad.toLocaleString()} ${currency}* ⚡`,
        `🌀 Descifraste los símbolos rúnicos, ganaste *${cantidad.toLocaleString()} ${currency}* 🐉`,
        `⚡ El espíritu de la reina te bendice, ganaste *${cantidad.toLocaleString()} ${currency}* 🌀`
      ];
      message = pickRandom(successMessages);
    } else if (rand < 0.7) {
      if (usingWeapon) {
        user.weapons.hacha.durability -= durabilityConsumed;
        if (user.weapons.hacha.durability <= 10) {
          delete user.weapons.hacha;
        }
      }
      cantidad = Math.floor(Math.random() * (9000 - 7500 + 1)) + 7500;
      const total = (user.coins || 0) + (user.bank || 0);
      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins -= cantidad;
        } else {
          const restante = cantidad - (user.coins || 0);
          user.coins = 0;
          user.bank = (user.bank || 0) - restante;
        }
      } else {
        cantidad = total;
        user.coins = 0;
        user.bank = 0;
      }
      user.health = (user.health || 100) - salud;
      if (user.health < 0) user.health = 0;
      
      const failMessages = [
        `🐉 Un espectro te drena energía, perdiste *${cantidad.toLocaleString()} ${currency}* ⚡`,
        `🌀 Un basilisco te sorprende, perdiste *${cantidad.toLocaleString()} ${currency}* 🐉`,
        `⚡ Una criatura te roba el botín, perdiste *${cantidad.toLocaleString()} ${currency}* 🌀`
      ];
      message = pickRandom(failMessages);
    } else {
      const neutralMessages = [
        `🐉 Activaste una trampa pero logras evitar el daño.`,
        `🌀 La sala cambia de forma y pierdes tiempo explorando.`,
        `⚡ Encuentras un mural antiguo con secretos de la mazmorra.`
      ];
      message = pickRandom(neutralMessages);
    }
    
    user.lastdungeon = Date.now() + (17 * 60 * 1000);
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