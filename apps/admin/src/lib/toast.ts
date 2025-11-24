import { toast } from '@zerodevx/svelte-toast'
import type { ToastType } from './common'

const themes = {
  success: {
    '--toastBackground': '#2E8B57',
    '--toastBarBackground': 'green',
  },
  warning: {
    '--toastBackground': 'orange',
    '--toastBarBackground': '#FFC300',
  },
  failure: {
    '--toastBackground': 'red',
    '--toastBarBackground': '#C70039',
  },
  info: { '--toastBackground': '#007BFF', '--toastBarBackground': '#339FFF' },
}

const notify = (message: string, type: ToastType) =>
  toast.push(message, {
    theme: themes[type],
  })

export default notify
