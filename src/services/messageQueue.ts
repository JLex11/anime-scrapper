import amqp from 'amqplib'

const QUEUE_NAME = 'image_processing'
const RABBITMQ_USER = process.env.RABBITMQ_DEFAULT_USER || 'guest'
const RABBITMQ_PASS = process.env.RABBITMQ_DEFAULT_PASS || 'guest'
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost'
const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}`

export type MessageQueue = {
	animeId: string
	query: string
}

export const sendToQueue = async (message: MessageQueue) => {
	const connection = await amqp.connect(RABBITMQ_URL).catch(err => {
		console.error('Error connecting to RabbitMQ:', err)
	})
	if (!connection) return

	const channel = await connection.createChannel()
	await channel.assertQueue(QUEUE_NAME)

	channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)))
	console.warn('Mensaje enviado a la cola:', message)

	await channel.close()
	await connection.close()
}

export const consumeQueue = async (callback: (msg: MessageQueue) => void) => {
	const connection = await amqp.connect(RABBITMQ_URL).catch(err => {
		console.error('Error connecting to RabbitMQ:', err)
	})
	if (!connection) return

	const channel = await connection.createChannel()
	await channel.assertQueue(QUEUE_NAME)

	channel.consume(QUEUE_NAME, msg => {
		if (!msg) return
		console.warn('Mensaje recibido de la cola:', msg.content.toString())

		const content = JSON.parse(msg.content.toString())
		callback(content)
		channel.ack(msg)
	})
}
