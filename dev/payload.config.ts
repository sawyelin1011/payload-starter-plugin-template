import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import { buildConfig } from 'payload'
import { ecommerceMultiTenantPlugin, myPlugin } from 'plugin-package-name-placeholder'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

const buildConfigWithMemoryDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    const memoryDB = await MongoMemoryReplSet.create({
      replSet: {
        count: 3,
        dbName: 'payloadmemory',
      },
    })

    process.env.DATABASE_URI = `${memoryDB.getUri()}&retryWrites=true`
  }

  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
    },
    collections: [
      {
        slug: 'posts',
        fields: [],
      },
      {
        slug: 'media',
        fields: [],
        upload: {
          staticDir: path.resolve(dirname, 'media'),
        },
      },
    ],
    db: mongooseAdapter({
      ensureIndexes: true,
      url: process.env.DATABASE_URI || '',
    }),
    editor: lexicalEditor(),
    email: testEmailAdapter,
    onInit: async (payload) => {
      await seed(payload)
    },
    plugins: [
      myPlugin({
        collections: {
          posts: true,
        },
      }),
      ecommerceMultiTenantPlugin({
        enableSubscriptions: true,
        paymentProviders: [
          {
            slug: 'stripe-test',
            type: 'stripe',
            cancelUrl: 'http://localhost:3000/cancel',
            displayName: 'Stripe Test',
            publishableKeyEnv: 'STRIPE_PUBLISHABLE_KEY',
            secretKeyEnv: 'STRIPE_SECRET_KEY',
            successUrl: 'http://localhost:3000/success',
            supportsSubscriptions: true,
            webhookPath: '/api/webhooks/stripe/dev',
            webhookSecretEnv: 'STRIPE_WEBHOOK_SECRET',
          },
          {
            slug: 'manual-offline',
            type: 'manual',
            displayName: 'Manual / Invoice',
            supportsSubscriptions: false,
          },
        ],
        seedDemoData: true,
        tenantStrategy: {
          mode: 'path',
          segment: 'tenant',
        },
        themeDefaults: {
          fontFamily: 'Space Grotesk, sans-serif',
          primaryColor: '#111827',
          secondaryColor: '#f97316',
        },
      }),
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  })
}

export default buildConfigWithMemoryDB()
