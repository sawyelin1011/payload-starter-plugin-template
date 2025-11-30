'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import styles from './DashboardWidgets.module.css'

interface InventoryStats {
  lowStock: number
  outOfStock: number
  totalProducts: number
  totalValue: number
}

export const InventorySnapshot = () => {
  const { config } = useConfig()
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInventoryStats = async () => {
      try {
        const currentTenant = localStorage.getItem('payload_current_tenant')

        const productsResponse = await fetch(
          `${config.serverURL}${config.routes.api}/products?limit=1000`,
        )
        const productsData = await productsResponse.json()
        const products = productsData.docs || []

        const filteredProducts = currentTenant
          ? products.filter((p: { tenantId: { id: string } | string }) => {
              const tid = typeof p.tenantId === 'string' ? p.tenantId : p.tenantId?.id
              return tid === currentTenant
            })
          : products

        const inventoryResponse = await fetch(
          `${config.serverURL}${config.routes.api}/inventory?limit=1000`,
        )
        const inventoryData = await inventoryResponse.json()
        const inventory = inventoryData.docs || []

        const filteredInventory = currentTenant
          ? inventory.filter((inv: { tenantId: { id: string } | string }) => {
              const tid = typeof inv.tenantId === 'string' ? inv.tenantId : inv.tenantId?.id
              return tid === currentTenant
            })
          : inventory

        const lowStockThreshold = 10
        const lowStockCount = filteredInventory.filter(
          (inv: { quantity: number }) => inv.quantity > 0 && inv.quantity <= lowStockThreshold,
        ).length
        const outOfStockCount = filteredInventory.filter(
          (inv: { quantity: number }) => inv.quantity === 0,
        ).length

        const totalValue = filteredProducts.reduce(
          (sum: number, p: { price: number }) => sum + (p.price || 0),
          0,
        )

        setStats({
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          totalProducts: filteredProducts.length,
          totalValue,
        })
      } catch (error) {
        console.error('Failed to fetch inventory stats:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchInventoryStats()
  }, [config.serverURL, config.routes.api])

  if (loading) {
    return (
      <div className={styles.widget}>
        <h3>Inventory Snapshot</h3>
        <p>Loading...</p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className={styles.widget}>
      <h3>Inventory Snapshot</h3>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalProducts}</span>
          <span className={styles.statLabel}>Total Products</span>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.warning}`}>{stats.lowStock}</span>
          <span className={styles.statLabel}>Low Stock</span>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.danger}`}>{stats.outOfStock}</span>
          <span className={styles.statLabel}>Out of Stock</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue}>${stats.totalValue.toFixed(2)}</span>
          <span className={styles.statLabel}>Total Inventory Value</span>
        </div>
      </div>
    </div>
  )
}
