'use client'

import { Button, useConfig } from '@payloadcms/ui'
import React, { useCallback, useEffect, useState } from 'react'

import styles from './ThemeBuilder.module.css'

interface ThemeConfig {
  customCSS?: string
  id?: string
  isActive: boolean
  layoutBlocks: {
    blockType: string
    enabled: boolean
    position: number
    settings?: Record<string, unknown>
  }[]
  name: string
  palette: {
    accentColor: string
    backgroundColor: string
    primaryColor: string
    secondaryColor: string
    textColor: string
  }
  typography: {
    baseFontSize: number
    fontFamily: string
    headingFontFamily: string
  }
}

const defaultTheme: ThemeConfig = {
  name: 'New Theme',
  isActive: false,
  layoutBlocks: [],
  palette: {
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    primaryColor: '#111827',
    secondaryColor: '#2563eb',
    textColor: '#1f2937',
  },
  typography: {
    baseFontSize: 16,
    fontFamily: 'Inter, sans-serif',
    headingFontFamily: 'Inter, sans-serif',
  },
}

export const ThemeBuilderRoute = () => {
  const { config } = useConfig()
  const [themes, setThemes] = useState<ThemeConfig[]>([])
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultTheme)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const currentTenant = localStorage.getItem('payload_current_tenant')
        const response = await fetch(`${config.serverURL}${config.routes.api}/theme-config?limit=50`)
        const result = await response.json()
        let fetchedThemes = result.docs || []

        if (currentTenant) {
          fetchedThemes = fetchedThemes.filter((theme: { tenantId: { id: string } | string }) => {
            const tid = typeof theme.tenantId === 'string' ? theme.tenantId : theme.tenantId?.id
            return tid === currentTenant
          })
        }

        setThemes(fetchedThemes)

        if (fetchedThemes.length > 0) {
          setCurrentTheme(fetchedThemes[0])
        }
      } catch (error) {
        console.error('Failed to fetch themes:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchThemes()
  }, [config.serverURL, config.routes.api])

  const updatePalette = useCallback((key: string, value: string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      palette: { ...prev.palette, [key]: value },
    }))
  }, [])

  const updateTypography = useCallback((key: string, value: number | string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      typography: { ...prev.typography, [key]: value },
    }))
  }, [])

  const addLayoutBlock = useCallback(
    (blockType: string) => {
      setCurrentTheme((prev) => ({
        ...prev,
        layoutBlocks: [
          ...prev.layoutBlocks,
          {
            blockType,
            enabled: true,
            position: prev.layoutBlocks.length,
            settings: {},
          },
        ],
      }))
    },
    [],
  )

  const removeLayoutBlock = useCallback((index: number) => {
    setCurrentTheme((prev) => ({
      ...prev,
      layoutBlocks: prev.layoutBlocks.filter((_, i) => i !== index),
    }))
  }, [])

  const saveTheme = useCallback(async () => {
    setSaving(true)
    try {
      const currentTenant = localStorage.getItem('payload_current_tenant')
      const payload = {
        ...currentTheme,
        tenantId: currentTenant,
      }

      const method = currentTheme.id ? 'PATCH' : 'POST'
      const url = currentTheme.id
        ? `${config.serverURL}${config.routes.api}/theme-config/${currentTheme.id}`
        : `${config.serverURL}${config.routes.api}/theme-config`

      const response = await fetch(url, {
        body: JSON.stringify(payload),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method,
      })

      if (response.ok) {
        const saved = await response.json()
        setCurrentTheme(saved.doc)
        alert('Theme saved successfully!')
      } else {
        alert('Failed to save theme')
      }
    } catch (error) {
      console.error('Failed to save theme:', error)
      alert('Failed to save theme')
    } finally {
      setSaving(false)
    }
  }, [currentTheme, config.serverURL, config.routes.api])

  if (loading) {
    return <div className={styles.loading}>Loading themes...</div>
  }

  return (
    <div className={styles.themeBuilder}>
      <div className={styles.header}>
        <h1>Theme Builder</h1>
        <p className={styles.subtitle}>Customize your storefront appearance</p>
      </div>

      <div className={styles.themeSelector}>
        <label>Active Theme:</label>
        <select
          onChange={(e) => {
            const selected = themes.find((t) => t.id === e.target.value)
            if (selected) {
              setCurrentTheme(selected)
            }
          }}
          value={currentTheme.id || ''}
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name} {theme.isActive ? '(Active)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.sections}>
        <div className={styles.section}>
          <h2>Theme Name</h2>
          <input
            className={styles.input}
            onChange={(e) =>
              setCurrentTheme({
                ...currentTheme,
                name: e.target.value,
              })
            }
            placeholder="Theme name"
            type="text"
            value={currentTheme.name}
          />
        </div>

        <div className={styles.section}>
          <h2>Color Palette</h2>
          <div className={styles.colorGrid}>
            {Object.entries(currentTheme.palette).map(([key, value]) => (
              <div className={styles.colorField} key={key}>
                <label>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                <div className={styles.colorInput}>
                  <input
                    onChange={(e) => updatePalette(key, e.target.value)}
                    type="color"
                    value={value}
                  />
                  <input
                    className={styles.input}
                    onChange={(e) => updatePalette(key, e.target.value)}
                    type="text"
                    value={value}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Typography</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label>Font Family</label>
              <input
                className={styles.input}
                onChange={(e) => updateTypography('fontFamily', e.target.value)}
                type="text"
                value={currentTheme.typography.fontFamily}
              />
            </div>
            <div className={styles.field}>
              <label>Heading Font</label>
              <input
                className={styles.input}
                onChange={(e) => updateTypography('headingFontFamily', e.target.value)}
                type="text"
                value={currentTheme.typography.headingFontFamily}
              />
            </div>
            <div className={styles.field}>
              <label>Base Font Size</label>
              <input
                className={styles.input}
                onChange={(e) => updateTypography('baseFontSize', parseInt(e.target.value))}
                type="number"
                value={currentTheme.typography.baseFontSize}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Layout Blocks</h2>
          <div className={styles.blocksList}>
            {currentTheme.layoutBlocks.map((block, index) => (
              <div className={styles.blockCard} key={index}>
                <span className={styles.blockType}>{block.blockType}</span>
                <span className={styles.blockStatus}>{block.enabled ? 'Enabled' : 'Disabled'}</span>
                <Button onClick={() => removeLayoutBlock(index)} size="small">
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div className={styles.addBlock}>
            <select
              className={styles.select}
              onChange={(e) => {
                if (e.target.value) {
                  addLayoutBlock(e.target.value)
                  e.target.value = ''
                }
              }}
            >
              <option value="">Add layout block...</option>
              <option value="header">Header</option>
              <option value="hero">Hero</option>
              <option value="productGrid">Product Grid</option>
              <option value="featureSection">Feature Section</option>
              <option value="ctaBanner">CTA Banner</option>
              <option value="footer">Footer</option>
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Custom CSS</h2>
          <textarea
            className={styles.textarea}
            onChange={(e) =>
              setCurrentTheme({
                ...currentTheme,
                customCSS: e.target.value,
              })
            }
            placeholder="Enter custom CSS..."
            rows={8}
            value={currentTheme.customCSS || ''}
          />
        </div>

        <div className={styles.actions}>
          <Button buttonStyle="primary" disabled={saving} onClick={saveTheme}>
            {saving ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      </div>
    </div>
  )
}
