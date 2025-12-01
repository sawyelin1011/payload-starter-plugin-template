'use client'

import type { JSONFieldClientComponent } from 'payload'

import { Button, useField } from '@payloadcms/ui'
import React, { useCallback, useState } from 'react'

import styles from './RichAttributesEditor.module.css'

interface Attribute {
  id: string
  key: string
  label: string
  options?: string[]
  type: 'boolean' | 'number' | 'select' | 'text'
  value: boolean | number | string
}

export const RichAttributesEditor: JSONFieldClientComponent = (props) => {
  const { path } = props
  const { setValue, value } = useField<Attribute[]>({ path })

  const attributes = (value) || []
  const [editingId, setEditingId] = useState<null | string>(null)

  const addAttribute = useCallback(() => {
    const newAttribute: Attribute = {
      id: `attr_${Date.now()}`,
      type: 'text',
      key: '',
      label: '',
      value: '',
    }
    setValue([...attributes, newAttribute])
    setEditingId(newAttribute.id)
  }, [attributes, setValue])

  const updateAttribute = useCallback(
    (id: string, updates: Partial<Attribute>) => {
      const updated = attributes.map((attr) => (attr.id === id ? { ...attr, ...updates } : attr))
      setValue(updated)
    },
    [attributes, setValue],
  )

  const removeAttribute = useCallback(
    (id: string) => {
      setValue(attributes.filter((attr) => attr.id !== id))
    },
    [attributes, setValue],
  )

  return (
    <div className={styles.attributesEditor}>
      <div className={styles.header}>
        <h3>Product Attributes</h3>
        <Button buttonStyle="primary" onClick={addAttribute} size="small">
          Add Attribute
        </Button>
      </div>

      <div className={styles.attributesList}>
        {attributes.map((attr) => (
          <div className={styles.attributeCard} key={attr.id}>
            {editingId === attr.id ? (
              <div className={styles.editForm}>
                <input
                  className={styles.input}
                  onChange={(e) => updateAttribute(attr.id, { key: e.target.value })}
                  placeholder="Key (e.g., material)"
                  type="text"
                  value={attr.key}
                />
                <input
                  className={styles.input}
                  onChange={(e) => updateAttribute(attr.id, { label: e.target.value })}
                  placeholder="Label (e.g., Material)"
                  type="text"
                  value={attr.label}
                />
                <select
                  className={styles.select}
                  onChange={(e) =>
                    updateAttribute(attr.id, {
                      type: e.target.value as Attribute['type'],
                    })
                  }
                  value={attr.type}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="select">Select</option>
                </select>
                <Button onClick={() => setEditingId(null)} size="small">
                  Done
                </Button>
              </div>
            ) : (
              <div className={styles.attributeDisplay}>
                <div className={styles.attributeInfo}>
                  <strong>{attr.label || attr.key || 'Unnamed'}</strong>
                  <span className={styles.attributeType}>{attr.type}</span>
                </div>
                <div className={styles.actions}>
                  <Button onClick={() => setEditingId(attr.id)} size="small">
                    Edit
                  </Button>
                  <Button
                    buttonStyle="secondary"
                    onClick={() => removeAttribute(attr.id)}
                    size="small"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
