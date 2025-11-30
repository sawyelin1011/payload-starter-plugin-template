import type { CollectionConfig } from 'payload'

export const DigitalFiles: CollectionConfig = {
  slug: 'digital-files',
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
    defaultColumns: ['name', 'product', 'tenantId', 'createdAt'],
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
      name: 'product',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'products',
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'fileUrl',
      type: 'text',
      admin: {
        description: 'S3/R2 URL (if using cloud storage)',
        readOnly: true,
      },
    },
    {
      name: 'fileKey',
      type: 'text',
      admin: {
        description: 'S3/R2 key',
        readOnly: true,
      },
    },
    {
      name: 'version',
      type: 'text',
      defaultValue: '1.0.0',
    },
    {
      name: 'downloadLimit',
      type: 'number',
      admin: {
        description: 'Max downloads per purchase (0 = unlimited)',
      },
      defaultValue: 0,
    },
    {
      name: 'expiryDays',
      type: 'number',
      admin: {
        description: 'Days until download link expires (0 = never)',
      },
      defaultValue: 30,
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
