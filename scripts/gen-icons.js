/**
 * GENERATE ICONS
 * Generates the PNG icons for the PWA (192x192 and 512x512) in dermatological green/black.
 * Run: node scripts/gen-icons.js
 */
import pngjs from 'pngjs'
const { PNG } = pngjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons')
const COLORS = {
  // Dark OLED base
  black: 0x0a0a0c,
  // Neon green
  green: 0x00ff88,
  greenBright: 0x00ffaa,
  // Amber
  amber: 0xffb020,
  // Red
  red: 0xff453a,
  // White
  white: 0xffffff,
  // Gray
  gray: 0x9a9aaf,
}

function hexToRgba(hex, a) {
  return [((hex >> 16) & 0xff) / 255, ((hex >> 8) & 0xff) / 255, (hex & 0xff) / 255, a]
}

function createIcon(size, isMaskable = false) {
  const img = new PNG({ width: size, height: size, fill: true })
  const { data } = img
  const bg = hexToRgba(COLORS.black, 1)

  // Fill background with dark color
  for (let i = 0; i < data.length; i += 4) {
    data[i] = bg[0] // r
    data[i + 1] = bg[1] // g
    data[i + 2] = bg[2] // b
    data[i + 3] = bg[3] // a
  }

  // Draw rounded square (simulated with circles)
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 8

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      // Check if point is inside rounded rect
      const distX = Math.abs(x - cx) / radius
      const distY = Math.abs(y - cy) / radius
      if (distX <= 1 && distY <= 1) {
        // Inside rounded rect
        if (distX * distX + distY * distY <= 1) {
          data[idx] = 0xff // r
          data[idx + 1] = 0xff // g
          data[idx + 2] = 0xff // b
          data[idx + 3] = 0xff // a
        }
      }
    }
  }

  // Draw the "OV" logo - a stylized O with V
  const drawLogo = (img, size) => {
    const { data } = img
    const cx = size / 2
    const cy = size / 2

    // Draw outer ring (Mondrian-like O)
    const drawOutline = (x, y, w, h, color, alpha = 255) => {
      for (let i = 0; i < w; i++) {
        const idx = ((y + i) * size + x) * 4
        data[idx] = (data[idx] + (color[0] * alpha / 255)) | 0
        data[idx + 1] = (data[idx + 1] + (color[1] * alpha / 255)) | 0
        data[idx + 2] = (color[2] * alpha / 255) | 0
        data[idx + 3] = Math.min(255, (data[idx + 3] + (alpha))) | 0
      }
    }

    // V shape
    drawOutline(12, 12, 14, 60, hexToRgba(COLORS.green, 255))       // Left stroke
    drawOutline(24, 12, 18, 60, hexToRgba(COLORS.green, 255))      // Right stroke
    drawOutline(18, 20, 10, 44, hexToRgba(COLORS.greenBright, 150)) // Bottom connecting V
  }

  // For the icon, let's keep a simpler design: a shield/equilateral triangle shape with the "OV" text
  // Draw a bold triangle (mountain) shape in the center
  const drawTriangle = (topX, topY, bottomX, bottomY, color) => {
    for (let y = topY; y < bottomY; y++) {
      const t = (y - topY) / (bottomY - topY)
      const width = Math.max(1, Math.floor((bottomX - topX) * t * 0.8))
      const left = Math.floor((bottomX - topX) / 2 - width / 2)
      const right = Math.ceil((bottomX - topX) / 2 + width / 2)
      for (let x = left; x <= right; x++) {
        const idx = (y * size + x) * 4
        data[idx] = color[0]
        data[idx + 1] = color[1]
        data[idx + 2] = color[2]
        data[idx + 3] = 255
      }
    }
  }

  // Draw a simple convex shape (like a winter cap/hat)
  const margin = 8
  const drawCape = () => {
    // Top cap
    drawTriangle(40, 10, 30, 28, hexToRgba(COLORS.green, 255))
    drawTriangle(60, 10, 70, 28, hexToRgba(COLORS.green, 255))
    // Body
    drawTriangle(30, 28, 38, 60, hexToRgba(COLORS.greenBright, 255))
    drawTriangle(70, 28, 62, 60, hexToRgba(COLORS.greenBright, 255))
  }

  drawCape()

  // Draw inner V accent
  const drawV = () => {
    // Diagonal strokes from top to bottom
    for (let i = 0; i < 8; i++) {
      const t = (i + 1) / 9
      const yTop = Math.floor(10 + t * 60)
      const xLeft = Math.floor(35 + t * 5)
      const xRight = Math.floor(65 - t * 5)
      // Draw a line
      for (let x = xLeft; x <= xRight; x++) {
        const idx = (yTop * size + x) * 4
        data[idx] = COLORS.green
        data[idx + 1] = COLORS.green
        data[idx + 2] = COLORS.green
        data[idx + 3] = 200
      }
    }
  }
  drawV()

  return img
}

// Main
fs.mkdirSync(OUT_DIR, { recursive: true })

createIcon(192).pack().pipe(fs.createWriteStream(path.join(OUT_DIR, 'icon-192.png')))
createIcon(512).pack().pipe(fs.createWriteStream(path.join(OUT_DIR, 'icon-512.png')))
createIcon(180).pack().pipe(fs.createWriteStream(path.join(OUT_DIR, 'apple-touch-icon.png')))

console.log('✅ Icons generated in', OUT_DIR)
