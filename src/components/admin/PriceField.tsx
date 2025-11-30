'use client'

import type { NumberFieldClientComponent } from 'payload'

import { NumberField, useField } from '@payloadcms/ui'
import React, { useCallback } from 'react'

import styles from './PriceField.module.css'

export const PriceField: NumberFieldClientComponent = (props) => {
  const { path } = props
  const { setValue, value } = useField<number>({ path })

  const handleChange = useCallback(
    (newValue: number) => {
      setValue(newValue)
    },
    [setValue],
  )

  const displayValue = typeof value === 'number' ? value : 0

  return (
    <div className={styles.priceFieldWrapper}>
      <div className={styles.priceFieldInput}>
        <span className={styles.currencySymbol}>$</span>
        <div className={styles.priceDisplay}>
          {displayValue.toFixed(2)}
        </div>
      </div>
      <NumberField {...props} onChange={handleChange} />
    </div>
  )
}
