import crypto from 'node:crypto'

export interface SignedUrlPayload {
  expiresAt: number
  fileId: string
}

export const signDownloadToken = (
  fileId: string,
  secret: string,
  ttlSeconds: number,
): string => {
  const expiresAt = Date.now() + ttlSeconds * 1000
  const payload = `${fileId}:${expiresAt}`
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url')
  return token
}

export const verifyDownloadToken = (
  token: string,
  secret: string,
): null | SignedUrlPayload => {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const [fileId, expiresAtRaw, signature] = decoded.split(':')

    if (!fileId || !expiresAtRaw || !signature) {
      return null
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${fileId}:${expiresAtRaw}`)
      .digest('hex')

    if (expectedSignature !== signature) {
      return null
    }

    const expiresAt = Number(expiresAtRaw)

    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      return null
    }

    return {
      expiresAt,
      fileId,
    }
  } catch {
    return null
  }
}
