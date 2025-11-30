/* eslint-disable no-console */
import type { Payload } from 'payload'

import type { ThemeDefaults } from '../../types/config.js'

export interface SeedOptions {
  adminEmail?: string
  enableInventory?: boolean
  productCount?: number
  seedProducts?: boolean
  tenantName?: string
  tenantSlug?: string
  themeDefaults?: ThemeDefaults
}

const collectionExists = (payload: Payload, slug: string): boolean => {
  return Boolean((payload as { collections?: Record<string, unknown> } & Payload)?.collections?.[slug])
}

export const seedEcommerceData = async (
  payload: Payload,
  options: SeedOptions = {},
): Promise<void> => {
  const {
    adminEmail = 'admin@demo.com',
    enableInventory,
    productCount = 5,
    seedProducts = true,
    tenantName = 'Demo Store',
    tenantSlug = 'demo-store',
    themeDefaults,
  } = options

  const resolvedTheme: Required<ThemeDefaults> = {
    fontFamily: themeDefaults?.fontFamily ?? 'Inter, sans-serif',
    logoUrl: themeDefaults?.logoUrl ?? '',
    primaryColor: themeDefaults?.primaryColor ?? '#111827',
    secondaryColor: themeDefaults?.secondaryColor ?? '#2563eb',
  }

  const hasInventoryCollection = enableInventory ?? collectionExists(payload, 'inventory')
  const hasStoreSettingsCollection = collectionExists(payload, 'store-settings')

  console.log('🌱 Seeding ecommerce data...')

  const existingTenant = await payload.find({
    collection: 'tenants',
    limit: 1,
    where: { slug: { equals: tenantSlug } },
  })

  let tenant

  if (existingTenant.totalDocs === 0) {
    console.log('  ↳ Creating demo tenant...')
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: tenantName,
        slug: tenantSlug,
        settings: {
          allowedPaymentProviders: ['stripe'],
          currency: 'USD',
          timezone: 'America/New_York',
        },
        status: 'active',
        theme: resolvedTheme,
      },
    })
    console.log(`  ✓ Created tenant: ${tenant.name}`)
  } else {
    tenant = existingTenant.docs[0]
    console.log(`  ✓ Tenant already exists: ${tenant.name}`)
  }

  const existingUser = await payload.find({
    collection: 'users',
    limit: 1,
    where: { email: { equals: adminEmail } },
  })

  let adminUser = existingUser.docs[0]

  if (existingUser.totalDocs === 0) {
    console.log('  ↳ Creating admin user...')
    adminUser = await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: 'password',
        role: 'admin',
        tenantId: tenant.id,
      },
    })
    console.log(`  ✓ Created admin user: ${adminEmail}`)
  } else {
    console.log(`  ✓ Admin user already exists: ${adminEmail}`)
  }

  if (adminUser && !adminUser.tenantId) {
    await assignUserToTenant(payload, adminUser.id as string, tenant.id)
    console.log('  ✓ Linked admin user to tenant')
  }

  if (seedProducts) {
    console.log(`  ↳ Creating ${productCount} demo products...`)

    for (let i = 1; i <= productCount; i++) {
      const productSlug = `demo-product-${i}`
      const existingProduct = await payload.find({
        collection: 'products',
        limit: 1,
        where: { slug: { equals: productSlug } },
      })

      if (existingProduct.totalDocs === 0) {
        const product = await payload.create({
          collection: 'products',
          data: {
            name: `Demo Product ${i}`,
            slug: productSlug,
            type: i % 2 === 0 ? 'digital' : 'physical',
            compareAtPrice: 39.99 + i * 10,
            description: `This is demo product ${i} for testing purposes.`,
            metadata: {
              featured: i <= 3,
            },
            price: 29.99 + i * 10,
            requiresShipping: i % 2 !== 0,
            sku: `DEMO-${i.toString().padStart(3, '0')}`,
            status: 'published',
            tenantId: tenant.id,
            trackInventory: true,
          },
        })

        if (hasInventoryCollection) {
          await payload.create({
            collection: 'inventory',
            data: {
              product: product.id,
              sku: product.sku,
              stock: 25,
              tenantId: tenant.id,
              warehouse: 'Main Warehouse',
            },
          })
        }
      }
    }
    console.log(`  ✓ Created ${productCount} demo products`)
  }

  const existingCustomer = await payload.find({
    collection: 'customers',
    limit: 1,
    where: { email: { equals: 'customer@demo.com' } },
  })

  if (existingCustomer.totalDocs === 0) {
    console.log('  ↳ Creating demo customer...')
    await payload.create({
      collection: 'customers',
      data: {
        addresses: [
          {
            name: 'Demo Customer',
            type: 'both',
            city: 'New York',
            country: 'US',
            isDefault: true,
            line1: '123 Main St',
            postalCode: '10001',
            state: 'NY',
          },
        ],
        email: 'customer@demo.com',
        firstName: 'Demo',
        lastName: 'Customer',
        phone: '+1234567890',
        tenantId: tenant.id,
      },
    })
    console.log('  ✓ Created demo customer')
  } else {
    console.log('  ✓ Demo customer already exists')
  }

  if (hasStoreSettingsCollection) {
    const existingSettings = await payload.find({
      collection: 'store-settings',
      limit: 1,
      where: { tenantId: { equals: tenant.id } },
    })

    if (existingSettings.totalDocs === 0) {
      await payload.create({
        collection: 'store-settings',
        data: {
          defaultCurrency: 'USD',
          defaultLocale: 'en-US',
          defaultTenantTheme: resolvedTheme,
          digitalDelivery: {
            signedUrlTtlSeconds: 600,
            storageAdapter: 's3',
          },
          tenantId: tenant.id,
        },
      })
      console.log('  ✓ Created store settings with theme defaults')
    }
  }

  console.log('✅ Ecommerce data seeded successfully!')
}

export const seedTenant = async (
  payload: Payload,
  data: {
    adminEmail?: string
    name: string
    slug: string
    themeDefaults?: ThemeDefaults
  },
): Promise<Record<string, unknown>> => {
  const existing = await payload.find({
    collection: 'tenants',
    limit: 1,
    where: { slug: { equals: data.slug } },
  })

  if (existing.totalDocs > 0) {
    return existing.docs[0]
  }

  return payload.create({
    collection: 'tenants',
    data: {
      name: data.name,
      slug: data.slug,
      settings: {
        allowedPaymentProviders: ['stripe'],
        currency: 'USD',
      },
      status: 'active',
      theme: data.themeDefaults || {},
    },
  })
}

export const assignUserToTenant = async (
  payload: Payload,
  userId: string,
  tenantId: string,
): Promise<void> => {
  await payload.update({
    id: userId,
    collection: 'users',
    data: {
      tenantId,
    },
  })
}
