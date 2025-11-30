import type { CollectionConfig, Config, Field } from 'payload'

import type {
  EcommerceMultiTenantConfig,
  EcommerceMultiTenantResolvedConfig,
} from '../../types/config.js'

import { Customers } from './collections/Customers.js'
import { DigitalFiles } from './collections/DigitalFiles.js'
import { Inventory } from './collections/Inventory.js'
import { Licenses } from './collections/Licenses.js'
import { Orders } from './collections/Orders.js'
import { createProductsCollection } from './collections/Products.js'
import { StoreSettings } from './collections/StoreSettings.js'
import { Subscriptions } from './collections/Subscriptions.js'
import { Tenants } from './collections/Tenants.js'
import { ThemeConfig } from './collections/ThemeConfig.js'
import { createVariantsCollection } from './collections/Variants.js'
import { seedEcommerceData } from './seed.js'

const tenantUserFields: Field[] = [
  {
    name: 'role',
    type: 'select',
    defaultValue: 'admin',
    options: [
      { label: 'Super Admin', value: 'admin' },
      { label: 'Tenant Admin', value: 'manager' },
      { label: 'Support', value: 'support' },
      { label: 'Customer', value: 'customer' },
    ],
    required: true,
    saveToJWT: true,
  },
  {
    name: 'tenantId',
    type: 'relationship',
    admin: {
      position: 'sidebar',
    },
    relationTo: 'tenants',
    saveToJWT: true,
  },
]

const getFieldName = (field: Field): string | undefined => {
  if (field && typeof field === 'object' && 'name' in field) {
    return (field as { name?: string }).name
  }

  return undefined
}

const ensureTenantAwareUsers = (collections: CollectionConfig[]): void => {
  const usersCollection = collections.find((collection) => collection.slug === 'users')

  if (usersCollection) {
    usersCollection.auth = usersCollection.auth ?? true
    usersCollection.fields = usersCollection.fields || []

    const existingFields = new Set(
      usersCollection.fields
        .map((field) => getFieldName(field))
        .filter(Boolean) as string[],
    )

    tenantUserFields.forEach((field) => {
      const fieldName = getFieldName(field)
      if (fieldName && !existingFields.has(fieldName)) {
        usersCollection.fields?.push(field)
      }
    })

    return
  }

  collections.push({
    slug: 'users',
    admin: {
      useAsTitle: 'email',
    },
    auth: true,
    fields: [
      {
        name: 'email',
        type: 'email',
        required: true,
        unique: true,
      },
      ...tenantUserFields,
    ],
  })
}

export const resolveEcommerceConfig = (
  config: EcommerceMultiTenantConfig = {},
): EcommerceMultiTenantResolvedConfig => {
  return {
    digitalFileStorage: {
      bucket: config.digitalFileStorage?.bucket,
      provider: config.digitalFileStorage?.provider ?? 's3',
      region: config.digitalFileStorage?.region,
      signedUrlTTLSeconds: config.digitalFileStorage?.signedUrlTTLSeconds ?? 600,
      signingSecretEnv: config.digitalFileStorage?.signingSecretEnv,
    },
    disabled: config.disabled ?? false,
    enableDigitalProducts: config.enableDigitalProducts ?? true,
    enableInventoryTracking: config.enableInventoryTracking ?? true,
    enableLicenseGeneration: config.enableLicenseGeneration ?? true,
    enablePhysicalProducts: config.enablePhysicalProducts ?? true,
    enableSearchIndexing: config.enableSearchIndexing ?? false,
    enableSubscriptions: config.enableSubscriptions ?? false,
    paymentProviders: config.paymentProviders ?? [
      {
        slug: 'stripe',
        type: 'stripe',
        displayName: 'Stripe',
        supportsSubscriptions: true,
        webhookPath: '/api/webhooks/stripe',
      },
    ],
    productVariantFields: config.productVariantFields ?? [],
    seedDemoData: config.seedDemoData ?? false,
    tenantStrategy: config.tenantStrategy ?? {
      fallbackTenantSlug: 'default',
      mode: 'subdomain',
    },
    themeDefaults: {
      fontFamily: config.themeDefaults?.fontFamily ?? 'Inter, sans-serif',
      logoUrl: config.themeDefaults?.logoUrl ?? '',
      primaryColor: config.themeDefaults?.primaryColor ?? '#111827',
      secondaryColor: config.themeDefaults?.secondaryColor ?? '#2563eb',
    },
  }
}

export const ecommerceMultiTenantPlugin =
  (pluginConfig: EcommerceMultiTenantConfig = {}) =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }
    const resolvedConfig = resolveEcommerceConfig(pluginConfig)

    if (!config.collections) {
      config.collections = []
    }

    config.collections.push(Tenants)

    ensureTenantAwareUsers(config.collections)

    config.collections.push(
      createProductsCollection([...resolvedConfig.productVariantFields]),
    )

    config.collections.push(Orders)
    config.collections.push(Customers)

    if (resolvedConfig.enableDigitalProducts) {
      config.collections.push(DigitalFiles)
    }

    if (resolvedConfig.enableLicenseGeneration) {
      config.collections.push(Licenses)
    }

    if (resolvedConfig.enableSubscriptions) {
      config.collections.push(Subscriptions)
    }

    if (resolvedConfig.enableInventoryTracking) {
      config.collections.push(Inventory)
    }

    config.collections.push(createVariantsCollection([...resolvedConfig.productVariantFields]))

    config.collections.push(StoreSettings)
    config.collections.push(ThemeConfig)

    if (resolvedConfig.disabled) {
      return config
    }

    if (!config.admin) {
      config.admin = {}
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = []
    }

    if (!config.admin.components.beforeNavLinks) {
      config.admin.components.beforeNavLinks = []
    }

    config.admin.components.beforeDashboard.push(
      'plugin-package-name-placeholder/client#InventorySnapshot',
    )
    config.admin.components.beforeDashboard.push('plugin-package-name-placeholder/client#RevenueKPI')

    config.admin.components.beforeNavLinks.push(
      'plugin-package-name-placeholder/client#TenantSwitcher',
    )

    if (!config.admin.components.views) {
      config.admin.components.views = {}
    }

    config.admin.components.views['commerce-orders'] = {
      Component: 'plugin-package-name-placeholder/client#OrdersRoute',
      path: '/commerce/orders',
    }

    config.admin.components.views['commerce-fulfillment'] = {
      Component: 'plugin-package-name-placeholder/client#FulfillmentRoute',
      path: '/commerce/fulfillment',
    }

    config.admin.components.views['commerce-analytics'] = {
      Component: 'plugin-package-name-placeholder/client#AnalyticsRoute',
      path: '/commerce/analytics',
    }

    config.admin.components.views['commerce-theme-builder'] = {
      Component: 'plugin-package-name-placeholder/client#ThemeBuilderRoute',
      path: '/commerce/theme-builder',
    }

    const productsCollection = config.collections.find((col) => col.slug === 'products')
    if (productsCollection) {
      if (!productsCollection.admin) {
        productsCollection.admin = {}
      }
      if (!productsCollection.admin.components) {
        productsCollection.admin.components = {}
      }
      if (!productsCollection.admin.components.beforeList) {
        productsCollection.admin.components.beforeList = []
      }
      productsCollection.admin.components.beforeList.push(
        'plugin-package-name-placeholder/client#ProductsBeforeList',
      )
    }

    const ordersCollection = config.collections.find((col) => col.slug === 'orders')
    if (ordersCollection) {
      if (!ordersCollection.admin) {
        ordersCollection.admin = {}
      }
      if (!ordersCollection.admin.components) {
        ordersCollection.admin.components = {}
      }
      if (!ordersCollection.admin.components.beforeList) {
        ordersCollection.admin.components.beforeList = []
      }
      ordersCollection.admin.components.beforeList.push(
        'plugin-package-name-placeholder/client#OrdersBeforeList',
      )
    }

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      if (resolvedConfig.seedDemoData) {
        try {
          await seedEcommerceData(payload, {
            adminEmail: 'admin@demo.com',
            enableInventory: resolvedConfig.enableInventoryTracking,
            productCount: 5,
            seedProducts: true,
            tenantName: 'Demo Store',
            tenantSlug: 'demo-store',
            themeDefaults: resolvedConfig.themeDefaults,
          })
        } catch (error) {
          if (payload.logger && 'error' in payload.logger && typeof payload.logger.error === 'function') {
            payload.logger.error('Error seeding ecommerce data:', error)
          }
        }
      }
    }

    return config
  }
