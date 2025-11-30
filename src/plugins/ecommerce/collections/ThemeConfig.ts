import type { CollectionConfig } from 'payload'

export const ThemeConfig: CollectionConfig = {
  slug: 'theme-config',
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
      name: 'palette',
      type: 'group',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#111827',
          required: true,
        },
        {
          name: 'secondaryColor',
          type: 'text',
          defaultValue: '#2563eb',
          required: true,
        },
        {
          name: 'accentColor',
          type: 'text',
          defaultValue: '#10b981',
        },
        {
          name: 'backgroundColor',
          type: 'text',
          defaultValue: '#ffffff',
        },
        {
          name: 'textColor',
          type: 'text',
          defaultValue: '#1f2937',
        },
      ],
    },
    {
      name: 'typography',
      type: 'group',
      fields: [
        {
          name: 'fontFamily',
          type: 'text',
          defaultValue: 'Inter, sans-serif',
        },
        {
          name: 'headingFontFamily',
          type: 'text',
          defaultValue: 'Inter, sans-serif',
        },
        {
          name: 'baseFontSize',
          type: 'number',
          defaultValue: 16,
        },
      ],
    },
    {
      name: 'layoutBlocks',
      type: 'array',
      fields: [
        {
          name: 'blockType',
          type: 'select',
          options: [
            { label: 'Header', value: 'header' },
            { label: 'Hero', value: 'hero' },
            { label: 'Product Grid', value: 'productGrid' },
            { label: 'Feature Section', value: 'featureSection' },
            { label: 'CTA Banner', value: 'ctaBanner' },
            { label: 'Footer', value: 'footer' },
          ],
          required: true,
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'position',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'settings',
          type: 'json',
        },
      ],
    },
    {
      name: 'customCSS',
      type: 'textarea',
      admin: {
        description: 'Custom CSS overrides',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: false,
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
}
