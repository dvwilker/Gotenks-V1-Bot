export default {
  command: ['dep', 'deposit', 'd', 'depositar'],
  category: 'economy',
  description: 'Depositar tus coins en el banco.',
  run: async (client, m, args, usedPrefix, command) => {
    const chatData = global.db.data.chats[m.chat];
    if (chatData.adminonly || !chatData.economy) {
      return m.reply(`🐉🌀 Los comandos de *Economía* están desactivados en este grupo.\n\n⚡ Un *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = global.db.data.settings[botId];
    const monedas = settings.currency;
    const user = global.db.data.chats[m.chat].users[m.sender];
    
    if (!user) {
      return m.reply(`🐉🌀 No estás registrado. Usa *${usedPrefix}work* para comenzar.`);
    }
    
    if (!args[0]) {
      return m.reply(`🐉🌀 Ingresa la cantidad de *${monedas}* que quieras depositar.\n⚡ Ejemplo: *${usedPrefix}dep 1000* o *${usedPrefix}dep all*`);
    }
    
    if (args[0].toLowerCase() === 'all') {
      if ((user.coins || 0) <= 0) return m.reply(`🐉🌀 No tienes *${monedas}* para depositar.`);
      const count = user.coins;
      user.coins = 0;
      user.bank = (user.bank || 0) + count;
      await m.reply(`🐉 Has depositado *${count.toLocaleString()} ${monedas}* en tu Banco ⚡`);
      return;
    }
    
    const count = parseInt(args[0]);
    if (isNaN(count) || count < 1) {
      return m.reply(`🐉🌀 Ingresa una cantidad válida.\n⚡ Ejemplo: *${usedPrefix}dep 1000*`);
    }
    
    if ((user.coins || 0) <= 0 || (user.coins || 0) < count) {
      return m.reply(`🐉🌀 No tienes suficientes *${monedas}* para depositar.\n⚡ Tienes: *${(user.coins || 0).toLocaleString()} ${monedas}*`);
    }
    
    user.coins = (user.coins || 0) - count;
    user.bank = (user.bank || 0) + count;
    
    await m.reply(`🐉 Has depositado *${count.toLocaleString()} ${monedas}* en tu Banco ⚡`);
  }
};