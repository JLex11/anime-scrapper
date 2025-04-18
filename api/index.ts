import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { setOriginPath } from '../src/config'
import { endPoints } from '../src/enums'
import animesRouter from './router/animes'
import episodesRouter from './router/episodes'
import imagesRouter from './router/images'
import routesDocumentation from './router/routesDocumentation'

const app: express.Application = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use(morgan('dev'))

app.use(async (req, _, next) => {
	const isProdMode = process.env.VERCEL_ENV === 'production'
	setOriginPath(`${isProdMode ? 'https' : req.protocol}://${req.get('host')}`)
	next()
})

app.get('/', (_, res) => res.redirect('/api'))

app.use('/api/', routesDocumentation)
app.use('/api/animes', animesRouter)
app.use('/api/episodes', episodesRouter)
app.use(`/api${endPoints.IMAGES}`, imagesRouter)

app.use('*', (_, res) => {
	res.status(404).send('Not found')
})

export default app
