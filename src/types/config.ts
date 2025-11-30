import type { Field } from 'payload'

export type TenantStrategyMode = 'header' | 'path' | 'subdomain'

export type TenantStrategyConfig =
  | {
      fallbackTenantSlug?: string
      mode: 'subdomain'
      primaryDomain?: string
    }
  | {
      headerName: string
      mode: 'header'
    }
  | {
      mode: 'path'
      segment?: string
    }

export type PaymentProviderType = 'manual' | 'paypal' | 'stripe'

export interface PaymentProviderConfig {
  cancelUrl?: string
  defaultCurrency?: string
  displayName?: string
  publishableKeyEnv?: string
  secretKeyEnv?: string
  slug: string
  successUrl?: string
  supportsSubscriptions?: boolean
  type: PaymentProviderType
  webhookPath?: string
  webhookSecretEnv?: string
}

export interface ThemeDefaults {
  fontFamily?: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
}

export interface EcommerceMultiTenantConfig {
  digitalFileStorage?: {
    bucket?: string
    provider?: 'local' | 'r2' | 's3'
    region?: string
    signedUrlTTLSeconds?: number
    signingSecretEnv?: string
  }
  disabled?: boolean
  enableDigitalProducts?: boolean
  enableInventoryTracking?: boolean
  enableLicenseGeneration?: boolean
  enablePhysicalProducts?: boolean
  enableSearchIndexing?: boolean
  enableSubscriptions?: boolean
  paymentProviders?: PaymentProviderConfig[]
  productVariantFields?: Field[]
  seedDemoData?: boolean
  tenantStrategy?: TenantStrategyConfig
  themeDefaults?: ThemeDefaults
}

export interface EcommerceMultiTenantResolvedConfig {
  digitalFileStorage: {
    bucket?: string
    provider: 'local' | 'r2' | 's3'
    region?: string
    signedUrlTTLSeconds: number
    signingSecretEnv?: string
  }
  disabled: boolean
  enableDigitalProducts: boolean
  enableInventoryTracking: boolean
  enableLicenseGeneration: boolean
  enablePhysicalProducts: boolean
  enableSearchIndexing: boolean
  enableSubscriptions: boolean
  paymentProviders: PaymentProviderConfig[]
  productVariantFields: Field[]
  seedDemoData: boolean
  tenantStrategy: TenantStrategyConfig
  themeDefaults: Required<ThemeDefaults>
}
