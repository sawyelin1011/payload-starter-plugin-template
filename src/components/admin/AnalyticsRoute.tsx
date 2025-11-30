'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import styles from './CustomRoutes.module.css'

interface AnalyticsData {
  averageOrderValue: number
  conversionRate: number
  recentOrders: { date: string; orderNumber: string; total: number }[]
  topProducts: { name: string; revenue: number; sales: number }[]
  totalOrders: number
  totalRevenue: number
}

export const AnalyticsRoute = () => {
  const { config } = useConfig()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const currentTenant = localStorage.getItem('payload_current_tenant')

        const ordersResponse = await fetch(
          `${config.serverURL}${config.routes.api}/orders?limit=200`,
        )
        const ordersData = await ordersResponse.json()
        let orders = ordersData.docs || []

        if (currentTenant) {
          orders = orders.filter((order: { tenantId: { id: string } | string }) => {
            const tid = typeof order.tenantId === 'string' ? order.tenantId : order.tenantId?.id
            return tid === currentTenant
          })
        }

        const cutoffDate = new Date()
        if (dateRange === '7d') {
          cutoffDate.setDate(cutoffDate.getDate() - 7)
        } else if (dateRange === '30d') {
          cutoffDate.setDate(cutoffDate.getDate() - 30)
        } else {
          cutoffDate.setDate(cutoffDate.getDate() - 90)
        }

        const filteredOrders = orders.filter(
          (order: { createdAt: string }) => new Date(order.createdAt) >= cutoffDate,
        )

        const totalRevenue = filteredOrders.reduce(
          (sum: number, order: { total: number }) => sum + (order.total || 0),
          0,
        )

        const totalOrders = filteredOrders.length
        const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0

        const productsMap = new Map<string, { name: string; revenue: number; sales: number }>()

        filteredOrders.forEach((order: { items: { price: number; product: { name: string }; quantity: number }[] }) => {
          order.items?.forEach((item) => {
            const productName = item.product?.name || 'Unknown'
            if (!productsMap.has(productName)) {
              productsMap.set(productName, { name: productName, revenue: 0, sales: 0 })
            }
            const productData = productsMap.get(productName)!
            productData.sales += item.quantity || 1
            productData.revenue += (item.price || 0) * (item.quantity || 1)
          })
        })

        const topProducts = Array.from(productsMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        const recentOrders = filteredOrders
          .sort(
            (a: { createdAt: string }, b: { createdAt: string }) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 10)
          .map((order: { createdAt: string; orderNumber: string; total: number }) => ({
            date: new Date(order.createdAt).toLocaleDateString(),
            orderNumber: order.orderNumber,
            total: order.total,
          }))

        setAnalytics({
          averageOrderValue,
          conversionRate: 3.5,
          recentOrders,
          topProducts,
          totalOrders,
          totalRevenue,
        })
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchAnalytics()
  }, [config.serverURL, config.routes.api, dateRange])

  return (
    <div className={styles.routeContainer}>
      <div className={styles.header}>
        <h1>Analytics Dashboard</h1>
        <p className={styles.subtitle}>View sales performance and insights</p>
      </div>

      <div className={styles.dateRangePicker}>
        <button
          className={dateRange === '7d' ? styles.active : ''}
          onClick={() => setDateRange('7d')}
        >
          Last 7 Days
        </button>
        <button
          className={dateRange === '30d' ? styles.active : ''}
          onClick={() => setDateRange('30d')}
        >
          Last 30 Days
        </button>
        <button
          className={dateRange === '90d' ? styles.active : ''}
          onClick={() => setDateRange('90d')}
        >
          Last 90 Days
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading analytics...</div>
      ) : (
        analytics && (
          <>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Total Revenue</span>
                <span className={styles.metricValue}>${analytics.totalRevenue.toFixed(2)}</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Total Orders</span>
                <span className={styles.metricValue}>{analytics.totalOrders}</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Avg. Order Value</span>
                <span className={styles.metricValue}>${analytics.averageOrderValue.toFixed(2)}</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Conversion Rate</span>
                <span className={styles.metricValue}>{analytics.conversionRate.toFixed(1)}%</span>
              </div>
            </div>

            <div className={styles.twoColumn}>
              <div className={styles.panel}>
                <h3>Top Products</h3>
                <div className={styles.productsList}>
                  {analytics.topProducts.map((product, index) => (
                    <div className={styles.productRow} key={index}>
                      <span className={styles.productName}>{product.name}</span>
                      <div className={styles.productStats}>
                        <span className={styles.productSales}>{product.sales} sales</span>
                        <span className={styles.productRevenue}>${product.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.panel}>
                <h3>Recent Orders</h3>
                <div className={styles.ordersList}>
                  {analytics.recentOrders.map((order, index) => (
                    <div className={styles.orderRow} key={index}>
                      <span className={styles.orderNumber}>{order.orderNumber}</span>
                      <div className={styles.orderInfo}>
                        <span className={styles.orderTotal}>${order.total.toFixed(2)}</span>
                        <span className={styles.orderDate}>{order.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  )
}
