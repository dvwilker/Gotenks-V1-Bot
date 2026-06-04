export default {
  command: ['monthly', 'mensual'],
  category: 'economy',
  description: 'Reclamar tu recompensa mensual.',
  run: async (client, m, args, usedPrefix, command) => {
    const chat = global.db.data.chats[m.chat];
    if (chat.adminonly || !chat.economy) {
      return m.reply(`🐉🌀 Los comandos de *Economía* están desactivados en este grupo.\n\n⚡ Un *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = global.db.data.settings[botId];
    const currency = bot.currency;
    
    const users = global.db.data.users[m.sender];
    const user = global.db.data.chats[m.chat].users[m.sender];
    
    if (!users.monthlyStreak) users.monthlyStreak = 0;
    if (!users.lastMonthlyGlobal) users.lastMonthlyGlobal = 0;
    if (!user.lastmonthly) user.lastmonthly = 0;
    
    const gap = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    if (now < user.lastmonthly) {
      const wait = formatTime(Math.floor((user.lastmonthly - now) / 1000));
      return m.reply(`🐉🌀 Ya has reclamado tu recompensa mensual.\n⚡ Puedes reclamarlo de nuevo en *${wait}*`);
    }
    
    let currentStreak = users.monthlyStreak;
    const lost = users.monthlyStreak >= 1 && now - users.lastMonthlyGlobal > gap * 1.5;
    if (lost) {
      currentStreak = 0;
      users.monthlyStreak = 0;
    }
    
    const canClaimGlobal = now - users.lastMonthlyGlobal >= gap;
    if (canClaimGlobal) {
      currentStreak = Math.min(currentStreak + 1, 8);
      users.monthlyStreak = currentStreak;
      users.lastMonthlyGlobal = now;
    }
    
    const coins = Math.min(60000 + (currentStreak - 1) * 5000, 95000);
    user.coins = (user.coins || 0) + coins;
    user.lastmonthly = now + gap;
    
    let next = Math.min(60000 + currentStreak * 5000, 95000).toLocaleString();
    let caption = `⚡ Mes *${currentStreak + 1}* » *+${next} ${currency}*`;
    if (lost) caption += `\n🌀 ¡Has perdido tu racha de meses!`;
    
    m.reply(`🐉 *GOTENKS V1 MONTHLY* 🌀\n\n⚡ Has reclamado tu recompensa mensual de *${coins.toLocaleString()} ${currency}* (Mes *${currentStreak}*)\n${caption}`);
  }
};

function formatTime(t) {
  const d = Math.floor(t / 86400);
  const h = Math.floor((t % 86400) / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (d) return `${d} día${d !== 1 ? 's' : ''} ${h} hora${h !== 1 ? 's' : ''}`;
  if (h) return `${h} hora${h !== 1 ? 's' : ''} ${m} minuto${m !== 1 ? 's' : ''}`;
  if (m) return `${m} minuto${m !== 1 ? 's' : ''} ${s} segundo${s !== 1 ? 's' : ''}`;
  return `${s} segundo${s !== 1 ? 's' : ''}`;
}