import 'dotenv/config'
import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'

// Identificador do Supabase Preview
const PREVIEW_PROJECT_REF = 'htqzbjfjpvfossfrjtao'

const connectionString = process.env.DATABASE_URL

// Impede a execução sem uma conexão configurada
if (!connectionString) {
  throw new Error('DATABASE_URL não configurada!')
}

const connection = new URL(connectionString)

// Valida conexões diretas e via pooler do Supabase Preview
const isDirectConnection =
  connection.hostname === `db.${PREVIEW_PROJECT_REF}.supabase.co` &&
  connection.username === 'postgres'

const isPoolerConnection =
  connection.hostname.endsWith('.pooler.supabase.com') &&
  connection.username === `postgres.${PREVIEW_PROJECT_REF}`

// Bloqueia conexões com outros projetos
if (!isDirectConnection && !isPoolerConnection) {
  throw new Error(
    'Conexão bloqueada! O banco configurado não é o Supabase Preview.'
  )
}

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString,
    max: 10,
  })
})

export const db = new Kysely<Database>({
  dialect,
})
