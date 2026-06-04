const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  return parts.length ? parts.join(', ') : '⚡ Listo';
};

export default {
  command: ['infoeconomy', 'cooldowns', 'economyinfo', 'einfo'],
  category: 'economy',
  description: 'Ver tu información de economía y cooldowns.',
  run: async (client, m, args, usedPrefix, command) => {
    const chatId = m.chat;
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net";
    const chatData = global.db.data.chats[chatId];
    
    if (chatData.adminonly || !chatData.economy) {
      return m.reply(`🐉🌀 Los comandos de *Economía* están desactivados en este grupo.\n\n⚡ Un *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    
    const user = global.db.data.chats[chatId]?.users?.[m.sender];
    const users = global.db.data.users[m.sender];
    const settings = global.db.data.settings[botId];
    const now = Date.now();
    
    if (!user) return m.reply(`🐉🌀 No tienes datos de economía aún.\n⚡ Usa *${usedPrefix}work* para comenzar.`);
    
    user.lastcrime ??= 0;
    user.lastmine ??= 0;
    user.lastinvoke ??= 0;
    user.lastwork ??= 0;
    user.lastslut ??= 0;
    user.laststeal ??= 0;
    user.lasthunt ??= 0;
    user.lastfish ??= 0;
    user.lastcoffer ??= 0;
    user.lastdungeon ??= 0;
    user.lastadventure ??= 0;
    user.lastdaily ??= 0;
    user.lastweekly ??= 0;
    user.lastmonthly ??= 0;
    
    const cooldowns = {
      work: Math.max(0, (user.lastwork || 0) - now),
      slut: Math.max(0, (user.lastslut || 0) - now),
      crime: Math.max(0, (user.lastcrime || 0) - now),
      mine: Math.max(0, (user.lastmine || 0) - now),
      ritual: Math.max(0, (user.lastinvoke || 0) - now),
      fish: Math.max(0, (user.lastfish || 0) - now),
      hunt: Math.max(0, (user.lasthunt || 0) - now),
      dungeon: Math.max(0, (user.lastdungeon || 0) - now),
      adventure: Math.max(0, (user.lastadventure || 0) - now),
      steal: Math.max(0, (user.laststeal || 0) - now),
      daily: Math.max(0, (user.lastdaily || 0) - now),
      coffer: Math.max(0, (user.lastcoffer || 0) - now),
      weekly: Math.max(0, (user.lastweekly || 0) - now),
      monthly: Math.max(0, (user.lastmonthly || 0) - now)
    };

    const coins = user.coins || 0;
    const name = users?.name || m.sender.split('@')[0];
    
    const mensaje = `
◤━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◥
│  🐉 𝙶𝙾𝚃𝙴𝙽𝙺𝚂 𝚅𝟷 𝙴𝙲𝙾𝙽𝙾𝙼𝚈 🌀   │
├──────────────────────────────┤
│ ✦ 𝕌𝕤𝕦𝕒𝕣𝕚𝕠: *${name}*
├──────────────────────────────┤
│ ⚡ ℂ𝕆𝕆𝕃𝔻𝕆𝕎ℕ𝕊
│   🌀 𝕎𝕠𝕣𝕜 » ${formatTime(cooldowns.work)}
│   🌀 𝕊𝕝𝕦𝕥 » ${formatTime(cooldowns.slut)}
│   🌀 ℂ𝕣𝕚𝕞𝕖 » ${formatTime(cooldowns.crime)}
│   🌀 𝕄𝕚𝕟𝕖 » ${formatTime(cooldowns.mine)}
│   🌀 ℝ𝕚𝕥𝕦𝕒𝕝 » ${formatTime(cooldowns.ritual)}
│   🌀 𝔽𝕚𝕤𝕙 » ${formatTime(cooldowns.fish)}
│   🌀 ℍ𝕦𝕟𝕥 » ${formatTime(cooldowns.hunt)}
│   🌀 𝔻𝕦𝕟𝕘𝕖𝕠𝕟 » ${formatTime(cooldowns.dungeon)}
│   🌀 𝔸𝕕𝕧𝕖𝕟𝕥𝕦𝕣𝕖 » ${formatTime(cooldowns.adventure)}
│   🌀 𝕊𝕥𝕖𝕒𝕝 » ${formatTime(cooldowns.steal)}
│   🌀 𝔻𝕒𝕚𝕝𝕪 » ${formatTime(cooldowns.daily)}
│   🌀 ℂ𝕠𝕗𝕗𝕖𝕣 » ${formatTime(cooldowns.coffer)}
│   🌀 𝕎𝕖𝕖𝕜𝕝𝕪 » ${formatTime(cooldowns.weekly)}
│   🌀 𝕄𝕠𝕟𝕥𝕙𝕝𝕪 » ${formatTime(cooldowns.monthly)}
├──────────────────────────────┤
│ 💰 𝕋𝕠𝕥𝕒𝕝 ℂ𝕠𝕚𝕟𝕤
│   🐉 ${coins.toLocaleString()} ${settings.currency}
├──────────────────────────────┤
│ 🐉 𝔾𝕠𝕥𝕖𝕟𝕜𝕤 𝕍𝟙 𝔹𝕠𝕥
│ 📺 %channelName
◣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◢
*𝐹𝑢𝑠𝑖𝑜𝑛 𝐻𝑎!* 🌀🐉`.replace(/%channelName/g, global.db.data.settings[botId]?.nameid || '✦ Gotenks V1 Bot 🐉🌀');

    await m.reply(mensaje);
  }
};