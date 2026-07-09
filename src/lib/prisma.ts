import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPool(): Pool {
  const hasAwsKey = !!(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY)
  const hasAwsOidc = !!(process.env.AWS_ROLE_ARN && process.env.VERCEL)
  if (process.env.PGHOST && (hasAwsKey || hasAwsOidc)) {
    // AWS RDS IAM 认证（Vercel 用 OIDC，本地用 AWS_ACCESS_KEY_ID）
    const signer = process.env.AWS_ROLE_ARN && process.env.VERCEL
      ? new Signer({
          hostname: process.env.PGHOST!,
          port: Number(process.env.PGPORT),
          username: process.env.PGUSER!,
          region: process.env.AWS_REGION!,
          credentials: awsCredentialsProvider({
            roleArn: process.env.AWS_ROLE_ARN,
            clientConfig: { region: process.env.AWS_REGION },
          }),
        })
      : new Signer({
          hostname: process.env.PGHOST!,
          port: Number(process.env.PGPORT),
          username: process.env.PGUSER!,
          region: process.env.AWS_REGION!,
        })
    const pool = new Pool({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      database: process.env.PGDATABASE || 'postgres',
      password: () => signer.getAuthToken(),
      port: Number(process.env.PGPORT),
      ssl: { rejectUnauthorized: false },
      max: 20,
    })
    if (process.env.VERCEL) attachDatabasePool(pool)
    return pool
  }
  // 本地 PostgreSQL
  return new Pool({ connectionString: process.env.DATABASE_URL, max: 20, ssl: false })
}

function createPrismaClient() {
  const pool = createPool()
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
