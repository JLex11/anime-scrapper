import cors from 'cors'
import * as dotenv from 'dotenv'
import express from 'express'
import { getOriginPath, setOriginPath } from './config'
import animesRouter from './router/animes'
import episodesRouter from './router/episodes'
import routesDocumentation from './router/routesDocumentation'
import { mapOriginPath } from './utils/mapOriginPath'
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

app.use((req, _, next) => {
  setOriginPath(`${req.protocol}://${req.get('host')}`)
  next()
})

app.get('/api', (_, res) => {
  const originPath = getOriginPath()

  return res.send(routesDocumentation.map(docRoute => ({
    ...docRoute,
    route: mapOriginPath(originPath, `api${docRoute.route}`)
  })))
})

app.use('/api', animesRouter)
app.use('/api', episodesRouter)

if (process.env.NODE_ENV !== 'production') {
  app.listen(3001, () => console.log('Server running on port 3001'))
}
 
export default app
