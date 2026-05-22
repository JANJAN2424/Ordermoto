const supportedProductImageMimePattern = /^image\/(?:png|jpeg|webp|gif|avif)$/i

export const maxProductImageBytes = 4 * 1024 * 1024
export const acceptedProductImageMimeTypes = 'image/png,image/jpeg,image/webp,image/gif,image/avif'
export const supportedProductImageLabel = 'JPG, PNG, WebP, GIF, or AVIF'

export const formatProductImageSizeLimit = () =>
  `${Math.round(maxProductImageBytes / (1024 * 1024))} MB`

export const readProductImageFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    if (!supportedProductImageMimePattern.test(file.type)) {
      reject(new Error(`Choose a ${supportedProductImageLabel} image.`))
      return
    }

    if (file.size > maxProductImageBytes) {
      reject(new Error(`Choose an image smaller than ${formatProductImageSizeLimit()}.`))
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result) {
        resolve(reader.result)
        return
      }

      reject(new Error('Unable to read the selected image.'))
    }

    reader.onerror = () => {
      reject(new Error('Unable to read the selected image.'))
    }

    reader.readAsDataURL(file)
  })
