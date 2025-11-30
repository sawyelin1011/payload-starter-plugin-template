import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: ({ req: { user } }) => {
      if (!user) {return false}
      return user.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      if (!user) {return false}
      return user.role === 'admin'
    },
    read: () => true,
    update: ({ req: { user } }) => {
      if (!user) {return false}
      return user.role === 'admin'
    },
  },
  admin: {
    defaultColumns: ['name', 'slug', 'status', 'createdAt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Tenant Name',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Unique identifier for the tenant (used in subdomain/path)',
      },
      label: 'Slug',
      required: true,
      unique: true,
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Optional custom domain for this tenant',
      },
      label: 'Custom Domain',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Trial', value: 'trial' },
        { label: 'Suspended', value: 'suspended' },
      ],
      required: true,
    },
    {
      name: 'admins',
      type: 'relationship',
      hasMany: true,
      label: 'Tenant Admins',
      relationTo: 'users',
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'allowedPaymentProviders',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Stripe', value: 'stripe' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Square', value: 'square' },
          ],
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'USD',
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'GBP', value: 'GBP' },
          ],
        },
        {
          name: 'timezone',
          type: 'text',
          defaultValue: 'America/New_York',
        },
      ],
    },
    {
      name: 'theme',
      type: 'group',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#000000',
        },
        {
          name: 'secondaryColor',
          type: 'text',
          defaultValue: '#ffffff',
        },
        {
          name: 'fontFamily',
          type: 'text',
          defaultValue: 'Inter, sans-serif',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'stripeConfig',
      type: 'group',
      fields: [
        {
          name: 'publishableKey',
          type: 'text',
        },
        {
          name: 'secretKey',
          type: 'text',
          admin: {
            description: 'Store securely - consider using environment variables',
          },
        },
        {
          name: 'webhookSecret',
          type: 'text',
        },
      ],
    },
  ],
}
