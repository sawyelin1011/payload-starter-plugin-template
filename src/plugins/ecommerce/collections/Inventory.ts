import type { CollectionConfig } from 'payload'

export const Inventory: CollectionConfig = {
  slug: 'inventory',
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
    defaultColumns: ['sku', 'stock', 'tenantId', 'updatedAt'],
    useAsTitle: 'sku',
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
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'variant',
      type: 'relationship',
      relationTo: 'variants',
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
      required: true,
    },
    {
      name: 'backorder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'incoming',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'threshold',
      type: 'number',
      defaultValue: 5,
    },
    {
      name: 'warehouse',
      type: 'text',
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
        if (operation === 'create' && req.user && !data.tenantId) {
          data.tenantId = req.user.tenantId
        }
        return data
      },
    ],
  },
}
