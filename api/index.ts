import cors from 'cors'
import * as dotenv from 'dotenv'
import express from 'express'
import { setOriginPath } from './config'
import animesRouter from './router/animes'
import episodesRouter from './router/episodes'
import routesDocumentation from './router/routesDocumentation'
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

app.use((req, _, next) => {
  setOriginPath(`${req.protocol}://${req.get('host')}`)
  next()
})

app.use('/api', routesDocumentation)
app.use('/api', animesRouter)
app.use('/api', episodesRouter)

if (process.env.NODE_ENV !== 'production') {
  app.listen(3002, () => console.log('Server running on port 3002'))
}
 
export default app
