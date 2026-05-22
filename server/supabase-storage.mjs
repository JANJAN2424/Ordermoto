import { randomUUID } from 'node:crypto'

import { createClient } from '@supabase/supabase-js'

const defaultProductImageBucket = 'motorcycle-images'
const supportedProductImageMimePattern = /^image\/(?:png|jpe?g|webp|gif|avif)$/i
const productImageDataUrlPattern =
  /^data:(image\/(?:png|jpe?g|webp|gif|avif));base64,([a-z0-9+/=]+)$/i

const createError = (message, statusCode = 500) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const getStorageConfig = () => {
  const url = process.env.SUPABASE_URL?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || defaultProductImageBucket

  if (!url) {
    throw createError(
      'Supabase Storage is not configured. Set SUPABASE_URL before uploading motorcycle images.',
    )
  }

  if (!serviceRoleKey) {
    throw createError(
      'Supabase Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY before uploading motorcycle images.',
    )
  }

  return {
    url,
    serviceRoleKey,
    bucket,
  }
}

const createServerClient = (url, key) =>
  createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

const slugifySegment = (value, fallback = 'motorcycle') => {
  const slug = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

const getImageExtension = (mimeType) => {
  switch (mimeType.toLowerCase()) {
    case 'image/png':
      return 'png'
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'image/avif':
      return 'avif'
    default:
      return 'bin'
  }
}

let bucketReadyPromise = null

const ensureProductImageBucket = async () => {
  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      const { url, serviceRoleKey, bucket } = getStorageConfig()
      const supabase = createServerClient(url, serviceRoleKey)
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()

      if (listError) {
        throw createError(
          `Unable to inspect Supabase Storage buckets: ${listError.message}`,
          listError.statusCode ?? 500,
        )
      }

      const existingBucket = buckets?.find((entry) => entry.id === bucket || entry.name === bucket)

      if (existingBucket) {
        return bucket
      }

      const { error: createErrorResult } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: '4MB',
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      })

      if (createErrorResult) {
        throw createError(
          `Unable to create the Supabase Storage bucket "${bucket}": ${createErrorResult.message}`,
          createErrorResult.statusCode ?? 500,
        )
      }

      return bucket
    })().catch((error) => {
      bucketReadyPromise = null
      throw error
    })
  }

  return bucketReadyPromise
}

const parseProductImageDataUrl = (value) => {
  const match = value.match(productImageDataUrlPattern)

  if (!match) {
    throw createError(
      'Upload a valid motorcycle image in JPG, PNG, GIF, WebP, or AVIF format.',
      400,
    )
  }

  const [, rawMimeType, base64Content] = match
  const mimeType = rawMimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : rawMimeType.toLowerCase()

  if (!supportedProductImageMimePattern.test(mimeType)) {
    throw createError(
      'Upload a valid motorcycle image in JPG, PNG, GIF, WebP, or AVIF format.',
      400,
    )
  }

  return {
    mimeType,
    buffer: Buffer.from(base64Content, 'base64'),
    extension: getImageExtension(mimeType),
  }
}

const getStoragePathFromPublicUrl = (publicUrl) => {
  if (!publicUrl) {
    return ''
  }

  const { url, bucket } = getStorageConfig()

  try {
    const storageUrl = new URL(publicUrl)
    const projectUrl = new URL(url)
    const expectedPrefix = `/storage/v1/object/public/${bucket}/`

    if (storageUrl.origin !== projectUrl.origin || !storageUrl.pathname.startsWith(expectedPrefix)) {
      return ''
    }

    return decodeURIComponent(storageUrl.pathname.slice(expectedPrefix.length))
  } catch {
    return ''
  }
}

export const isProductImageDataUrl = (value) => productImageDataUrlPattern.test(value)

export const isProductImagePublicUrl = (value) => {
  try {
    return /^https?:$/i.test(new URL(value).protocol)
  } catch {
    return false
  }
}

export const uploadProductImageToStorage = async ({ imageDataUrl, sku, productName }) => {
  await ensureProductImageBucket()

  const { url, serviceRoleKey, bucket } = getStorageConfig()
  const supabase = createServerClient(url, serviceRoleKey)
  const { mimeType, buffer, extension } = parseProductImageDataUrl(imageDataUrl)
  const storagePath = `${slugifySegment(sku, slugifySegment(productName))}/${Date.now()}-${randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType: mimeType,
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) {
    throw createError(
      `Unable to upload the motorcycle image to Supabase Storage: ${uploadError.message}`,
      uploadError.statusCode ?? 500,
    )
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath)

  if (!data?.publicUrl) {
    await supabase.storage.from(bucket).remove([storagePath]).catch(() => {})
    throw createError('Supabase Storage did not return a public URL for the uploaded motorcycle image.')
  }

  return {
    publicUrl: data.publicUrl,
    storagePath,
  }
}

export const deleteProductImageFromStorage = async (publicUrl) => {
  const storagePath = getStoragePathFromPublicUrl(publicUrl)

  if (!storagePath) {
    return false
  }

  await ensureProductImageBucket()

  const { url, serviceRoleKey, bucket } = getStorageConfig()
  const supabase = createServerClient(url, serviceRoleKey)
  const { error } = await supabase.storage.from(bucket).remove([storagePath])

  if (error) {
    throw createError(
      `Unable to remove the previous motorcycle image from Supabase Storage: ${error.message}`,
      error.statusCode ?? 500,
    )
  }

  return true
}
