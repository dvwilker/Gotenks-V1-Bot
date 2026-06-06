export default {
  command: ['ppt'],
  category: 'economy',
  description: 'Jugar piedra, papel o tijera con el bot.',
  run: async (client, m, args, usedPrefix, command) => {
    const chatId = m.chat;
    const chatData = global.db.data.chats[chatId];
    if (chatData.adminonly || !chatData.economy) {
      return m.reply(`🐉🌀 Los comandos de *Economía* están desactivados en este grupo.\n\n⚡ Un *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = global.db.data.settings[botId];
    const monedas = botSettings.currency;
    const botname = botSettings.namebot || 'Gotenks';
    
    let user = global.db.data.chats[chatId].users[m.sender];
    if (!user) {
      return m.reply(`🐉🌀 No estás registrado. Usa *${usedPrefix}work* para comenzar.`);
    }
    if (!user.lastppt) user.lastppt = 0;
    if (!user.coins) user.coins = 0;
    if (!user.bank) user.bank = 0;
    
    const remainingTime = user.lastppt - Date.now();
    if (remainingTime > 0) {
      return m.reply(`🐉🌀 Debes esperar *${msToTime(remainingTime)}* antes de jugar nuevamente.`);
    }
    
    const options = ['piedra', 'papel', 'tijera'];
    const userChoice = args[0]?.trim().toLowerCase();
    
    if (!options.includes(userChoice)) {
      return m.reply(`🐉🌀 Usa: *${usedPrefix + command} piedra*, *papel* o *tijera*`);
    }
    
    const botChoice = options[Math.floor(Math.random() * options.length)];
    const result = determineWinner(userChoice, botChoice);
    const reward = Math.floor(Math.random() * (5500 - 3000 + 1)) + 3000;
    const loss = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
    const tieReward = Math.floor(Math.random() * (1500 - 800 + 1)) + 800;
    
    if (result === 'win') {
      user.coins += reward;
      await m.reply(`🐉 *GANASTE* 🌀\n\n⚡ Tu elección: *${userChoice}*\n🐉 ${botname} eligió: *${botChoice}*\n💰 Ganaste: *${reward.toLocaleString()} ${monedas}*`);
    } else if (result === 'lose') {
      const total = user.coins + user.bank;
      const actualLoss = Math.min(loss, total);
      if (user.coins >= actualLoss) {
        user.coins -= actualLoss;
      } else {
        const remaining = actualLoss - user.coins;
        user.coins = 0;
        user.bank = Math.max(0, user.bank - remaining);
      }
      await m.reply(`🐉 *PERDISTE* 🌀\n\n⚡ Tu elección: *${userChoice}*\n🐉 ${botname} eligió: *${botChoice}*\n💔 Perdiste: *${actualLoss.toLocaleString()} ${monedas}*`);
    } else {
      user.coins += tieReward;
      await m.reply(`🐉 *EMPATE* 🌀\n\n⚡ Tu elección: *${userChoice}*\n🐉 ${botname} eligió: *${botChoice}*\n💰 Ganaste: *${tieReward.toLocaleString()} ${monedas}*`);
    }
    
    user.lastppt = Date.now() + 1 * 60 * 1000;
  }
};

function determineWinner(user, bot) {
  if (user === bot) return 'tie';
  if ((user === 'piedra' && bot === 'tijera') || (user === 'papel' && bot === 'piedra') || (user === 'tijera' && bot === 'papel')) {
    return 'win';
  }
  return 'lose';
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}, ${seconds} segundo${seconds !== 1 ? 's' : ''}`;
}