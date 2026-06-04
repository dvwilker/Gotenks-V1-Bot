export default {
  command: ['weekly', 'semanal'],
  category: 'economy',
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
    
    if (!users.weeklyStreak) users.weeklyStreak = 0;
    if (!users.lastWeeklyGlobal) users.lastWeeklyGlobal = 0;
    if (!user.lastweekly) user.lastweekly = 0;
    
    const gap = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    if (now < user.lastweekly) {
      const wait = formatTime(Math.floor((user.lastweekly - now) / 1000));
      return m.reply(`🐉🌀 Ya has reclamado tu recompensa semanal.\n⚡ Puedes reclamarlo de nuevo en *${wait}*`);
    }
    
    let currentStreak = users.weeklyStreak;
    const lost = users.weeklyStreak >= 1 && now - users.lastWeeklyGlobal > gap * 1.5;
    if (lost) {
      currentStreak = 0;
      users.weeklyStreak = 0;
    }
    
    const canClaimWeeklyGlobal = now - users.lastWeeklyGlobal >= gap;
    if (canClaimWeeklyGlobal) {
      currentStreak = Math.min(currentStreak + 1, 30);
      users.weeklyStreak = currentStreak;
      users.lastWeeklyGlobal = now;
    }
    
    const coins = Math.min(40000 + (currentStreak - 1) * 5000, 185000);
    user.coins = (user.coins || 0) + coins;
    user.lastweekly = now + gap;
    
    let nextReward = Math.min(40000 + currentStreak * 5000, 185000).toLocaleString();
    let caption = `⚡ Semana *${currentStreak + 1}* » *+${nextReward} ${currency}*`;
    if (lost) caption += `\n🌀 ¡Has perdido tu racha de semanas!`;
    
    m.reply(`🐉 *GOTENKS V1 WEEKLY* 🌀\n\n⚡ Has reclamado tu recompensa semanal de *${coins.toLocaleString()} ${currency}* (Semana *${currentStreak}*)\n${caption}`);
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