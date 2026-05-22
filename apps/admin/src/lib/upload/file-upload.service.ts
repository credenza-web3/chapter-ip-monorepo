export const uploadFileToBucket = async (uploaded: File, url: string) => {
  const uploadFileRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': uploaded.type,
    },
    body: uploaded,
  })

  if (!uploadFileRes.ok) {
    throw new Error(`Upload failed: ${uploadFileRes.status} ${uploadFileRes.statusText}`)
  }
}
