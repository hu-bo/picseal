const SOS = 0xFFDA
const APP1 = 0xFFE1
const EXIF = 0x45786966
const JPEG = 0xFFD8 // JPEG start marker

export function extractExifRaw(raw: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = async (e) => {
      const buffer = e.target?.result
      if (!buffer)
        return reject(new Error('Failed to read raw image data'))

      const view = new DataView(buffer)
      let offset = 0
      if (view.getUint16(offset) !== JPEG)
        return reject(new Error('not a valid jpeg'))
      offset += 2

      while (offset < view.byteLength) {
        const marker = view.getUint16(offset)
        if (marker === SOS)
          break
        const size = view.getUint16(offset + 2)
        if (marker === APP1 && view.getUint32(offset + 4) === EXIF)
          return resolve(raw.slice(offset, offset + 2 + size))
        offset += 2 + size
      }
      return resolve(new Blob())
    }
    reader.readAsArrayBuffer(raw)
  })
}

export function embedExifRaw(exifRaw: Blob, targetImg: Blob): Blob {
  return new Blob([targetImg.slice(0, 2), exifRaw, targetImg.slice(2)], {
    type: 'image/jpeg',
  })
}
