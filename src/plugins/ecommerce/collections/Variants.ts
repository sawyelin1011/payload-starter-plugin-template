import type { CollectionConfig, Field, Where } from 'payload'

export const createVariantsCollection = (additionalFields: Field[] = []): CollectionConfig => ({
  slug: 'variants',
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
      if (!user) {
        return { status: { equals: 'active' } } as Where
      }
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
    defaultColumns: ['sku', 'product', 'price', 'stock', 'tenantId'],
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
      admin: {
        position: 'sidebar',
      },
      relationTo: 'products',
      required: true,
    },
    {
      name: 'sku',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'compareAtPrice',
      type: 'number',
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'allowBackorder',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'options',
      type: 'array',
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
    },
    ...additionalFields,
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) {return data}
        if (operation === 'create') {
          if (req.user && !data.tenantId) {
            data.tenantId = req.user.tenantId
          }
          if (data.price == null && data.product?.price) {
            data.price = data.product.price
          }
        }
        return data
      },
    ],
  },
})
