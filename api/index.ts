import cors from 'cors'
import * as dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import { setOriginPath } from './config'
import animesRouter from './router/animes'
import episodesRouter from './router/episodes'
import routesDocumentation from './router/routesDocumentation'
dotenv.config()

const PORT = process.env.PORT ?? 3002

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use(morgan('dev'))

app.use((req, _, next) => {
  setOriginPath(`${req.protocol}://${req.get('host')}`)
  next()
})

app.use('/api', routesDocumentation)
app.use('/api/animes', animesRouter)
app.use('/api/episodes', episodesRouter)

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))

//export default app
