import imgLAM from '../assets/71b4ddcb-f27b-4cf2-a9cb-03a003079d28.png'
import imgMAHS from '../assets/43125cf7-99ea-49eb-9d83-2778192b4e55.png'
import imgPetro from '../assets/550ee893-25d8-42d1-a998-66ea9bbe171f.png'
import imgAmopao from '../assets/6f2cf065-bac9-4c65-8fa2-601d5c71e34e.png'
import imgBread from '../assets/8b484c38-6242-46ac-9cf1-e3e09bcce684.png'
import imgPBF from '../assets/7975e11e-f074-453f-9042-417445fbfce3.png'
import imgSolido from '../imports/Microbanco_Solido_-_Fundo_Branco-01.png'
import imgJogaBets from '../imports/JOGA_BETS_LOGO_-_FINAL.jpg'
import imgMJD from '../imports/MINISTERIO.jpg'

export const DEFAULT_BRAND_LOGOS: Record<string, string> = {
  imgLAM,
  imgMAHS,
  imgPetro,
  imgAmopao,
  imgBread,
  imgPBF,
  imgSolido,
  imgJogaBets,
  imgMJD,
}

export const BRAND_IMAGE_OPTIONS = [
  { key: 'imgLAM', label: 'LAM' },
  { key: 'imgMAHS', label: 'MAHS' },
  { key: 'imgPetro', label: 'Petromoc' },
  { key: 'imgAmopao', label: 'Amo Pão' },
  { key: 'imgBread', label: 'Saco de Pão Ecológico' },
  { key: 'imgPBF', label: 'PBF' },
  { key: 'imgSolido', label: 'Microbanco Sólido' },
  { key: 'imgJogaBets', label: 'Joga Bets' },
  { key: 'imgMJD', label: 'Ministério da Justiça' },
]

export function resolveImageSource(img: string): string {
  if (!img) return ''
  if (DEFAULT_BRAND_LOGOS[img]) {
    return DEFAULT_BRAND_LOGOS[img]
  }
  return img
}
