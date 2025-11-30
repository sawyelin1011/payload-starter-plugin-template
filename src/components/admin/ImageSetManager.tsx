'use client'

import type { ArrayFieldClientComponent } from 'payload'

import { ArrayField, Button, useField } from '@payloadcms/ui'
import React, { useCallback, useMemo } from 'react'

import styles from './ImageSetManager.module.css'

interface ImageItem {
  alt: string
  id?: string
  image: { id: string; url?: string } | string
  isPrimary?: boolean
  position?: number
}

const EMPTY_IMAGES: ImageItem[] = []

export const ImageSetManager: ArrayFieldClientComponent = (props) => {
  const { path } = props
  const { setValue, value } = useField<ImageItem[]>({ path })

  const images = useMemo(() => {
    if (Array.isArray(value)) {
      return value
    }
    return EMPTY_IMAGES
  }, [value])

  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= images.length) {
        return
      }

      const reordered = [...images]
      const [movedItem] = reordered.splice(fromIndex, 1)
      reordered.splice(toIndex, 0, movedItem)

      setValue(
        reordered.map((imageItem, index) => ({
          ...imageItem,
          position: index,
        })),
      )
    },
    [images, setValue],
  )

  const setPrimaryImage = useCallback(
    (index: number) => {
      setValue(
        images.map((imageItem, currentIndex) => ({
          ...imageItem,
          isPrimary: currentIndex === index,
        })),
      )
    },
    [images, setValue],
  )

  const updateAlt = useCallback(
    (index: number, alt: string) => {
      const updated = [...images]
      updated[index] = { ...updated[index], alt }
      setValue(updated)
    },
    [images, setValue],
  )

  const removeImage = useCallback(
    (index: number) => {
      setValue(images.filter((_, currentIndex) => currentIndex !== index))
    },
    [images, setValue],
  )

  return (
    <div className={styles.imageSetManager}>
      <div className={styles.header}>
        <h3>Product Images</h3>
        <p className={styles.helpText}>Reorder images or update alt text. The first image is primary.</p>
      </div>

      <div className={styles.imageGrid}>
        {images.map((imageItem, index) => (
          <div
            className={`${styles.imageCard} ${imageItem.isPrimary ? styles.isPrimary : ''}`}
            key={imageItem.id ?? `image-${index}`}
          >
            <div className={styles.imagePreview}>
              {typeof imageItem.image === 'object' && imageItem.image ? (
                <div className={styles.imagePlaceholder}>
                  <span>Image: {imageItem.image.id}</span>
                </div>
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span>No image</span>
                </div>
              )}
              {imageItem.isPrimary && <span className={styles.primaryBadge}>Primary</span>}
            </div>

            <div className={styles.imageInfo}>
              <input
                aria-label="Image alt text"
                className={styles.input}
                onChange={(event) => updateAlt(index, event.target.value)}
                placeholder="Alt text"
                type="text"
                value={imageItem.alt || ''}
              />

              <div className={styles.imageActions}>
                <Button
                  buttonStyle="secondary"
                  onClick={() => moveImage(index, index - 1)}
                  size="small"
                  type="button"
                >
                  Move Up
                </Button>
                <Button
                  buttonStyle="secondary"
                  onClick={() => moveImage(index, index + 1)}
                  size="small"
                  type="button"
                >
                  Move Down
                </Button>
                {!imageItem.isPrimary && (
                  <Button onClick={() => setPrimaryImage(index)} size="small" type="button">
                    Set Primary
                  </Button>
                )}
                <Button
                  buttonStyle="secondary"
                  onClick={() => removeImage(index)}
                  size="small"
                  type="button"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className={styles.emptyState}>
          <p>No images yet. Add images using the field below.</p>
        </div>
      )}

      <ArrayField {...props} />
    </div>
  )
}
