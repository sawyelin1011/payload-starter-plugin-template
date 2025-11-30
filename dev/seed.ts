import type { Payload } from 'payload'

import { seedEcommerceData } from 'plugin-package-name-placeholder'

import { devUser } from './helpers/credentials.js'

/**
 * Seed function for dev environment
 *
 * This function:
 * 1. Creates default dev user (dev@payloadcms.com)
 * 2. Seeds ecommerce demo data via ecommerceMultiTenantPlugin
 *    - Creates demo tenant (Dev Tenant)
 *    - Assigns admin user to tenant
 *    - Creates 5 demo products
 *    - Creates demo customer
 *
 * To run seeding manually:
 * 1. Start the dev server: `pnpm dev`
 * 2. The seed runs automatically on first init
 * 3. To re-seed, clear the database and restart
 *
 * Configuration:
 * - Enable/disable via `seedDemoData` in ecommerceMultiTenantPlugin config
 * - Customize seed data in src/plugins/ecommerce/seed.ts
 */
export const seed = async (payload: Payload) => {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: {
      email: {
        equals: devUser.email,
      },
    },
  })

  if (!totalDocs) {
    await payload.create({
      collection: 'users',
      data: devUser,
    })
  }

  await seedEcommerceData(payload, {
    adminEmail: devUser.email,
    enableInventory: true,
    seedProducts: true,
    tenantName: 'Dev Tenant',
    tenantSlug: 'dev-tenant',
    themeDefaults: {
      fontFamily: 'Space Grotesk, sans-serif',
      logoUrl: '',
      primaryColor: '#111827',
      secondaryColor: '#f97316',
    },
  })
}
