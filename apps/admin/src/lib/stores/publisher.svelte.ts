class PublisherStore {
  title = $state('')
  avatarUrl = $state('')
  avatarFile = $state<File | null>(null)
  id = $state('')
  sub = $state('')
  evmAddress = $state('')

  setData(data: { title?: string; avatarUrl?: string; id?: string; sub?: string; evmAddress?: string }) {
    this.title = data.title || this.title
    this.avatarUrl = data.avatarUrl || this.avatarUrl
    this.id = data.id || this.id
    this.sub = data.sub || this.sub
    this.evmAddress = data.evmAddress || this.evmAddress
  }

  setAvatarFile(file: File) {
    this.avatarFile = file
    this.avatarUrl = URL.createObjectURL(file)
  }

  clearAvatarFile() {
    if (this.avatarUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.avatarUrl)
    }
    this.avatarFile = null
  }
}

export const publisherStore = new PublisherStore()
