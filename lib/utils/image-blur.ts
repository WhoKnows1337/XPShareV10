import { getPlaiceholder } from 'plaiceholder'

export async function getImageBlurData(src: string) {
  try {
    // Handle both local and remote images
    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    )

    const {
      metadata,
      base64,
      ...rest
    } = await getPlaiceholder(buffer, { size: 10 })

    return {
      blurDataURL: base64,
      ...metadata,
    }
  } catch (error) {
    console.error('Error generating blur placeholder:', error)
    return {
      blurDataURL: '',
      width: 0,
      height: 0,
    }
  }
}

export async function getImageBlurDataURL(src: string): Promise<string> {
  try {
    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    )

    const { base64 } = await getPlaiceholder(buffer, { size: 10 })
    return base64
  } catch (error) {
    console.error('Error generating blur placeholder:', error)
    return ''
  }
}
