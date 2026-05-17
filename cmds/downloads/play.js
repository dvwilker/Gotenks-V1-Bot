import yts from 'yt-search'
import fetch from 'node-fetch'
import sharp from 'sharp'
import axios from 'axios'
import crypto from 'crypto'
import { getBuffer } from '../../lib/message.js'

const limit = 100

class SaveTube {

  constructor() {

    this.ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12'

    this.m =
      /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/

    this.is = axios.create({
      headers: {
        'content-type': 'application/json',
        origin: 'https://yt.savetube.me',
        'user-agent':
          'Mozilla/5.0'
      }
    })
  }

  async decrypt(enc) {

    const sr = Buffer.from(enc, 'base64')

    const ky = Buffer.from(this.ky, 'hex')

    const iv = sr.slice(0, 16)

    const dt = sr.slice(16)

    const dc = crypto.createDecipheriv(
      'aes-128-cbc',
      ky,
      iv
    )

    return JSON.parse(
      Buffer.concat([
        dc.update(dt),
        dc.final()
      ]).toString()
    )
  }

  async getCdn() {

    const r = await this.is.get(
      'https://media.savetube.vip/api/random-cdn'
    )

    return r.data.cdn
  }

  async download(url, isAudio) {

    const id = url.match(this.m)?.[3]

    if (!id) {
      throw new Error('ID inválido')
    }

    const cdn = await this.getCdn()

    const info = await this.is.post(
      `https://${cdn}/v2/info`,
      {
        url: `https://www.youtube.com/watch?v=${id}`
      }
    )

    const dec = await this.decrypt(info.data.data)

    const dl = await this.is.post(
      `https://${cdn}/download`,
      {
        id,
        downloadType: isAudio ? 'audio' : 'video',
        quality: isAudio ? '128' : '720',
        key: dec.key
      }
    )

    return {
      dl: dl.data.data.downloadUrl,
      title: dec.title
    }
  }
}

const isYTUrl = (url) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/).+$/i.test(url)

const fetchParallelFirstValid = async (
  url,
  apis,
  timeout = 15000
) => {

  return new Promise((resolve, reject) => {

    let settled = false

    let errors = 0

    const timer = setTimeout(() => {

      if (!settled) {
        reject(
          new Error('Todas las APIs fallaron')
        )
      }

    }, timeout)

    apis.forEach(api => {

      ;(async () => {

        try {

          let result

          if (api.custom) {

            result = await api.run(url)

            if (result?.dl && !settled) {

              settled = true

              clearTimeout(timer)

              resolve(result)
            }

            return
          }

          const res = await fetch(api.url(url))

          const json = await res.json()

          if (api.validate(json)) {

            const parsed = await api.parse(json)

            if (parsed?.dl && !settled) {

              settled = true

              clearTimeout(timer)

              resolve(parsed)
            }
          }

        } catch {}

        errors++

        if (
          errors === apis.length &&
          !settled
        ) {

          clearTimeout(timer)

          reject(
            new Error('Todas las APIs fallaron')
          )
        }

      })()
    })
  })
}

const nekolabsApi = {

  url: (url) =>
    `https://api.nekolabs.my.id/downloader/youtube?url=${encodeURIComponent(url)}&format=mp3`,

  validate: (result) =>
    result.result?.downloadUrl,

  parse: (result) => ({
    dl: result.result.downloadUrl,
    title: result.result.title
  })
}

const aioApi = {

  url: (url) =>
    `https://anabot.my.id/api/download/aio?url=${encodeURIComponent(url)}&apikey=freeApikey`,

  validate: (result) =>
    result.medias?.length,

  parse: (result) => {

    const media = result.medias.find(
      m => m.type === 'audio'
    )

    return {
      dl: media?.url,
      title: result.title
    }
  }
}

const anabotMp3Api = {

  url: (url) =>
    `https://anabot.my.id/api/download/ytmp3?url=${encodeURIComponent(url)}&apikey=freeApikey`,

  validate: (result) =>
    result?.data?.result?.urls,

  parse: (result) => ({
    dl: result.data.result.urls,
    title: result.data.result.metadata?.title
  })
}

const nexevoMp3Api = {

  url: (url) =>
    `https://nexevo-api.vercel.app/download/y?url=${encodeURIComponent(url)}`,

  validate: (result) =>
    result?.result?.url,

  parse: (result) => ({
    dl: result.result.url,
    title: result.result.info?.title
  })
}

export default {

  command: [
    'play',
    'mp3',
    'playaudio',
    'ytmp3'
  ],

  category: 'descargas',

  run: async (
    client,
    m,
    args,
    usedPrefix,
    command
  ) => {

    try {

      const text = args.join(' ').trim()

      if (!text) {

        return m.reply(
          '✎ Ingresa algún termino o URL de YouTube.'
        )
      }

      const esURL = isYTUrl(text)

      let url, title, videoInfo

      if (!esURL) {

        const search = await yts(text)

        if (!search.all.length) {
          return m.reply(
            'ꕥ No se encontraron resultados.'
          )
        }

        videoInfo = search.all[0]

        title = videoInfo.title

        url = videoInfo.url

        const vistas = (
          videoInfo.views || 0
        ).toLocaleString()

        const canal =
          videoInfo.author?.name ||
          'Desconocido'

        const timestamp =
          videoInfo.timestamp ||
          'Desconocido'

        const ago =
          videoInfo.ago ||
          'Desconocido'

        const infoMessage = `
*Descargando...*

> 🐉 Título: ${title}
> 🌀 Duración: ${timestamp}
> 🐉 Vistas: ${vistas}
> 🌀 Canal: ${canal}
> 🐉 Publicado: ${ago}
`

        let thumb

        try {

          thumb = await getBuffer(
            videoInfo.thumbnail
          )

        } catch {}

        await client.sendMessage(
          m.chat,
          thumb
            ? {
                image: thumb,
                caption: infoMessage
              }
            : {
                text: infoMessage
              },
          { quoted: m }
        )

      } else {

        url = text

        title = 'Audio'
      }

      const isAudio = true

      const saveTubeFallback = {

        custom: true,

        run: async (url) => {

          const sv = new SaveTube()

          return await sv.download(
            url,
            isAudio
          )
        }
      }

      const apis = [

        nexevoMp3Api,
        anabotMp3Api,
        nekolabsApi,
        aioApi,
        saveTubeFallback

      ]

      const { dl } =
        await fetchParallelFirstValid(
          url,
          apis
        )

      if (
        !dl ||
        !/^https?:\/\//.test(dl)
      ) {

        return m.reply(
          '✎ Enlace inválido.'
        )
      }

      let thumbBuffer = null

      if (videoInfo?.thumbnail) {

        try {

          const response =
            await fetch(
              videoInfo.thumbnail
            )

          const arrayBuffer =
            await response.arrayBuffer()

          thumbBuffer = await sharp(
            Buffer.from(arrayBuffer)
          )
            .resize(320, 180)
            .jpeg({ quality: 80 })
            .toBuffer()

        } catch {}
      }

      await client.sendMessage(
        m.chat,
        {
          document: { url: dl },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          jpegThumbnail: thumbBuffer
        },
        { quoted: m }
      )

    } catch (error) {

      console.log(error)

      m.reply(
        `Error:\n${error.message}`
      )
    }
  }
}