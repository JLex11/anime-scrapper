import { Request } from "express"

export const mappedOriginUrl = (imageRelativePath: string | undefined, req: Request) => {
  if (!imageRelativePath) return
  
  return new URL(
    imageRelativePath,
    `${req.protocol}://${req.get('host')}`
  ).toString()
}