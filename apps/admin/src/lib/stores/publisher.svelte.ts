class PublisherStore {
  title = $state('')
  avatarUrl = $state('')
  id = $state('')
  sub = $state('')

  setData(data: { title?: string; avatarUrl?: string; id?: string; sub?: string }) {
    this.title = data.title || this.title
    this.avatarUrl = data.avatarUrl || this.avatarUrl
    this.id = data.id || this.id
    this.sub = data.sub || this.sub
  }
}

export const publisherStore = new PublisherStore()
