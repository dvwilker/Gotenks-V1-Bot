import db from '#db';

export default {
  command: ['balance', 'bal', 'coins', 'bank'],
  category: 'economy',
  description: 'Ver cuantos coins tienes.',
  run: async (client, m, args, usedPrefix, command) => {
    const chatId = m.chat;
    const chatData = db.getChat(chatId);
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net";
    const botSettings = db.getSettings(botId);
    const monedas = botSettings.currency;
    
    if (chatData.adminonly || !chatData.economy) {
      return m.reply(`🐉🌀 Los comandos de *Economía* están desactivados en este grupo.\n\n⚡ Un *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    
    const who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    const user = db.getChatUser(chatId, who);
    
    if (!user) {
      return m.reply(`🐉🌀 El usuario mencionado no está registrado en el bot.\n⚡ Usa *${usedPrefix}work* para comenzar.`);
    }
    
    const users = db.getUser(who);
    const total = (user.coins || 0) + (user.bank || 0);
    
    const bal = `
◤━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◥
│  🐉 𝙶𝙾𝚃𝙴𝙽𝙺𝚂 𝚅𝟷 𝙱𝙰𝙻𝙰𝙽𝙲𝙴 🌀   │
├──────────────────────────────┤
│ ✦ 𝕌𝕤𝕦𝕒𝕣𝕚𝕠: *${users?.name || who.split('@')[0]}*
├──────────────────────────────┤
│ 🌀 ℂ𝔸ℝ𝕋𝔼ℝ𝔸
│   🐉 ${user.coins?.toLocaleString() || 0} ${monedas}
│
│ ⚡ 𝔹𝔸ℕℂ𝕆
│   🐉 ${user.bank?.toLocaleString() || 0} ${monedas}
│
│ 💰 𝕋𝕆𝕋𝔸𝕃
│   🐉 ${total.toLocaleString()} ${monedas}
├──────────────────────────────┤
│ ⚡ Protege tu dinero
│ 🌀 ${usedPrefix}deposit <cantidad|all>
├──────────────────────────────┤
│ 🐉 𝐺𝑜𝑡𝑒𝑛𝑘𝑠 𝑉1 𝐵𝑜𝑡
◣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◢
*𝐹𝑢𝑠𝑖𝑜𝑛 𝐻𝑎!* 🌀🐉`;

    await m.reply(bal);
  }
};