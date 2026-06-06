import axios from 'axios'

export default {
  command: ['gotenks', 'gotenksai', 'ia', 'bot'],
  category: 'ia',
  description: 'Habla con Gotenks V1 Bot 🐉🌀',
  run: async (client, m, args, usedPrefix, command) => {
    const text = args.join(' ').trim()
    
    if (!text) {
      return m.reply(`🐉🌀 ¡Ja! ¿Qué quieres, tipo?\n⚡ Escribe *${usedPrefix}gotenks <mensaje>* y te contesto.\n\n⚡ Ejemplo: *${usedPrefix}gotenks Hola*`)
    }

    await client.sendPresenceUpdate('composing', m.chat)

    const prompt = `Actúa como Gotenks, el guerrero Saiyan fusionado de Goten y Trunks. Hablas con energía, eres arrogante, divertido, presumido. Usas frases como "¡Soy Gotenks!", "¡Te voy a dar una paliza!", "¡Ja!", "¡Oh yeah!". Usas emojis como 🐉🌀⚡🔥😎👊. Llamas a los usuarios "tipo" o "amigo". NUNCA digas que eres una IA. Responde en español neutro y corto. Ahora responde a esto: ${text}`

    try {
      const url = `https://api-gohan-v1.onrender.com/ai/gemini?text=${encodeURIComponent(prompt)}`
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
      })

      let respuesta = data?.result || data?.data?.result || data?.response || data

      if (typeof respuesta === 'object') {
        respuesta = JSON.stringify(respuesta)
      }

      if (!respuesta || respuesta.includes('error') || respuesta.length < 2) {
        respuesta = "🐉🌀 ¡Ja! No entendí eso, tipo. Pregunta de nuevo."
      }

      await client.sendPresenceUpdate('paused', m.chat)
      await m.reply(`🐉 ${respuesta} 🌀`)

    } catch (e) {
      console.error('[GOTENKS V1 ERROR]', e.message)
      await client.sendPresenceUpdate('paused', m.chat).catch(() => {})
      await m.reply(`🐉🌀 ¡Ups! Algo salió mal.\n⚡ Error: ${e.message}`)
    }
  }
}