/**
 * Compresses an image file on the client side.
 * Resizes the image to a maximum of 1200px width or height.
 * Converts to JPEG/WebP with 0.8 quality to save size, while preserving GIF animation.
 */
export function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File> {
  return new Promise((resolve) => {
    // 1. Skip non-images or GIFs (to preserve GIF animation)
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      return resolve(file)
    }

    const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          // If we can't get canvas context, fall back to the original file
          return resolve(file)
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Select the output type.
        // If it's a PNG, we convert it to image/webp to compress size while preserving transparency.
        // Otherwise, if WebP, keep WebP. For others (like JPEG), use image/jpeg.
        let outputType = 'image/jpeg'
        let fileExt = 'jpg'

        if (file.type === 'image/png' || file.type === 'image/webp') {
          outputType = 'image/webp'
          fileExt = 'webp'
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file)
            }

            // Create a new File from the Blob
            const originalName = file.name
            const dotIndex = originalName.lastIndexOf('.')
            const baseName = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName
            
            const compressedFile = new File([blob], `${baseName}_compressed.${fileExt}`, {
              type: outputType,
              lastModified: Date.now()
            })

            // Only use the compressed file if it's actually smaller than the original
            if (compressedFile.size >= file.size) {
              return resolve(file)
            }

            resolve(compressedFile)
          },
          outputType,
          quality
        )
      }

      img.onerror = () => {
        resolve(file) // Fallback to original file on image load error
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      resolve(file) // Fallback to original file on file read error
    }

    reader.readAsDataURL(file)
  })
}
