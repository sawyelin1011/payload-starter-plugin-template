import type { CollectionConfig } from 'payload'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
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
    defaultColumns: ['subscriptionId', 'customer', 'status', 'tenantId', 'createdAt'],
    useAsTitle: 'subscriptionId',
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
      name: 'subscriptionId',
      type: 'text',
      admin: {
        description: 'Payment provider subscription ID',
      },
      required: true,
      unique: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Trialing', value: 'trialing' },
        { label: 'Past Due', value: 'past_due' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Paused', value: 'paused' },
      ],
    },
    {
      name: 'plan',
      type: 'group',
      fields: [
        {
          name: 'interval',
          type: 'select',
          options: [
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
            { label: 'Year', value: 'year' },
          ],
          required: true,
        },
        {
          name: 'intervalCount',
          type: 'number',
          defaultValue: 1,
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
        },
        {
          name: 'currency',
          type: 'text',
          defaultValue: 'USD',
        },
      ],
    },
    {
      name: 'currentPeriodStart',
      type: 'date',
    },
    {
      name: 'currentPeriodEnd',
      type: 'date',
    },
    {
      name: 'cancelAtPeriodEnd',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'trialStart',
      type: 'date',
    },
    {
      name: 'trialEnd',
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
        if (operation === 'create' && req.user && !data.tenantId) {
          data.tenantId = req.user.tenantId
        }
        return data
      },
    ],
  },
}
