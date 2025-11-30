'use client'

import type { ArrayFieldClientComponent } from 'payload'

import { ArrayField, Button, useField, useFormFields } from '@payloadcms/ui'
import React, { useCallback, useState } from 'react'

import styles from './VariantManager.module.css'

interface VariantOption {
  key: string
  value: string
}

interface Variant {
  id?: string
  name: string
  options: VariantOption[]
  price: number
  sku: string
  stock: number
}

export const VariantManager: ArrayFieldClientComponent = (props) => {
  const { path } = props
  const { setValue, value } = useField<Variant[]>({ path })
  const basePrice = useFormFields(([fields]) => fields?.price?.value as number)

  const variants = (value) || []
  const [selectedVariantId, setSelectedVariantId] = useState<null | string>(null)

  const generateVariants = useCallback(() => {
    const optionGroups = [
      { key: 'size', values: ['S', 'M', 'L', 'XL'] },
      { key: 'color', values: ['Black', 'White', 'Gray'] },
    ]

    const newVariants: Variant[] = []

    optionGroups[0].values.forEach((size) => {
      optionGroups[1].values.forEach((color) => {
        const variantSku = `VAR-${size}-${color}`.toUpperCase().replace(/\s+/g, '-')
        newVariants.push({
          name: `${size} - ${color}`,
          options: [
            { key: 'size', value: size },
            { key: 'color', value: color },
          ],
          price: basePrice || 0,
          sku: variantSku,
          stock: 0,
        })
      })
    })

    setValue([...variants, ...newVariants])
  }, [basePrice, variants, setValue])

  const addVariant = useCallback(() => {
    const newVariant: Variant = {
      name: 'New Variant',
      options: [],
      price: basePrice || 0,
      sku: `VAR-${Date.now()}`,
      stock: 0,
    }
    setValue([...variants, newVariant])
  }, [basePrice, variants, setValue])

  const updateVariant = useCallback(
    (index: number, updates: Partial<Variant>) => {
      const updated = [...variants]
      updated[index] = { ...updated[index], ...updates }
      setValue(updated)
    },
    [variants, setValue],
  )

  const removeVariant = useCallback(
    (index: number) => {
      setValue(variants.filter((_, i) => i !== index))
    },
    [variants, setValue],
  )

  const bulkUpdatePrice = useCallback(
    (percentage: number) => {
      const updated = variants.map((variant) => ({
        ...variant,
        price: variant.price * (1 + percentage / 100),
      }))
      setValue(updated)
    },
    [variants, setValue],
  )

  return (
    <div className={styles.variantManager}>
      <div className={styles.header}>
        <h3>Variant Manager</h3>
        <div className={styles.headerActions}>
          <Button onClick={addVariant} size="small">
            Add Variant
          </Button>
          <Button onClick={generateVariants} size="small">
            Generate Variants
          </Button>
        </div>
      </div>

      <div className={styles.bulkActions}>
        <div className={styles.bulkAction}>
          <span>Bulk Price Adjustment:</span>
          <Button onClick={() => bulkUpdatePrice(10)} size="small">
            +10%
          </Button>
          <Button onClick={() => bulkUpdatePrice(-10)} size="small">
            -10%
          </Button>
        </div>
      </div>

      <div className={styles.variantsList}>
        {variants.map((variant, index) => (
          <div className={styles.variantCard} key={index}>
            <div className={styles.variantHeader}>
              <span className={styles.variantName}>{variant.name || `Variant ${index + 1}`}</span>
              <span className={styles.variantSku}>{variant.sku}</span>
            </div>

            <div className={styles.variantFields}>
              <div className={styles.field}>
                <label>Name</label>
                <input
                  className={styles.input}
                  onChange={(e) => updateVariant(index, { name: e.target.value })}
                  type="text"
                  value={variant.name}
                />
              </div>

              <div className={styles.field}>
                <label>SKU</label>
                <input
                  className={styles.input}
                  onChange={(e) => updateVariant(index, { sku: e.target.value })}
                  type="text"
                  value={variant.sku}
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>Price</label>
                  <input
                    className={styles.input}
                    onChange={(e) =>
                      updateVariant(index, {
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    type="number"
                    value={variant.price}
                  />
                </div>

                <div className={styles.field}>
                  <label>Stock</label>
                  <input
                    className={styles.input}
                    onChange={(e) =>
                      updateVariant(index, {
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    type="number"
                    value={variant.stock}
                  />
                </div>
              </div>

              <div className={styles.optionsSection}>
                <label>Options</label>
                <div className={styles.optionsList}>
                  {variant.options?.map((option, optIndex) => (
                    <div className={styles.option} key={optIndex}>
                      <span>
                        {option.key}: {option.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.variantActions}>
              <Button
                buttonStyle="secondary"
                onClick={() => removeVariant(index)}
                size="small"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {variants.length === 0 && (
        <div className={styles.emptyState}>
          <p>No variants yet. Add or generate variants to get started.</p>
        </div>
      )}

      <ArrayField {...props} />
    </div>
  )
}
