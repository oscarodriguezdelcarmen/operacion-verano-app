#!/usr/bin/env node
/**
 * SEND PUSH NOTIFICATION
 *
 * Hourly reminder script for GitHub Actions.
 * Checks COMPLETED_DATE secret - if matches today's date, aborts silently.
 * Otherwise sends a motivational push notification using web-push.
 */

const webpush = require('web-push')
const { execSync } = require('child_process')
const process = require('process')

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  `mailto:ordc120@gmail.com`,
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

// Get COMPLETED_DATE secret
function getSecret(name) {
  try {
    const result = execSync(`npx -y @actions/github`, { encoding: 'utf-8' })
    // Use GitHub CLI if available
    const cliResult = execSync('gh secret get ' + name, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
    const lines = cliResult.split('\n')
    for (const line of lines) {
      if (line.startsWith(name + '=')) {
        return line.slice(name.length + 1)
      }
    }
  } catch (e) {
    // Try to fetch via API
  }
  return ''
}

// Get today's date in Europe/Madrid
function getMadridDate() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Get COMPLETED_DATE secret
function getCompletedDate() {
  try {
    if (process.env.COMPLETED_DATE) {
      return process.env.COMPLETED_DATE
    }
    // Try GitHub CLI
    const result = execSync('gh secret get COMPLETED_DATE', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] })
    const lines = result.split('\n')
    for (const line of lines) {
      if (line.startsWith('COMPLETED_DATE=')) {
        return line.slice('COMPLETED_DATE='.length)
      }
    }
  } catch (e) {
    // Secret not found or empty
  }
  return ''
}

// Motivational messages
const messages = [
  '⏰ ¡Hora de darle! Mete 15 flexiones y 1 serie de abs ahora mismo. El espejo de verano no perdona.',
  '💪 ¡No te duermas! 10 flexiones más y ya casi alcanzas el 100%.',
  '🏃 ¡Corre un km más! El verano te espera con sus retos.',
  '⚡ Día de impulso: 20 abdominales y 1 km rápido. No lo dudes.',
  '🔥 ¡Sigue arduo! Cada serie cuenta hacia tu medalla de oro.',
  '🚀 ¡Movimiento! 15 flexiones, 1 km y una serie extra.',
  '🌅 La mañana es buena hora: 10 flexiones y 2km. El día se gana a medida.',
  '⚖️ Toma peso: 20 abdominales, brasos y 1 km. La disciplina se construye.',
  '🎯 Tu meta es 100 flexiones + 5 km + 9 abs + 3 brazos. Una app no es suficiente.',
  '🔥 ¡Cuentanos! ¿Ya entrenaste hoy? 20 más y ya casi llegas.',
]

function sendPush(endpoint, p256dh, auth) {
  try {
    const subscription = {
      endpoint,
      keys: { p256dh, auth }
    }
    webpush.sendNotification(subscription, JSON.stringify({
      title: 'OPERACIÓN VERANO',
      body: messages[Math.floor(Math.random() * messages.length)],
      icon: 'https://oscarodriguezdelcarmen.github.io/operacion-verano-app/icons/icon-192.png',
      badge: 'https://oscarodriguezdelcarmen.github.io/operacion-verano-app/icons/icon-192.png',
    }))
    console.log('Push sent successfully')
  } catch (err) {
    console.error('Push error:', err.message)
  }
}

// Main
async function main() {
  const completedDate = getCompletedDate()
  const today = getMadridDate()

  console.log('Today:', today)
  console.log('Completed date:', completedDate)

  // If matches today, abort silently
  if (completedDate && completedDate === today) {
    console.log('✅ Olvidate: el usuario ya tiene Medalla de Oro hoy. Sin notificación.')
    return
  }

  console.log('📤 Sending hourly motivational push...')

  // Get subscription from secret
  const pushSubscription = process.env.PUSH_SUBSCRIPTION || ''
  if (!pushSubscription) {
    console.log('No PUSH_SUBSCRIPTION found. Skipping push.')
    return
  }

  try {
    const sub = JSON.parse(pushSubscription)
    sendPush(sub.endpoint, sub.keys.p256dh, sub.keys.auth)
  } catch (e) {
    console.error('Error parsing subscription:', e.message)
  }
}

main().catch(console.error)
