import amqp from 'amqplib'

const QUEUE_NAME = 'image_processing'
export type MessageQueue = {
	animeId: string
	query: string
}

export const sendToQueue = async (message: MessageQueue) => {
	const connection = await amqp.connect('amqp://localhost').catch(err => {
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
	const connection = await amqp.connect('amqp://localhost')
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
