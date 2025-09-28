import { defineCollection, z } from 'astro:content'

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

const parameterSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	required: z.boolean().default(false),
	example: z.union([z.string(), z.number(), z.boolean()]).optional(),
})

const docsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		category: z.string().default('General'),
		order: z.number().default(0),
		endpoint: z.string().optional(),
		method: z.enum(httpMethods).default('GET'),
		playground: z.boolean().default(false),
		headers: z.array(parameterSchema).optional(),
		queryParams: z.array(parameterSchema).optional(),
		bodyParams: z.array(parameterSchema).optional(),
		requestExample: z.any().optional(),
		responseExample: z.any().optional(),
	}),
})

export const collections = {
	docs: docsCollection,
}
