export default {
  command: ['givecoins', 'pay', 'coinsgive'],
  category: 'economy',
  description: 'Dar coins a un usuario.',
  run: async (client, m, args, usedPrefix, command) => {
    const chatId = m.chat;
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = global.db.data.settings[botId];
    const monedas = botSettings.currency || 'coins';
    const chatData = global.db.data.chats[chatId];
    
    if (chatData.adminonly || !chatData.economy) {
      return m.reply(`🐉🌀 Los comandos de *Economía* están desactivados en este grupo.\n\n⚡ Un *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    
    const who = m.mentionedJid?.[0] || m.quoted?.sender || (args[1] ? (args[1].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : null);
    if (!who) {
      return m.reply(`🐉🌀 Debes mencionar a quien quieras transferir *${monedas}*.\n⚡ Ejemplo: *${usedPrefix + command} 25000 @usuario*`);
    }
    
    const senderData = global.db.data.chats[chatId].users[m.sender];
    const targetData = global.db.data.chats[chatId].users[who];
    
    if (!senderData) {
      return m.reply(`🐉🌀 No estás registrado. Usa *${usedPrefix}work* para comenzar.`);
    }
    
    if (!targetData) {
      return m.reply(`🐉🌀 El usuario mencionado no está registrado en el bot.`);
    }
    
    const cantidadInput = args[0]?.toLowerCase();
    let cantidad = cantidadInput === 'all' ? (senderData.bank || 0) : parseInt(cantidadInput);
    
    if (!cantidadInput || isNaN(cantidad) || cantidad <= 0) {
      return m.reply(`🐉🌀 Ingresa una cantidad válida de *${monedas}* para transferir.`);
    }
    
    if ((senderData.bank || 0) < cantidad) {
      return m.reply(`🐉🌀 No tienes suficientes *${monedas}* en el banco para transferir.\n⚡ Tu saldo actual: *${(senderData.bank || 0).toLocaleString()} ${monedas}*`);
    }
    
    senderData.bank = (senderData.bank || 0) - cantidad;
    targetData.bank = (targetData.bank || 0) + cantidad;
    
    const userData = global.db.data.users[who];
    let name = userData?.name || who.split('@')[0];
    
    await m.reply(`🐉 Transferiste *${cantidad.toLocaleString()} ${monedas}* a *${name}* ⚡\n🌀 Ahora tienes *${(senderData.bank || 0).toLocaleString()} ${monedas}* en tu banco.`);
  }
};