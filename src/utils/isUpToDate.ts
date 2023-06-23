export const isUpToDate = (date: string) => {
  const lastUpdate = new Date(date)
  const now = new Date()
  const oneDay = 1000 * 60 * 60 * 24
  const oneDayAgo = new Date(now.getTime() - oneDay)

  return lastUpdate < oneDayAgo
}
