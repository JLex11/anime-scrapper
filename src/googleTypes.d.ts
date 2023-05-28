interface GoogleRequestConfig {
  imgOrientation?: 'horizontal' | 'vertical'
  searchType?: string
  imgSize?: 'huge' | 'icon' | 'large' | 'medium' | 'small' | 'xlarge' | 'xxlarge'
  key?: string
  cx?: string
  num?: string
}

export interface GoogleSearchResponse {
  kind: string
  url: URL
  queries: Queries
  context: Context
  searchInformation: SearchInformation
  items: GoogleImageSearchItem[]
}

export interface Context {
  title: string
}

export interface GoogleImageSearchItem {
  kind: string
  title: string
  htmlTitle: string
  link: string
  displayLink: string
  snippet: string
  htmlSnippet: string
  mime: string
  fileFormat: string
  image: GoogleImage
}

export interface GoogleImage {
  contextLink: string
  height: number
  width: number
  byteSize: number
  thumbnailLink: string
  thumbnailHeight: number
  thumbnailWidth: number
}

export interface Queries {
  request: NextPage[]
  nextPage: NextPage[]
}

export interface NextPage {
  title: string
  totalResults: string
  searchTerms: string
  count: number
  startIndex: number
  inputEncoding: string
  outputEncoding: string
  safe: string
  cx: string
  searchType: string
  imgSize: string
}

export interface SearchInformation {
  searchTime: number
  formattedSearchTime: string
  totalResults: string
  formattedTotalResults: string
}

export interface URL {
  type: string
  template: string
}
