import { toast } from '@zerodevx/svelte-toast'

export enum ToastType {
  FAIL = 'failure',
  SUCCESS = 'success',
  WARN = 'warning',
  INFO = 'info',
}

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

export const notify = (message: string, type: ToastType) =>
  toast.push(message, {
    theme: themes[type],
  })
