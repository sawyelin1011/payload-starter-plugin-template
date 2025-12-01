'use client'

import { Button, useConfig } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import styles from './CustomRoutes.module.css'

interface Order {
  createdAt: string
  customer: { name: string } | string
  id: string
  orderNumber: string
  status: string
  total: number
}

export const OrdersRoute = () => {
  const { config } = useConfig()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const currentTenant = localStorage.getItem('payload_current_tenant')

        const response = await fetch(`${config.serverURL}${config.routes.api}/orders?limit=50`)
        const result = await response.json()
        let fetchedOrders = result.docs || []

        if (currentTenant) {
          fetchedOrders = fetchedOrders.filter((order: { tenantId: { id: string } | string } & Order) => {
            const tid = typeof order.tenantId === 'string' ? order.tenantId : order.tenantId?.id
            return tid === currentTenant
          })
        }

        setOrders(fetchedOrders)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchOrders()
  }, [config.serverURL, config.routes.api])

  const filteredOrders =
    filter === 'all' ? orders : orders.filter((order) => order.status === filter)

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return styles.statusFulfilled
      case 'paid':
        return styles.statusPaid
      case 'pending':
        return styles.statusPending
      default:
        return ''
    }
  }

  return (
    <div className={styles.routeContainer}>
      <div className={styles.header}>
        <h1>Orders Management</h1>
        <p className={styles.subtitle}>View and manage customer orders</p>
      </div>

      <div className={styles.filterBar}>
        <Button
          buttonStyle={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
          size="small"
        >
          All ({orders.length})
        </Button>
        <Button
          buttonStyle={filter === 'pending' ? 'primary' : 'secondary'}
          onClick={() => setFilter('pending')}
          size="small"
        >
          Pending ({orders.filter((o) => o.status === 'pending').length})
        </Button>
        <Button
          buttonStyle={filter === 'paid' ? 'primary' : 'secondary'}
          onClick={() => setFilter('paid')}
          size="small"
        >
          Paid ({orders.filter((o) => o.status === 'paid').length})
        </Button>
        <Button
          buttonStyle={filter === 'fulfilled' ? 'primary' : 'secondary'}
          onClick={() => setFilter('fulfilled')}
          size="small"
        >
          Fulfilled ({orders.filter((o) => o.status === 'fulfilled').length})
        </Button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading orders...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Status</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.orderNumber}>{order.orderNumber}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {typeof order.customer === 'string'
                      ? order.customer
                      : order.customer?.name || 'N/A'}
                  </td>
                  <td>${order.total?.toFixed(2) || '0.00'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button
                      onClick={() => {
                        window.location.href = `/admin/collections/orders/${order.id}`
                      }}
                      size="small"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className={styles.emptyState}>No orders found</div>
          )}
        </div>
      )}
    </div>
  )
}
