import app from './index'

const PORT = process.env.PORT ?? 3002
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))