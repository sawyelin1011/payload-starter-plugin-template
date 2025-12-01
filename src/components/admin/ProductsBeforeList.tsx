'use client'

import { Button } from '@payloadcms/ui'
import React from 'react'

import styles from './BeforeList.module.css'

export const ProductsBeforeList = () => {
  return (
    <div className={styles.beforeList}>
      <div className={styles.header}>
        <h2>Product Management</h2>
        <div className={styles.actions}>
          <Button
            onClick={() => {
              window.location.href = '/admin/collections/products/create'
            }}
            size="small"
          >
            Create Product
          </Button>
          <Button
            buttonStyle="secondary"
            onClick={() => {
              alert('Bulk import coming soon!')
            }}
            size="small"
          >
            Import CSV
          </Button>
        </div>
      </div>
      <div className={styles.info}>
        <p>
          Manage your product catalog. Each product can have multiple variants with different
          prices, SKUs, and options.
        </p>
      </div>
    </div>
  )
}
