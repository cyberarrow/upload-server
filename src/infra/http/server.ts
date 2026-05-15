import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
	hasZodFastifySchemaValidationErrors,
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from '@/env.ts'

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

console.log(env)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
	console.log('Server running!')
})
