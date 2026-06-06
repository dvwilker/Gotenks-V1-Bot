import yts from 'yt-search'
import fetch from 'node-fetch'
import sharp from 'sharp'
import { getBuffer } from '../../lib/message.js'

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/).+$/i.test(url)

export default {
  command: ['play', 'mp3', 'playaudio', 'ytmp3'],
  category: 'descargas',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const text = args.join(' ').trim()
      if (!text) {
        return m.reply('🐉🌀 Ingresa algún término o URL de YouTube.')
      }

      const esURL = isYTUrl(text)
      let url, title, videoInfo

      if (!esURL) {
        const search = await yts(text)
        if (!search.all.length) {
          return m.reply('🐉🌀 No se encontraron resultados.')
        }

        videoInfo = search.all[0]
        title = videoInfo.title
        url = videoInfo.url

        const vistas = (videoInfo.views || 0).toLocaleString()
        const canal = videoInfo.author?.name || 'Desconocido'
        const timestamp = videoInfo.timestamp || 'Desconocido'
        const ago = videoInfo.ago || 'Desconocido'

        const infoMessage = `
🐉 *GOTENKS V1 DOWNLOADER* 🌀

⚡ *Descargando audio...*

> 🐉 Título: ${title}
> 🌀 Duración: ${timestamp}
> 🐉 Vistas: ${vistas}
> 🌀 Canal: ${canal}
> 🐉 Publicado: ${ago}
`

        let thumb
        try {
          thumb = await getBuffer(videoInfo.thumbnail)
        } catch {}

        await client.sendMessage(
          m.chat,
          thumb ? { image: thumb, caption: infoMessage } : { text: infoMessage },
          { quoted: m }
        )
      } else {
        url = text
        title = 'Audio Gotenks'
      }

      const loadingMsg = await client.sendMessage(m.chat, { text: '🎵 Descargando audio... ⚡' }, { quoted: m })

      const apiUrl = `https://api-gohan-v1.onrender.com/download/ytaudio?url=${encodeURIComponent(url)}`

      const res = await fetch(apiUrl)
      const data = await res.json()

      if (!data || !data.status || !data.result || !data.result.download_url) {
        await client.sendMessage(m.chat, { 
          text: '🐉🌀 No se pudo obtener el enlace de descarga.\n⚡ Intenta con otro video.',
          edit: loadingMsg.key 
        })
        return
      }

      const dl = data.result.download_url
      const videoTitle = data.result.title || title

      await client.sendMessage(m.chat, { 
        text: '✅ *Descarga completada* 🐉🌀',
        edit: loadingMsg.key 
      })

      let thumbBuffer = null
      if (videoInfo?.thumbnail) {
        try {
          const response = await fetch(videoInfo.thumbnail)
          const arrayBuffer = await response.arrayBuffer()
          thumbBuffer = await sharp(Buffer.from(arrayBuffer))
            .resize(320, 180)
            .jpeg({ quality: 80 })
            .toBuffer()
        } catch {}
      }

      await client.sendMessage(m.chat, {
        document: { url: dl },
        mimetype: 'audio/mpeg',
        fileName: `${videoTitle}.mp3`,
        jpegThumbnail: thumbBuffer
      }, { quoted: m })

      await m.react('✅')

    } catch (error) {
      console.log(error)
      m.reply(`🐉🌀 Error: ${error.message}`)
    }
  }
}