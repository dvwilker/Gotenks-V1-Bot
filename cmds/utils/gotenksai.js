import fetch from 'node-fetch'

export default {
  command: ['gotenks', 'gotenksai', 'ia', 'bot'],
  category: 'ia',
  description: 'Habla con Gotenks V1 Bot 🐉🌀',
  run: async (client, m, args, usedPrefix, command) => {
    const text = args.join(' ').trim()
    
    if (!text) {
      return m.reply(`🐉🌀 ¡Ja! ¿Qué quieres, tipo?\n⚡ Escribe *${usedPrefix}gotenks <mensaje>* y te contesto.`)
    }

    await client.sendPresenceUpdate('composing', m.chat)

    const prompt = `Actúa como Gotenks. Responde como él, divertido y arrogante. Respuesta corta. Pregunta: ${text}`

    try {
      const url = `https://api-gohan-v1.onrender.com/ai/gemini?text=${encodeURIComponent(prompt)}`
      const res = await fetch(url)
      const data = await res.text()
      
      console.log('RESPUESTA CRUDA:', data)
      
      let respuesta = data
      
      try {
        const parsed = JSON.parse(data)
        respuesta = parsed.text || parsed.result || parsed.response || data
      } catch (e) {
        respuesta = data
      }

      if (!respuesta || respuesta === '[object Object]' || respuesta.includes('[object')) {
        respuesta = "🐉🌀 ¡Ja! No entendí eso, tipo."
      }

      await client.sendPresenceUpdate('paused', m.chat)
      await m.reply(`🐉 ${respuesta} 🌀`)

    } catch (e) {
      console.error('[GOTENKS V1 ERROR]', e.message)
      await client.sendPresenceUpdate('paused', m.chat).catch(() => {})
      await m.reply(`🐉🌀 Error: ${e.message}`)
    }
  }
}