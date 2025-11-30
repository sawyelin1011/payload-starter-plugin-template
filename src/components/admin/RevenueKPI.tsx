'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import styles from './DashboardWidgets.module.css'

interface RevenueStat {
  change: number
  label: string
  value: number
}

export const RevenueKPI = () => {
  const { config } = useConfig()
  const [stats, setStats] = useState<RevenueStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        const currentTenant = localStorage.getItem('payload_current_tenant')

        const ordersResponse = await fetch(
          `${config.serverURL}${config.routes.api}/orders?limit=100`,
        )
        const ordersData = await ordersResponse.json()
        const orders = ordersData.docs || []

        const filteredOrders = currentTenant
          ? orders.filter((order: { tenantId: { id: string } | string }) => {
              const tid = typeof order.tenantId === 'string' ? order.tenantId : order.tenantId?.id
              return tid === currentTenant
            })
          : orders

        const totalRevenue = filteredOrders.reduce(
          (sum: number, order: { total: number }) => sum + (order.total || 0),
          0,
        )

        const averageOrderValue = filteredOrders.length
          ? totalRevenue / filteredOrders.length
          : 0

        const completedOrders = filteredOrders.filter(
          (order: { status: string }) => order.status === 'paid' || order.status === 'fulfilled',
        ).length

        setStats([
          { change: 12, label: 'Total Revenue', value: totalRevenue },
          { change: 4, label: 'Average Order Value', value: averageOrderValue },
          { change: 8, label: 'Orders Fulfilled', value: completedOrders },
        ])
      } catch (error) {
        console.error('Failed to fetch revenue stats:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchRevenueStats()
  }, [config.serverURL, config.routes.api])

  if (loading) {
    return (
      <div className={styles.widget}>
        <h3>Revenue KPIs</h3>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.widget}>
      <h3>Revenue KPIs</h3>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div className={styles.kpiCard} key={stat.label}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>${stat.value.toFixed(2)}</span>
            <span className={`${styles.badge} ${stat.change >= 0 ? styles.success : styles.danger}`}>
              {stat.change >= 0 ? '+' : ''}
              {stat.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
