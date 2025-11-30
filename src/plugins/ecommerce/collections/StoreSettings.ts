import type { CollectionConfig } from 'payload'

export const StoreSettings: CollectionConfig = {
  slug: 'store-settings',
  access: {
    create: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => {
      if (!user) {return false}
      return user.role === 'admin'
    },
    read: ({ req: { user } }) => {
      if (!user) {return false}
      if (user.role === 'admin') {return true}
      return {
        tenantId: { equals: user.tenantId },
      }
    },
    update: ({ req: { user } }) => {
      if (!user) {return false}
      if (user.role === 'admin') {return true}
      return {
        tenantId: { equals: user.tenantId },
      }
    },
  },
  admin: {
    useAsTitle: 'defaultCurrency',
  },
  fields: [
    {
      name: 'tenantId',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'defaultTenantTheme',
      type: 'group',
      fields: [
        { name: 'primaryColor', type: 'text', defaultValue: '#111827' },
        { name: 'secondaryColor', type: 'text', defaultValue: '#2563eb' },
        { name: 'fontFamily', type: 'text', defaultValue: 'Inter, sans-serif' },
        { name: 'logoUrl', type: 'text' },
      ],
    },
    {
      name: 'defaultCurrency',
      type: 'text',
      defaultValue: 'USD',
    },
    {
      name: 'defaultLocale',
      type: 'text',
      defaultValue: 'en-US',
    },
    {
      name: 'digitalDelivery',
      type: 'group',
      fields: [
        {
          name: 'signedUrlTtlSeconds',
          type: 'number',
          defaultValue: 600,
        },
        {
          name: 'storageAdapter',
          type: 'select',
          defaultValue: 's3',
          options: [
            { label: 'S3', value: 's3' },
            { label: 'R2', value: 'r2' },
            { label: 'Local', value: 'local' },
          ],
        },
        {
          name: 'bucket',
          type: 'text',
        },
        {
          name: 'region',
          type: 'text',
        },
      ],
    },
    {
      name: 'search',
      type: 'group',
      fields: [
        {
          name: 'provider',
          type: 'select',
          options: [
            { label: 'Meilisearch', value: 'meilisearch' },
            { label: 'Elasticsearch', value: 'elasticsearch' },
            { label: 'Algolia', value: 'algolia' },
          ],
        },
        {
          name: 'host',
          type: 'text',
        },
        {
          name: 'apiKey',
          type: 'text',
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user && !data.tenantId) {
          data.tenantId = req.user.tenantId
        }
        return data
      },
    ],
  },
  labels: {
    plural: 'Store Settings',
    singular: 'Store Setting',
  },
}
