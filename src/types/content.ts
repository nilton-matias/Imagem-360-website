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

export interface ServiceChannel {
  num: string
  tag: string
  title: string
  desc: string
  items: string[]
}

export interface ProductFeature {
  title: string
  desc: string
}

export interface EcoMediaSection {
  badge: string
  title1: string
  titleHighlight: string
  desc: string
  highlights: string[]
  steps: string[]
}

export interface ContactInfo {
  email: string
  phones: string[]
  addressPt: string
  addressEn: string
  mapsUrl: string
  web3formsKey?: string
}

export interface SiteCopy {
  nav: string[]
  hero: string[]
  services: string[]
  channels: ServiceChannel[]
  ecoMedia: EcoMediaSection
  impact: string[]
  about: string[]
  aboutCards: AboutCard[]
  brands: string[]
  product: string[]
  productFeatures: ProductFeature[]
  contact: string[]
  footer: {
    copyright: string
  }
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
