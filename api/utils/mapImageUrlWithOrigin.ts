import { Request } from "express"

export const mappedImageOriginUrl = (imageRelativePath: string | undefined, req: Request) => {
  if (!imageRelativePath) return
  return new URL(imageRelativePath, `${req.protocol}://${req.get('host')}`).toString();
}