'use client'

import { Button, useAuth, useConfig } from '@payloadcms/ui'
import React, { useCallback, useEffect, useState } from 'react'

import styles from './TenantSwitcher.module.css'

interface Tenant {
  id: string
  name: string
  slug: string
}

const TENANT_STORAGE_KEY = 'payload_current_tenant'

export const TenantSwitcher = () => {
  const { config } = useConfig()
  const { user } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [currentTenant, setCurrentTenant] = useState<null | string>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch(`${config.serverURL}${config.routes.api}/tenants?limit=100`)
        const result = await response.json()
        setTenants(result.docs || [])

        const storedTenant = localStorage.getItem(TENANT_STORAGE_KEY)
        if (storedTenant) {
          setCurrentTenant(storedTenant)
        } else if (user?.tenantId) {
          const tenantId =
            typeof user.tenantId === 'string' ? user.tenantId : user.tenantId.id || ''
          setCurrentTenant(tenantId)
          localStorage.setItem(TENANT_STORAGE_KEY, tenantId)
        } else if (result.docs?.length > 0) {
          const firstTenant = result.docs[0].id
          setCurrentTenant(firstTenant)
          localStorage.setItem(TENANT_STORAGE_KEY, firstTenant)
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchTenants()
  }, [config.serverURL, config.routes.api, user])

  const switchTenant = useCallback(
    (tenantId: string) => {
      setCurrentTenant(tenantId)
      localStorage.setItem(TENANT_STORAGE_KEY, tenantId)
      setIsOpen(false)

      window.dispatchEvent(
        new CustomEvent('tenant-changed', {
          detail: { tenantId },
        }),
      )

      setTimeout(() => {
        window.location.reload()
      }, 100)
    },
    [],
  )

  const clearTenant = useCallback(() => {
    localStorage.removeItem(TENANT_STORAGE_KEY)
    setCurrentTenant(null)
    setIsOpen(false)
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }, [])

  const currentTenantData = tenants.find((t) => t.id === currentTenant)

  if (loading) {
    return null
  }

  if (user?.role === 'admin') {
    return (
      <div className={styles.tenantSwitcher}>
        <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
          <span className={styles.tenantName}>
            {currentTenantData ? currentTenantData.name : 'All Tenants'}
          </span>
          <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>Switch Tenant</div>
            <div className={styles.tenantList}>
              <button className={styles.tenantItem} onClick={() => clearTenant()}>
                <span className={styles.tenantItemName}>All Tenants (Super Admin)</span>
              </button>
              {tenants.map((tenant) => (
                <button
                  className={`${styles.tenantItem} ${currentTenant === tenant.id ? styles.active : ''}`}
                  key={tenant.id}
                  onClick={() => switchTenant(tenant.id)}
                >
                  <span className={styles.tenantItemName}>{tenant.name}</span>
                  <span className={styles.tenantItemSlug}>{tenant.slug}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (currentTenantData) {
    return (
      <div className={styles.tenantSwitcher}>
        <div className={styles.tenantBadge}>
          <span className={styles.tenantName}>{currentTenantData.name}</span>
        </div>
      </div>
    )
  }

  return null
}
