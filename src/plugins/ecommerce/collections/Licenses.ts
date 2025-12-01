import type { CollectionConfig } from 'payload'

export const Licenses: CollectionConfig = {
  slug: 'licenses',
  access: {
    create: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => {
      if (!user) {return false}
      if (user.role === 'admin') {return true}
      return {
        tenantId: { equals: user.tenantId },
      }
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
    defaultColumns: ['licenseKey', 'tenantId', 'product', 'status', 'createdAt'],
    useAsTitle: 'licenseKey',
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
      name: 'order',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'product',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'products',
      required: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'licenseKey',
      type: 'text',
      admin: {
        readOnly: true,
      },
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Revoked', value: 'revoked' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      name: 'activationCount',
      type: 'number',
      admin: {
        readOnly: true,
      },
      defaultValue: 0,
    },
    {
      name: 'activationLimit',
      type: 'number',
      defaultValue: 1,
    },
    {
      name: 'expiresAt',
      type: 'date',
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) {return data}
        if (operation === 'create') {
          if (req.user && !data.tenantId) {
            data.tenantId = req.user.tenantId
          }
          if (!data.licenseKey) {
            data.licenseKey = `LIC-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
          }
        }
        return data
      },
    ],
  },
}
