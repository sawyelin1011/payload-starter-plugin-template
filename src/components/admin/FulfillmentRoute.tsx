'use client'

import { Button, useConfig } from '@payloadcms/ui'
import React, { useEffect, useMemo, useState } from 'react'

import styles from './CustomRoutes.module.css'

interface FulfillmentTask {
  createdAt: string
  id: string
  items: { quantity: number; sku: string }[]
  orderNumber: string
  shippingCarrier: string
  status: 'delivered' | 'packing' | 'pending' | 'shipped'
  trackingNumber?: string
}

export const FulfillmentRoute = () => {
  const { config } = useConfig()
  const [tasks, setTasks] = useState<FulfillmentTask[]>([])
  const [selectedStatus, setSelectedStatus] = useState<'all' | FulfillmentTask['status']>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFulfillmentTasks = async () => {
      try {
        const currentTenant = localStorage.getItem('payload_current_tenant')

        const response = await fetch(`${config.serverURL}${config.routes.api}/orders?limit=50`)
        const result = await response.json()
        let orders = result.docs || []

        if (currentTenant) {
          orders = orders.filter((order: { tenantId: { id: string } | string }) => {
            const tid = typeof order.tenantId === 'string' ? order.tenantId : order.tenantId?.id
            return tid === currentTenant
          })
        }

        const fulfillmentTasks: FulfillmentTask[] = orders
          .filter((order: { status: string }) => order.status === 'paid' || order.status === 'fulfilled')
          .map((order: any) => ({
            id: order.id,
            createdAt: order.createdAt,
            items: order.items?.map((item: any) => ({
              quantity: item.quantity,
              sku: item.sku,
            })) || [],
            orderNumber: order.orderNumber,
            shippingCarrier: order.shippingCarrier || 'Manual',
            status: (order.fulfillmentStatus as FulfillmentTask['status']) || 'pending',
            trackingNumber: order.trackingNumber,
          }))

        setTasks(fulfillmentTasks)
      } catch (error) {
        console.error('Failed to fetch fulfillment tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchFulfillmentTasks()
  }, [config.routes.api, config.serverURL])

  const filteredTasks = useMemo(() => {
    if (selectedStatus === 'all') {
      return tasks
    }

    return tasks.filter((task) => task.status === selectedStatus)
  }, [tasks, selectedStatus])

  const updateStatus = (taskId: string, status: FulfillmentTask['status']) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, status } : task)))
  }

  return (
    <div className={styles.routeContainer}>
      <div className={styles.header}>
        <h1>Fulfillment Pipeline</h1>
        <p className={styles.subtitle}>Track picking, packing, and shipping tasks</p>
      </div>

      <div className={styles.filterBar}>
        {['all', 'pending', 'packing', 'shipped', 'delivered'].map((status) => (
          <Button
            buttonStyle={selectedStatus === status ? 'primary' : 'secondary'}
            key={status}
            onClick={() => setSelectedStatus(status as 'all' | FulfillmentTask['status'])}
            size="small"
          >
            {status === 'all'
              ? `All (${tasks.length})`
              : `${status.charAt(0).toUpperCase() + status.slice(1)} (${tasks.filter((task) => task.status === status).length})`}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading fulfillment tasks...</div>
      ) : (
        <div className={styles.taskGrid}>
          {filteredTasks.map((task) => (
            <div className={styles.taskCard} key={task.id}>
              <div className={styles.taskHeader}>
                <div>
                  <span className={styles.taskLabel}>Order</span>
                  <span className={styles.taskValue}>{task.orderNumber}</span>
                </div>
                <span className={`${styles.statusBadge} ${styles[`status_${task.status}`]}`}>
                  {task.status}
                </span>
              </div>

              <div className={styles.taskDetails}>
                <div>
                  <span className={styles.taskLabel}>Carrier</span>
                  <span className={styles.taskValue}>{task.shippingCarrier}</span>
                </div>
                {task.trackingNumber && (
                  <div>
                    <span className={styles.taskLabel}>Tracking</span>
                    <span className={styles.taskValue}>{task.trackingNumber}</span>
                  </div>
                )}
                <div>
                  <span className={styles.taskLabel}>Created</span>
                  <span className={styles.taskValue}>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className={styles.itemsList}>
                <span className={styles.taskLabel}>Items</span>
                <ul>
                  {task.items.map((item, index) => (
                    <li key={index}>
                      {item.sku} <span className={styles.itemQty}>x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.actionBar}>
                <span className={styles.taskLabel}>Update Status</span>
                <div className={styles.actionButtons}>
                  {['pending', 'packing', 'shipped', 'delivered'].map((status) => (
                    <Button
                      buttonStyle={task.status === status ? 'primary' : 'secondary'}
                      key={status}
                      onClick={() => updateStatus(task.id, status as FulfillmentTask['status'])}
                      size="small"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className={styles.emptyState}>No fulfillment tasks</div>
          )}
        </div>
      )}
    </div>
  )
}
