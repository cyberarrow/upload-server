import { fastifyCors } from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
	hasZodFastifySchemaValidationErrors,
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod'
import { exportUploadsRoute } from './routes/export-uploads.ts'
import { getUploadsRoute } from './routes/get-uploads.ts'
import { uploadImageRoute } from './routes/upload-image.ts'
import { transformSwaggerSchema } from './transform-swagger-schema.ts'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, reply) => {
	if (hasZodFastifySchemaValidationErrors(error)) {
		return reply.status(400).send({
			message: 'Validations error.',
			issues: error.validation,
		})
	}

	//Enviar p/ uma ferramenta de observabilidade
	console.log(error)

	return reply.status(500).send({ message: 'Internal server error.' })
})

server.register(fastifyCors, { origin: '*' })

server.register(fastifyMultipart)
server.register(fastifySwagger, {
	openapi: {
		info: {
			title: 'Upload server',
			version: '1.0.0',
		},
	},
	transform: transformSwaggerSchema,
})
server.register(fastifySwaggerUi, {
	routePrefix: '/docs',
})

server.register(uploadImageRoute)
server.register(getUploadsRoute)
server.register(exportUploadsRoute)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
	console.log('Server running!')
})
