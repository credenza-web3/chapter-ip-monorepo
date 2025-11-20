function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  randomValues.forEach((value) => {
    result += charset[value % charset.length]
  })
  return result
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return hash
}

function base64urlencode(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export { generateRandomString, sha256, base64urlencode }
