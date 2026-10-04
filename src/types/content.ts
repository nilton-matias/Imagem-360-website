export interface StatItem {
  id: string
  value: number
  suffix: string
  prefix: boolean
  labelPt: string
  labelEn: string
}

export interface ClientItem {
  id: string
  name: string
  img: string // Either key like 'imgLAM' or data URL / web URL
}

export interface AboutCard {
  l: string
  v: string
}

export interface ContactInfo {
  email: string
  phones: string[]
  addressPt: string
  addressEn: string
  mapsUrl: string
}

export interface SiteCopy {
  nav: string[]
  hero: string[]
  services: string[]
  impact: string[]
  about: string[]
  brands: string[]
  product: string[]
  contact: string[]
}

export interface SiteContent {
  productLink: string
  stats: StatItem[]
  clients: ClientItem[]
  copy: {
    pt: SiteCopy
    en: SiteCopy
  }
  contactInfo: ContactInfo
  aboutCards: {
    pt: AboutCard[]
    en: AboutCard[]
  }
}

export interface GitHubConfig {
  token: string
  owner: string
  repo: string
  branch: string
  filePath: string
}
