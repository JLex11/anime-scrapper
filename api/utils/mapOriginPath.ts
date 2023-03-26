export const mapOriginPath = (originPath: string, relativePath: string = '') => {
  try {
    return new URL(relativePath, originPath).toString()
  } catch (e) {
    console.error(e)
    return originPath
  }
}