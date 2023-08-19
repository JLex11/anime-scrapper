import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { setOriginPath } from '../src/config'
import { endPoints } from '../src/enums'
import { s3GetOperation } from '../src/services/clouflareR2'
import animesRouter from './router/animes'
import episodesRouter from './router/episodes'
import routesDocumentation from './router/routesDocumentation'

const PORT = process.env.PORT ?? 3002

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use(morgan('dev'))

app.use(async (req, _, next) => {
  setOriginPath(`${req.protocol}://${req.get('host')}`)
  next()
})

app.use('/api', routesDocumentation)
app.use('/api/animes', animesRouter)
app.use('/api/episodes', episodesRouter)

app.get(endPoints.IMAGES, async (req, res) => {
  const { imgFilename } = req.params
  const s3Response = await s3GetOperation({ filename: imgFilename })

  if (s3Response.$response?.error) {
    return res.status(404).send('Image not found')
  }

  const imgBuffer = s3Response?.Body
  res.setHeader('Content-Type', 'image/*')
  res.send(imgBuffer)
})

app.use('*', (_, res) => res.status(404).send('Not found'))

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
//export default app
