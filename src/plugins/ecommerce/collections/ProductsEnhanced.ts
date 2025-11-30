import type { CollectionConfig, Field } from 'payload'

export const createProductsCollectionEnhanced = (
  additionalFields: Field[] = [],
): CollectionConfig => ({
  slug: 'products-enhanced',
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
      if (!user) {return { status: { equals: 'published' } }}
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
    defaultColumns: ['name', 'type', 'price', 'status', 'tenantId'],
    useAsTitle: 'name',
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Physical', value: 'physical' },
        { label: 'Digital', value: 'digital' },
        { label: 'Service', value: 'service' },
      ],
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      admin: {
        components: {
          Field: 'plugin-package-name-placeholder/client#PriceField',
        },
      },
      min: 0,
      required: true,
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      admin: {
        components: {
          Field: 'plugin-package-name-placeholder/client#PriceField',
        },
        description: 'Original price (for showing discounts)',
      },
      min: 0,
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        components: {
          Field: 'plugin-package-name-placeholder/client#ImageSetManager',
        },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      required: true,
    },
    {
      name: 'sku',
      type: 'text',
      index: true,
      unique: true,
    },
    {
      name: 'trackInventory',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'variants',
      type: 'array',
      admin: {
        components: {
          Field: 'plugin-package-name-placeholder/client#VariantManager',
        },
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'sku',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
        },
        {
          name: 'stock',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'options',
          type: 'json',
          admin: {
            description: 'Variant options (e.g., {"size": "L", "color": "Red"})',
          },
        },
        ...additionalFields,
      ],
    },
    {
      name: 'attributes',
      type: 'json',
      admin: {
        components: {
          Field: 'plugin-package-name-placeholder/client#RichAttributesEditor',
        },
        description: 'Product attributes and specifications',
      },
    },
    {
      name: 'digitalFile',
      type: 'relationship',
      admin: {
        condition: (data) => data.type === 'digital',
      },
      relationTo: 'digital-files',
    },
    {
      name: 'requiresShipping',
      type: 'checkbox',
      admin: {
        condition: (data) => data.type === 'physical',
      },
      defaultValue: true,
    },
    {
      name: 'weight',
      type: 'number',
      admin: {
        condition: (data) => data.type === 'physical',
        description: 'Weight in ounces',
      },
    },
    {
      name: 'metadata',
      type: 'json',
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
})
