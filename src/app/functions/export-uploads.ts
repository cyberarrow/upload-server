import { ilike } from 'drizzle-orm'
import z from 'zod'
import { db, pg } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { type Either, makeRight } from '@/shared/either.ts'

const exportUploadsInput = z.object({
	searchQuery: z.string().optional(),
})

type ExportUploadsInput = z.input<typeof exportUploadsInput>

type ExportUploadsOutput = { remoteUrl: string }

export async function exportUploads(
	input: ExportUploadsInput
): Promise<Either<never, ExportUploadsOutput>> {
	const { searchQuery } = exportUploadsInput.parse(input)

	const { sql, params } = db
		.select({
			id: schema.uploads.id,
			name: schema.uploads.name,
			remoteUrl: schema.uploads.remoteUrl,
			createdAt: schema.uploads.createdAt,
		})
		.from(schema.uploads)
		.where(
			searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined
		).toSQL()
    
    const cursor = pg.unsafe(sql, params as string[]).cursor(1)
    
    for await (const rows of cursor) {
        console.log(rows)
    }

	return makeRight({ remoteUrl: '' })
}
