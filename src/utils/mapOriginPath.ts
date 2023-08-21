import { getOriginPath } from '../config'

export const mapOriginPath = (relativePath: string) => {
  const orPath = getOriginPath()

  try {
    return new URL(relativePath, orPath).toString()
  } catch (e) {
    console.error(e)
    return orPath
  }
}
