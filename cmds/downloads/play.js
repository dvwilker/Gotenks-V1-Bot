import yts from "yt-search"
import fetch from "node-fetch"

export default {
  command: ['play', 'mp3', 'playaudio', 'ytmp3'],
  category: 'descargas',
  run: async (client, m, args, usedPrefix, command) => {
    const text = args.join(' ').trim()
    if (!text) return m.reply("🐉🌀 Ingresa el nombre o enlace del video de YouTube.")

    await m.react("🕘")

    try {
      let url = text.trim()
      let title = "Desconocido"
      let authorName = "Desconocido"
      let durationTimestamp = "Desconocida"
      let views = 0
      let thumbnail = ""

      const isUrl = /^https?:\/\/\S+/i.test(url)

      if (isUrl) {
        if (!isYouTubeUrl(url)) {
          return m.reply("🐉🌀 El enlace no es válido de YouTube.")
        }

        const videoId = extractVideoId(url)
        if (!videoId) {
          return m.reply("🐉🌀 No pude extraer el ID del video.")
        }

        const res = await yts({ videoId })

        if (!res) {
          return m.reply("🐉🌀 No pude obtener información del video.")
        }

        title = res.title || title
        authorName = res.author?.name || authorName
        durationTimestamp = res.timestamp || durationTimestamp
        views = res.views || views
        thumbnail = res.thumbnail || thumbnail
        url = res.url || url
      } else {
        const res = await yts(text)

        if (!res?.all?.length) {
          return m.reply("🐉🌀 No encontré nada.")
        }

        const video = res.all[0]
        title = video.title || title
        authorName = video.author?.name || authorName
        durationTimestamp = video.timestamp || durationTimestamp
        views = video.views || views
        url = video.url || url
        thumbnail = video.thumbnail || thumbnail
      }

      const vistas = formatViews(views)

      const caption = `
🐉 *GOTENKS V1 DOWNLOADER* 🌀

⚡ *Info del Video*

> 🎼 Título: ${title}
> 📺 Canal: ${authorName}
> 👁️ Vistas: ${vistas}
> ⏳ Duración: ${durationTimestamp}
> 🌐 Enlace: ${url}

🐉 *Powered by Gotenks V1* 🌀
`

      let thumbBuffer = null
      if (thumbnail) {
        try {
          const thumbRes = await fetch(thumbnail)
          thumbBuffer = Buffer.from(await thumbRes.arrayBuffer())
        } catch {
          thumbBuffer = null
        }
      }

      if (thumbBuffer) {
        await client.sendMessage(m.chat, {
          image: thumbBuffer,
          caption: caption
        }, { quoted: m })
      } else {
        await m.reply(caption)
      }

      await m.reply("🎵 Descargando audio... ⚡")

      const apiUrl = `https://api-gohan-v1.onrender.com/download/ytaudio?url=${encodeURIComponent(url)}`
      const r = await fetch(apiUrl)

      if (!r.ok) {
        return m.reply(`🐉🌀 Error HTTP ${r.status} al obtener el audio.`)
      }

      const data = await r.json()

      if (!data?.status || !data?.result?.download_url) {
        return m.reply("🐉🌀 No se pudo obtener el audio.\n⚡ Estructura: " + JSON.stringify(data))
      }

      const fileUrl = data.result.download_url
      const fileTitle = cleanName(data.result.title || title)

      await client.sendMessage(m.chat, {
        audio: { url: fileUrl },
        mimetype: "audio/mpeg",
        fileName: `${fileTitle}.mp3`,
        ptt: false
      }, { quoted: m })

      await m.reply(`✅ *Descarga completada* 🐉\n\n🎼 Título: ${fileTitle}`)
      await m.react("✅")

    } catch (e) {
      console.error(e)
      await m.reply(`🐉🌀 Error: ${e.message}`)
      await m.react("⚠️")
    }
  }
}

const cleanName = (name) =>
  String(name).replace(/[^\w\s._-]/gi, "").substring(0, 50)

const formatViews = (views) => {
  const n = Number(views)
  if (!n || Number.isNaN(n)) return "No disponible"
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toString()
}

const isYouTubeUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)
}

const extractVideoId = (url) => {
  const match =
    url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&/]|\b)/) ||
    url.match(/youtu\.be\/([0-9A-Za-z_-]{11})/)
  return match?.[1] || null
}