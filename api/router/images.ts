import { Router as RouterApp } from 'express'
import { endPoints } from '../../src/enums'
import { createSignedR2GetUrlByToken } from '../../src/services/cloudflareR2'
import { logger } from '../../src/utils/logger'

const router = RouterApp()

router.get(endPoints.IMAGES, async (req, res) => {
	const { imageToken } = req.params

	try {
		const signedUrl = await createSignedR2GetUrlByToken(imageToken)
		if (!signedUrl) {
			res.status(404).send({ error: 'Image token not valid' })
			return
		}

		res.setHeader('Cache-Control', 'no-store')
		res.redirect(302, signedUrl)
	} catch (error) {
		logger.error(`Error creating signed URL for image token ${imageToken}: ${error}`)
		res.status(500).send({ error: 'Error creating signed url' })
	}
})

export default router
