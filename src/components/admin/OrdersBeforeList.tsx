'use client'

import { Button, useConfig } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import styles from './BeforeList.module.css'

export const OrdersBeforeList = () => {
  const { config } = useConfig()
  const [stats, setStats] = useState({ fulfilled: 0, paid: 0, pending: 0 })

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const currentTenant = localStorage.getItem('payload_current_tenant')
        const response = await fetch(`${config.serverURL}${config.routes.api}/orders?limit=200`)
        const result = await response.json()
        let orders = result.docs || []

        if (currentTenant) {
          orders = orders.filter((order: { tenantId: { id: string } | string }) => {
            const tid = typeof order.tenantId === 'string' ? order.tenantId : order.tenantId?.id
            return tid === currentTenant
          })
        }

        const pending = orders.filter((o: { status: string }) => o.status === 'pending').length
        const paid = orders.filter((o: { status: string }) => o.status === 'paid').length
        const fulfilled = orders.filter((o: { status: string }) => o.status === 'fulfilled').length

        setStats({ fulfilled, paid, pending })
      } catch (error) {
        console.error('Failed to fetch order stats:', error)
      }
    }

    void fetchOrderStats()
  }, [config.serverURL, config.routes.api])

  return (
    <div className={styles.beforeList}>
      <div className={styles.header}>
        <h2>Orders Overview</h2>
        <div className={styles.actions}>
          <Button
            onClick={() => {
              window.location.href = '/admin/commerce/fulfillment'
            }}
            size="small"
          >
            Fulfillment
          </Button>
          <Button
            buttonStyle="secondary"
            onClick={() => {
              window.location.href = '/admin/commerce/analytics'
            }}
            size="small"
          >
            Analytics
          </Button>
        </div>
      </div>
      <div className={styles.info}>
        <p>
          <strong>Pending:</strong> {stats.pending} | <strong>Paid:</strong> {stats.paid} |{' '}
          <strong>Fulfilled:</strong> {stats.fulfilled}
        </p>
      </div>
    </div>
  )
}
