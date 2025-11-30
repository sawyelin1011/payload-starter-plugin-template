# Ecommerce Multi-Tenant Plugin

A comprehensive multi-tenant ecommerce plugin for Payload CMS supporting both digital and physical products, subscriptions, multiple payment providers, and tenant isolation.

## Features

- ✅ **Multi-tenant architecture** - Complete tenant isolation with flexible strategies (subdomain, path, header)
- 🛍️ **Products & Variants** - Support for physical, digital, and service-based products
- 💳 **Multiple Payment Providers** - Stripe, PayPal, manual/invoice support
- 🔄 **Subscriptions** - Recurring billing support (when enabled)
- 📦 **Inventory Management** - Stock tracking, backorders, warehousing
- 📄 **Digital Products** - Secure file delivery with signed URLs and license generation
- 👥 **Customer Management** - Customer profiles, addresses, order history
- 📊 **Orders & Fulfillment** - Complete order lifecycle management
- 🎨 **Tenant Theming** - Per-tenant theme customization
- 🔒 **Access Control** - Automatic tenant-based access isolation

## Installation

```bash
pnpm add @your-org/payload-ecommerce-plugin
```

## Basic Usage

```typescript
import { buildConfig } from 'payload'
import { ecommerceMultiTenantPlugin } from '@your-org/payload-ecommerce-plugin'

export default buildConfig({
  plugins: [
    ecommerceMultiTenantPlugin({
      // Enable demo data seeding
      seedDemoData: true,
      
      // Enable subscriptions
      enableSubscriptions: true,
      
      // Configure tenant strategy
      tenantStrategy: {
        mode: 'subdomain',
        fallbackTenantSlug: 'default',
      },
      
      // Configure payment providers
      paymentProviders: [
        {
          slug: 'stripe',
          type: 'stripe',
          displayName: 'Stripe',
          webhookPath: '/api/webhooks/stripe',
          supportsSubscriptions: true,
        },
      ],
    }),
  ],
})
```

## Configuration Options

### Core Configuration

```typescript
interface EcommerceMultiTenantConfig {
  // Seeding
  seedDemoData?: boolean // Default: false
  
  // Feature Flags
  enableSubscriptions?: boolean // Default: false
  enableDigitalProducts?: boolean // Default: true
  enablePhysicalProducts?: boolean // Default: true
  enableInventoryTracking?: boolean // Default: true
  enableLicenseGeneration?: boolean // Default: true
  enableSearchIndexing?: boolean // Default: false
  
  // Variant Configuration
  productVariantFields?: Field[] // Additional fields for variants
  
  // Payment Providers
  paymentProviders?: PaymentProviderConfig[]
  
  // Tenant Strategy
  tenantStrategy?: TenantStrategyConfig
  
  // Theme Defaults
  themeDefaults?: {
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
    logoUrl?: string
  }
  
  // Digital File Storage
  digitalFileStorage?: {
    provider?: 's3' | 'r2' | 'local'
    bucket?: string
    region?: string
    signingSecretEnv?: string
    signedUrlTTLSeconds?: number // Default: 600
  }
  
  // Plugin Control
  disabled?: boolean
}
```

### Tenant Strategy Modes

#### Subdomain Strategy
```typescript
tenantStrategy: {
  mode: 'subdomain',
  primaryDomain: 'example.com', // tenant1.example.com
  fallbackTenantSlug: 'default',
}
```

#### Path Strategy
```typescript
tenantStrategy: {
  mode: 'path',
  segment: 'tenant', // example.com/tenant/tenant1
}
```

#### Header Strategy
```typescript
tenantStrategy: {
  mode: 'header',
  headerName: 'X-Tenant-ID',
}
```

### Payment Provider Configuration

```typescript
paymentProviders: [
  {
    slug: 'stripe',
    type: 'stripe',
    displayName: 'Stripe',
    webhookPath: '/api/webhooks/stripe',
    publishableKeyEnv: 'STRIPE_PUBLISHABLE_KEY',
    secretKeyEnv: 'STRIPE_SECRET_KEY',
    webhookSecretEnv: 'STRIPE_WEBHOOK_SECRET',
    supportsSubscriptions: true,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
    defaultCurrency: 'USD',
  },
  {
    slug: 'manual',
    type: 'manual',
    displayName: 'Manual Payment / Invoice',
    supportsSubscriptions: false,
  },
]
```

### Product Variant Custom Fields

Add custom fields to product variants:

```typescript
productVariantFields: [
  {
    name: 'barcode',
    type: 'text',
    label: 'Barcode',
  },
  {
    name: 'weight',
    type: 'number',
    label: 'Weight (oz)',
  },
  {
    name: 'dimensions',
    type: 'group',
    fields: [
      { name: 'length', type: 'number' },
      { name: 'width', type: 'number' },
      { name: 'height', type: 'number' },
    ],
  },
]
```

## Collections

The plugin automatically creates the following collections:

### Core Collections

1. **Tenants** - Multi-tenant organizations
2. **Products** - Product catalog (physical/digital/service)
3. **Variants** - Product variants (size, color, etc.)
4. **Orders** - Order management
5. **Customers** - Customer profiles
6. **Store Settings** - Per-tenant settings

### Optional Collections (Feature-Gated)

7. **Digital Files** - Secure file storage (when `enableDigitalProducts`)
8. **Licenses** - License key management (when `enableLicenseGeneration`)
9. **Subscriptions** - Recurring billing (when `enableSubscriptions`)
10. **Inventory** - Stock tracking (when `enableInventoryTracking`)

## Data Seeding

### Automatic Seeding

Enable automatic seeding in development:

```typescript
ecommerceMultiTenantPlugin({
  seedDemoData: true, // Creates demo tenant, products, customers
})
```

### Manual Seeding

```typescript
import { seedEcommerceData, seedTenant } from '@your-org/payload-ecommerce-plugin'

// Seed complete demo data
await seedEcommerceData(payload, {
  tenantName: 'My Store',
  tenantSlug: 'my-store',
  adminEmail: 'admin@mystore.com',
  seedProducts: true,
  productCount: 10,
})

// Seed only a tenant
const tenant = await seedTenant(payload, {
  name: 'Store Name',
  slug: 'store-slug',
  adminEmail: 'admin@store.com',
  themeDefaults: {
    primaryColor: '#ff6b6b',
    secondaryColor: '#4ecdc4',
  },
})
```

## Running the Dev Environment

```bash
# Install dependencies
pnpm install

# Set up environment
cp dev/.env.example dev/.env
# Edit dev/.env with your DATABASE_URI

# Start dev server (with auto-seeding)
pnpm dev

# Access admin panel
open http://localhost:3000/admin
```

Default credentials:
- Email: `dev@payloadcms.com`
- Password: `test`

## Access Control

All collections automatically implement tenant isolation:

```typescript
// Reads restricted to tenant
read: ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return {
    tenantId: { equals: user.tenantId },
  }
}

// Auto-assign tenant on create
hooks: {
  beforeValidate: [
    ({ data, req, operation }) => {
      if (operation === 'create' && req.user && !data.tenantId) {
        data.tenantId = req.user.tenantId
      }
      return data
    },
  ],
}
```

## Digital Product Delivery

Digital files are delivered via signed, expiring URLs:

```typescript
import { signDownloadToken } from '@your-org/payload-ecommerce-plugin/utils'

// Generate signed download URL
const token = signDownloadToken(
  fileId,
  process.env.DOWNLOAD_SECRET,
  600, // TTL in seconds
)

const downloadUrl = `https://example.com/api/download/${token}`
```

## TypeScript Types

All configuration types are fully typed:

```typescript
import type {
  EcommerceMultiTenantConfig,
  PaymentProviderConfig,
  TenantStrategyConfig,
  ThemeDefaults,
} from '@your-org/payload-ecommerce-plugin'
```

## Examples

### Disable Subscriptions

```typescript
ecommerceMultiTenantPlugin({
  enableSubscriptions: false, // Subscriptions collection not registered
})
```

### Multiple Payment Providers

```typescript
ecommerceMultiTenantPlugin({
  paymentProviders: [
    {
      slug: 'stripe',
      type: 'stripe',
      displayName: 'Credit Card',
      supportsSubscriptions: true,
    },
    {
      slug: 'paypal',
      type: 'paypal',
      displayName: 'PayPal',
      supportsSubscriptions: false,
    },
    {
      slug: 'invoice',
      type: 'manual',
      displayName: 'Pay by Invoice',
      supportsSubscriptions: false,
    },
  ],
})
```

### S3/R2 Storage for Digital Files

```typescript
ecommerceMultiTenantPlugin({
  enableDigitalProducts: true,
  digitalFileStorage: {
    provider: 'r2',
    bucket: 'my-digital-products',
    region: 'auto',
    signingSecretEnv: 'R2_SECRET',
    signedUrlTTLSeconds: 300, // 5 minutes
  },
})
```

## Testing

```bash
# Run all tests
pnpm test

# Run integration tests
pnpm test:int

# Run e2e tests
pnpm test:e2e
```

## Best Practices

1. **Always enable `seedDemoData` in development** - Provides test data immediately
2. **Use subdomain strategy for production** - Best UX and SEO
3. **Set up Stripe webhooks** - Required for payment processing
4. **Use S3/R2 for digital files** - Secure and scalable
5. **Enable inventory tracking** - Prevent overselling
6. **Configure license generation** - For software/digital content licensing

## Roadmap

- [ ] Webhooks for payment providers
- [ ] Email delivery templates
- [ ] Shipping provider integrations
- [ ] Tax calculation services
- [ ] Search indexing (Meilisearch/Algolia)
- [ ] Analytics dashboard
- [ ] Discount/coupon system
- [ ] Abandoned cart recovery

## License

MIT
