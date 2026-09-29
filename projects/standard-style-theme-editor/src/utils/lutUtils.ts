import { rgbToHsv, hsvToRgb, interpolateCurve } from './colorUtils'
import type { Point } from './colorUtils'

export interface ColorCorrection {
  id: string
  enabled: true
  targetColor: { r: number; g: number; b: number } // 0-1 range
  tolerance: number // 0-1 range, how broadly to match
  adjustments: {
    hueShift: number // -180 to 180 degrees
    saturationShift: number // -1 to 1
    valueShift: number // -1 to 1
    brightnessShift: number // -1 to 1
  }
}

export interface LUTParameters {
  exposure: number
  brightness: number
  contrast: number
  hue: number
  saturation: number
  value: number
  vibrancy: number
  crossProcess: number
  redCurve: Point[]
  greenCurve: Point[]
  blueCurve: Point[]
  lift: { x: number; y: number }
  liftStrength: number
  gamma: { x: number; y: number }
  gammaStrength: number
  gain: { x: number; y: number }
  gainStrength: number
  colorCorrections: ColorCorrection[]
}

// Check if a color matches a target color within tolerance using HSV distance
const matchesColorRange = (
  r: number,
  g: number,
  b: number,
  targetR: number,
  targetG: number,
  targetB: number,
  tolerance: number
): number => {
  // Convert both to HSV for perceptual matching
  const [h, s, v] = rgbToHsv(r, g, b)
  const [targetH, targetS, targetV] = rgbToHsv(targetR, targetG, targetB)

  // Calculate distance in HSV space
  // Hue is circular, so we need to handle wraparound
  let hueDiff = Math.abs(h - targetH)
  if (hueDiff > 0.5) hueDiff = 1 - hueDiff

  const satDiff = Math.abs(s - targetS)
  const valDiff = Math.abs(v - targetV)

  // Weighted distance (hue is most important for color identity)
  const distance =
    Math.sqrt(hueDiff * hueDiff * 2 + satDiff * satDiff + valDiff * valDiff) /
    Math.sqrt(4) // Normalize to 0-1

  // Return strength (1 = perfect match, 0 = outside tolerance)
  if (distance > tolerance) return 0

  // Smooth falloff at the edges
  return Math.cos((distance / tolerance) * Math.PI * 0.5)
}

// Apply color corrections to RGB values
const applyColorCorrections = (
  r: number,
  g: number,
  b: number,
  corrections: ColorCorrection[]
): [number, number, number] => {
  let red = r
  let green = g
  let blue = b

  for (const correction of corrections) {
    if (!correction.enabled) continue

    const strength = matchesColorRange(
      red,
      green,
      blue,
      correction.targetColor.r,
      correction.targetColor.g,
      correction.targetColor.b,
      correction.tolerance
    )

    if (strength > 0) {
      // Convert to HSV for adjustments
      let [h, s, v] = rgbToHsv(red, green, blue)

      // Apply hue shift
      if (correction.adjustments.hueShift !== 0) {
        h = (h + correction.adjustments.hueShift / 360) % 1
        if (h < 0) h += 1
      }

      // Apply saturation shift
      if (correction.adjustments.saturationShift !== 0) {
        s = Math.max(
          0,
          Math.min(1, s + correction.adjustments.saturationShift * strength)
        )
      }

      // Apply value shift
      if (correction.adjustments.valueShift !== 0) {
        v = Math.max(
          0,
          Math.min(1, v + correction.adjustments.valueShift * strength)
        )
      }

      // Convert back to RGB
      ;[red, green, blue] = hsvToRgb(h, s, v)

      // Apply brightness shift
      if (correction.adjustments.brightnessShift !== 0) {
        const brightnessMult =
          1 + correction.adjustments.brightnessShift * strength
        red = Math.max(0, Math.min(1, red * brightnessMult))
        green = Math.max(0, Math.min(1, green * brightnessMult))
        blue = Math.max(0, Math.min(1, blue * brightnessMult))
      }
    }
  }

  return [red, green, blue]
}

// Generate 32x32x32 3D LUT cube as a base64 PNG
export const generateLUT = (params: LUTParameters): string => {
  const {
    exposure,
    brightness,
    contrast,
    hue,
    saturation,
    value,
    vibrancy,
    crossProcess,
    redCurve,
    greenCurve,
    blueCurve,
    lift,
    liftStrength,
    gamma,
    gammaStrength,
    gain,
    gainStrength,
    colorCorrections
  } = params
  const cubeSize = 32
  const canvas = document.createElement('canvas')

  // Layout: 32 slices horizontally, each slice is 32x32
  canvas.width = cubeSize * cubeSize // 1024 pixels wide
  canvas.height = cubeSize // 32 pixels tall
  const ctx = canvas.getContext('2d')

  if (!ctx) return ''

  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const data = imageData.data

  // Generate 3D LUT cube laid out as horizontal slices
  for (let b = 0; b < cubeSize; b++) {
    // Blue channel (slices)
    for (let g = 0; g < cubeSize; g++) {
      // Green channel (rows within slice)
      for (let r = 0; r < cubeSize; r++) {
        // Red channel (columns within slice)
        // Calculate pixel position in the image
        const x = b * cubeSize + r
        const y = g
        const index = (y * canvas.width + x) * 4

        // Normalize to 0-1 range
        let red = r / (cubeSize - 1)
        let green = g / (cubeSize - 1)
        let blue = b / (cubeSize - 1)

        // Apply exposure (power curve)
        const exposureFactor = Math.pow(2, exposure)
        red *= exposureFactor
        green *= exposureFactor
        blue *= exposureFactor

        // Apply brightness (multiplicative)
        red *= brightness
        green *= brightness
        blue *= brightness

        // Apply contrast (around midpoint)
        red = (red - 0.5) * contrast + 0.5
        green = (green - 0.5) * contrast + 0.5
        blue = (blue - 0.5) * contrast + 0.5

        // Clamp before HSV operations
        red = Math.max(0, Math.min(1, red))
        green = Math.max(0, Math.min(1, green))
        blue = Math.max(0, Math.min(1, blue))

        // Convert to HSV for hue/saturation/value adjustments
        let [hsvH, hsvS, hsvV] = rgbToHsv(red, green, blue)

        // Apply hue shift (hue is in degrees -180 to 180)
        hsvH = (hsvH + hue / 360) % 1
        if (hsvH < 0) hsvH += 1

        // Apply saturation
        hsvS = hsvS * saturation

        // Apply vibrancy (boost saturation of less saturated colors)
        if (vibrancy !== 0) {
          const vibrancyBoost = (1 - hsvS) * vibrancy
          hsvS = hsvS + vibrancyBoost
        }

        // Apply value
        hsvV = hsvV * value

        // Clamp HSV values
        hsvS = Math.max(0, Math.min(1, hsvS))
        hsvV = Math.max(0, Math.min(1, hsvV))

        // Convert back to RGB
        const rgbResult = hsvToRgb(hsvH, hsvS, hsvV)
        red = rgbResult[0]
        green = rgbResult[1]
        blue = rgbResult[2]

        // Apply cross process effect (shift colors in a film-like way)
        if (crossProcess !== 0) {
          const luminance = 0.299 * red + 0.587 * green + 0.114 * blue
          // Add cyan/green to shadows, yellow/red to highlights
          red += crossProcess * (luminance - 0.5) * 0.3
          green += crossProcess * (0.3 - luminance * 0.2)
          blue += crossProcess * (0.5 - luminance) * 0.3
        }

        // Apply lift, gamma, gain (color grading wheels)
        // Convert {x, y} offsets to RGB color shifts, scaled by strength
        const liftR = lift.x * 0.3 * liftStrength
        const liftG = lift.y * 0.3 * liftStrength
        const liftB = -(lift.x + lift.y) * 0.15 * liftStrength

        const gammaR = gamma.x * 0.3 * gammaStrength
        const gammaG = gamma.y * 0.3 * gammaStrength
        const gammaB = -(gamma.x + gamma.y) * 0.15 * gammaStrength

        const gainR = gain.x * 0.3 * gainStrength
        const gainG = gain.y * 0.3 * gainStrength
        const gainB = -(gain.x + gain.y) * 0.15 * gainStrength

        // Calculate luminance for range blending
        const luminance = 0.299 * red + 0.587 * green + 0.114 * blue

        // Lift affects shadows (dark values)
        const liftWeight = Math.pow(1 - luminance, 2)
        red += liftR * liftWeight
        green += liftG * liftWeight
        blue += liftB * liftWeight

        // Gamma affects midtones (peaks at 0.5 luminance)
        const gammaWeight = Math.sin(luminance * Math.PI)
        red += gammaR * gammaWeight
        green += gammaG * gammaWeight
        blue += gammaB * gammaWeight

        // Gain affects highlights (bright values)
        const gainWeight = Math.pow(luminance, 2)
        red += gainR * gainWeight
        green += gainG * gainWeight
        blue += gainB * gainWeight

        // Clamp before curve application
        red = Math.max(0, Math.min(1, red))
        green = Math.max(0, Math.min(1, green))
        blue = Math.max(0, Math.min(1, blue))

        // Apply color curves
        red = interpolateCurve(red, redCurve)
        green = interpolateCurve(green, greenCurve)
        blue = interpolateCurve(blue, blueCurve)

        // Apply color corrections (targeted color adjustments)
        if (colorCorrections && colorCorrections.length > 0) {
          ;[red, green, blue] = applyColorCorrections(
            red,
            green,
            blue,
            colorCorrections
          )
        }

        // Final clamp
        red = Math.max(0, Math.min(1, red))
        green = Math.max(0, Math.min(1, green))
        blue = Math.max(0, Math.min(1, blue))

        // Set pixel data
        data[index] = red * 255
        data[index + 1] = green * 255
        data[index + 2] = blue * 255
        data[index + 3] = 255 // Alpha
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

// Apply LUT to an image
export const applyLUTToImage = (
  imageSrc: string,
  lutDataURL: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cubeSize = 32

    // Load the source image
    const sourceImg = new Image()
    sourceImg.crossOrigin = 'anonymous'
    sourceImg.onload = () => {
      // Load the LUT image
      const lutImg = new Image()
      lutImg.onload = () => {
        // Create canvases for processing
        const lutCanvas = document.createElement('canvas')
        lutCanvas.width = cubeSize * cubeSize
        lutCanvas.height = cubeSize
        const lutCtx = lutCanvas.getContext('2d')

        if (!lutCtx) {
          reject(new Error('Could not get LUT context'))
          return
        }

        // Set LUT canvas to match the LUT dimensions
        lutCanvas.width = cubeSize * cubeSize
        lutCanvas.height = cubeSize

        // Draw LUT to canvas and get pixel data
        lutCtx.drawImage(lutImg, 0, 0)
        const lutImageData = lutCtx.getImageData(
          0,
          0,
          lutCanvas.width,
          lutCanvas.height
        )
        const lutData = lutImageData.data

        // Create canvas for the source image
        const sourceCanvas = document.createElement('canvas')
        sourceCanvas.width = sourceImg.width
        sourceCanvas.height = sourceImg.height
        const sourceCtx = sourceCanvas.getContext('2d')

        if (!sourceCtx) {
          reject(new Error('Could not get source context'))
          return
        }

        // Draw source image and get pixel data
        sourceCtx.drawImage(sourceImg, 0, 0)
        const sourceImageData = sourceCtx.getImageData(
          0,
          0,
          sourceCanvas.width,
          sourceCanvas.height
        )
        const sourceData = sourceImageData.data

        // Apply LUT to each pixel
        for (let i = 0; i < sourceData.length; i += 4) {
          const r = sourceData[i]
          const g = sourceData[i + 1]
          const b = sourceData[i + 2]

          // Map RGB values to LUT cube coordinates
          const rIndex = Math.round((r / 255) * (cubeSize - 1))
          const gIndex = Math.round((g / 255) * (cubeSize - 1))
          const bIndex = Math.round((b / 255) * (cubeSize - 1))

          // Calculate position in LUT image (horizontal layout)
          const x = bIndex * cubeSize + rIndex
          const y = gIndex
          const lutIndex = (y * lutCanvas.width + x) * 4

          // Replace with LUT color
          sourceData[i] = lutData[lutIndex]
          sourceData[i + 1] = lutData[lutIndex + 1]
          sourceData[i + 2] = lutData[lutIndex + 2]
          // Keep original alpha
        }

        // Put the modified data back
        sourceCtx.putImageData(sourceImageData, 0, 0)
        resolve(sourceCanvas.toDataURL('image/png'))
      }

      lutImg.onerror = () => reject(new Error('Failed to load LUT image'))
      lutImg.src = lutDataURL
    }

    sourceImg.onerror = () => reject(new Error('Failed to load source image'))
    sourceImg.src = imageSrc
  })
}
