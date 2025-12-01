# Admin UI Components Guide

This guide explains the admin UI components created for the multi-tenant ecommerce platform and how to use them.

## Components Overview

### Field Components

#### 1. PriceField
A custom field component for displaying and editing prices with currency formatting.

**Usage:**
```typescript
{
  name: 'price',
  type: 'number',
  admin: {
    components: {
      Field: 'plugin-package-name-placeholder/client#PriceField',
    },
  },
  required: true,
}
```

#### 2. RichAttributesEditor
A JSON field component for managing product attributes with a rich UI.

**Usage:**
```typescript
{
  name: 'attributes',
  type: 'json',
  admin: {
    components: {
      Field: 'plugin-package-name-placeholder/client#RichAttributesEditor',
    },
  },
}
```

#### 3. VariantManager
An array field component for managing product variants with bulk operations.

**Usage:**
```typescript
{
  name: 'variants',
  type: 'array',
  admin: {
    components: {
      Field: 'plugin-package-name-placeholder/client#VariantManager',
    },
  },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'sku', type: 'text' },
    { name: 'price', type: 'number' },
    { name: 'stock', type: 'number' },
  ],
}
```

#### 4. ImageSetManager
An array field component for managing product images with drag-and-drop reordering.

**Usage:**
```typescript
{
  name: 'images',
  type: 'array',
  admin: {
    components: {
      Field: 'plugin-package-name-placeholder/client#ImageSetManager',
    },
  },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'alt', type: 'text' },
  ],
}
```

### Dashboard Components

#### 1. TenantSwitcher
Injected into the admin header via `beforeNavLinks`, allowing super admins to switch between tenant contexts.

**Features:**
- Shows all available tenants
- Stores current tenant in localStorage
- Reloads admin panel when switching
- Shows tenant badge for non-admin users

**Automatically added by the ecommerce plugin.**

#### 2. InventorySnapshot
Dashboard widget showing inventory statistics.

**Features:**
- Total products count
- Low stock alerts
- Out of stock count
- Total inventory value

**Automatically added by the ecommerce plugin.**

#### 3. RevenueKPI
Dashboard widget showing revenue key performance indicators.

**Features:**
- Total revenue
- Average order value
- Orders fulfilled count
- Change percentages

**Automatically added by the ecommerce plugin.**

### Custom Routes

The plugin adds custom admin routes under the `/admin/commerce` path:

#### 1. Orders Route (`/admin/commerce/orders`)
Full-featured orders management interface with:
- Filter by status (pending, paid, fulfilled)
- Order count by status
- Quick view/edit access

#### 2. Fulfillment Route (`/admin/commerce/fulfillment`)
Fulfillment pipeline management with:
- Task status tracking (pending, packing, shipped, delivered)
- Carrier and tracking information
- Item lists per order
- Status update buttons

#### 3. Analytics Route (`/admin/commerce/analytics`)
Analytics dashboard with:
- Date range filtering (7d, 30d, 90d)
- Revenue metrics
- Top products by sales/revenue
- Recent orders list

#### 4. Theme Builder Route (`/admin/commerce/theme-builder`)
Visual theme customization with:
- Color palette editor
- Typography settings
- Layout blocks manager
- Custom CSS editor
- Per-tenant themes

### BeforeList Components

#### 1. ProductsBeforeList
Shown at the top of the products list view with:
- Quick create product button
- Import CSV functionality (placeholder)
- Help text

#### 2. OrdersBeforeList
Shown at the top of the orders list view with:
- Order status summary
- Quick links to fulfillment and analytics

**Automatically injected by the ecommerce plugin.**

## Collections

### ThemeConfig Collection

A new collection for storing per-tenant theme configurations:

**Fields:**
- `name` - Theme name
- `palette` - Color palette (primary, secondary, accent, background, text)
- `typography` - Font settings
- `layoutBlocks` - Array of layout blocks (header, hero, product grid, etc.)
- `customCSS` - Custom CSS overrides
- `isActive` - Active status flag

## Enhanced Products Collection Example

See `src/plugins/ecommerce/collections/ProductsEnhanced.ts` for an example of how to wire custom field components to collection fields:

```typescript
import { createProductsCollectionEnhanced } from './collections/ProductsEnhanced.js'

// In your config
ecommerceMultiTenantPlugin({
  // ... other config
})

// Then replace the products collection with the enhanced version
```

## Tenant Context Handling

The TenantSwitcher component stores the current tenant ID in localStorage under the key `payload_current_tenant`. All dashboard widgets and custom routes read this value to filter data appropriately.

When switching tenants:
1. The new tenant ID is stored in localStorage
2. A `tenant-changed` custom event is dispatched
3. The page reloads to apply the new context

## Admin Configuration

The ecommerce plugin automatically configures:

```typescript
config.admin.components.beforeDashboard = [
  'plugin-package-name-placeholder/client#InventorySnapshot',
  'plugin-package-name-placeholder/client#RevenueKPI',
]

config.admin.components.beforeNavLinks = [
  'plugin-package-name-placeholder/client#TenantSwitcher',
]

config.admin.routes = [
  { Component: 'plugin-package-name-placeholder/client#OrdersRoute', path: '/commerce/orders' },
  { Component: 'plugin-package-name-placeholder/client#FulfillmentRoute', path: '/commerce/fulfillment' },
  { Component: 'plugin-package-name-placeholder/client#AnalyticsRoute', path: '/commerce/analytics' },
  { Component: 'plugin-package-name-placeholder/client#ThemeBuilderRoute', path: '/commerce/theme-builder' },
]
```

## Customization

All components use CSS modules for styling, allowing for easy customization:

- `PriceField.module.css`
- `RichAttributesEditor.module.css`
- `VariantManager.module.css`
- `ImageSetManager.module.css`
- `TenantSwitcher.module.css`
- `DashboardWidgets.module.css`
- `CustomRoutes.module.css`
- `ThemeBuilder.module.css`
- `BeforeList.module.css`

CSS variables use Payload's theme system (e.g., `var(--theme-elevation-150)`).

## Testing

All components are client components (`'use client'`) and use Payload's hooks:
- `useConfig()` - Access config and server URL
- `useAuth()` - Access current user
- `useField()` - Access field value and setter
- `useFormFields()` - Access other form fields

Run the dev server to test:
```bash
pnpm dev
```

Navigate to `/admin` to see the components in action.
