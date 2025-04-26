import { Router as RouterApp } from 'express'
import { endPoints } from '../../src/enums'
import { s3GetOperation } from '../../src/services/cloudflareR2'

const router = RouterApp()

router.get(endPoints.IMAGES, async (req, res) => {
	const { imgFilename } = req.params

	try {
		const s3Response = await s3GetOperation({ filename: imgFilename })
		const imgBuffer = s3Response?.Body

		res.setHeader('Content-Type', 'image/webp')
		res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

		res.send(imgBuffer)
	} catch (error) {
		console.error(error)
		res.status(404).send({ error: 'Image not found' })
	}
})

export default router
