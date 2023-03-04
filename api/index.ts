import express from 'express'
import router from './router/routes'

const app = express()

app.use(express.json())
app.use(express.static('public'))
app.use(router)

if (process.env.NODE_ENV !== 'production') {
  app.listen(3001, () => console.log('Server running on port 3001'))
}

export default app
