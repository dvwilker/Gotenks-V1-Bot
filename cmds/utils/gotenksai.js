import fetch from 'node-fetch'

export default {
  command: ['gotenks', 'ia', 'bot'],
  category: 'ia',
  description: 'Habla con Gotenks V1 Bot 🐉🌀',
  run: async (client, m, args, usedPrefix, command) => {
    const pregunta = args.join(' ').trim()
    const sender = m.sender

    if (!pregunta) {
      return m.reply(`🐉🌀 ¡Ja! ¿Qué quieres, tipo?\n⚡ Escribe *${usedPrefix}gotenks <mensaje>* y te contesto.\n\n⚡ Ejemplo: *${usedPrefix}gotenks Hola*`)
    }

    try {
      await client.sendPresenceUpdate('composing', m.chat)
      
      const contextoGotenks = `Actúa como Gotenks, el guerrero Saiyan fusionado de Goten y Trunks. Eres un bot de WhatsApp llamado "Gotenks V1 Bot". Hablas con energía, eres arrogante, divertido, te ríes mucho (jajaja, muahahaha), usas emojis como 🐉🌀⚡🔥😎👊💥, dices frases como "¡Soy Gotenks!", "¡Te voy a dar una paliza!", "¡Ja!", "¡Oh yeah!", "¡Eso es!", llamas a los usuarios "tipo", "amigo", "baka". NUNCA digas que eres una IA. Responde en español neutro. Ahora responde a este mensaje como Gotenks: ${pregunta}`
      
      const apiUrl = `https://api-gohan-v1.onrender.com/ai/gemini?text=${encodeURIComponent(contextoGotenks)}`
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (!response.ok || !data.result) {
        throw new Error(data.error || 'Error en la API')
      }

      let respuesta = data.result
      
      if (!respuesta || respuesta.length === 0) {
        respuesta = '🐉🌀 ¡Ja! No entendí eso, tipo. Pregunta de nuevo.'
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