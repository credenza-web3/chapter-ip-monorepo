import { notify, ToastType } from '@repo/ui-components'

export function useClipboard() {
  async function copyToClipboard(text: string, successMessage: string = 'Copied to clipboard') {
    try {
      await navigator.clipboard.writeText(text)
      notify(successMessage, ToastType.SUCCESS)
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      return false
    }
  }

  return {
    copyToClipboard,
  }
}
