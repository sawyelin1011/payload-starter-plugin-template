import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Helper to create type-safe beforeValidate hooks that auto-assign tenantId
 */
export const createTenantAssignHook = (): CollectionBeforeValidateHook => {
  return ({ data, operation, req }) => {
    if (data && operation === 'create' && req.user && !data.tenantId) {
      data.tenantId = req.user.tenantId
    }
    return data
  }
}

/**
 * Helper for Orders beforeValidate hook
 */
export const createOrderHook = (): CollectionBeforeValidateHook => {
  return ({ data, operation, req }) => {
    if (!data) {return data}

    if (operation === 'create') {
      if (req.user && !data.tenantId) {
        data.tenantId = req.user.tenantId
      }
      if (!data.orderNumber) {
        data.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    }
    return data
  }
}

/**
 * Helper for Licenses beforeValidate hook
 */
export const createLicenseHook = (): CollectionBeforeValidateHook => {
  return ({ data, operation, req }) => {
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
  }
}

/**
 * Helper for Variants beforeValidate hook
 */
export const createVariantHook = (): CollectionBeforeValidateHook => {
  return ({ data, operation, req }) => {
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
  }
}
