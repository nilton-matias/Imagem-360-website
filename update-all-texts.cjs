const fs = require('fs')
const path = require('path')

console.log('--- A INICIAR ATUALIZAÇÃO TOTAL DOS TEXTOS EDITÁVEIS ---')

// 1. ATUALIZAR src/types/content.ts
const typesFile = path.resolve(__dirname, 'src/types/content.ts')
const typesContent = `export interface StatItem {
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
`
fs.writeFileSync(typesFile, typesContent, 'utf8')
console.log('✓ [1/4] src/types/content.ts atualizado com sucesso!')

// 2. ATUALIZAR src/data/site-content.json
const jsonFile = path.resolve(__dirname, 'src/data/site-content.json')
let siteJson = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))

const fullPtCopy = {
  nav: ['Serviços', 'Quem Somos', 'Impacto', 'Marcas', '360-Message', 'Contacto'],
  hero: [
    'A sua marca nos canais',
    'indispensáveis.',
    'Publicitamos com educação, projetando as melhores soluções de comunicação para as marcas que querem crescer em qualquer parte do mundo.',
    'Explorar serviços',
    'Utilizador',
    'Comunicação',
    'Marketing'
  ],
  services: ['O que fazemos', 'Várias ações aplicadas.', 'Um só parceiro.', 'Serviços incluídos'],
  channels: [
    {
      num: '01',
      tag: 'Canal 01',
      title: 'Marketing Digital',
      desc: 'Alcance preciso, entrega imediata. SMS, email e redes sociais integrados numa só estratégia.',
      items: ['SMS em massa', 'SMS Transacional (OTP)', 'SMS Bidirecional', 'Email Marketing', 'Email Transacional', 'USSD', 'Criação e gestão de redes sociais']
    },
    {
      num: '02',
      tag: 'Canal 02',
      title: 'Publicidade Out-of-Home',
      desc: 'Onde menos se espera, mais se impacta. Publicidade que vai ao encontro das pessoas.',
      items: ['Publicidade na mídia ecológica']
    },
    {
      num: '03',
      tag: 'Canal 03',
      title: 'Estratégias de Marketing',
      desc: 'Da ideia à execução — pensamos a comunicação da sua marca de forma integral.',
      items: ['Consultoria estratégica', 'Identidade Visual', 'Criação de campanhas', 'Ativações e mais']
    }
  ],
  ecoMedia: {
    badge: 'Direitos do autor',
    title1: 'Publicidade na',
    titleHighlight: 'mídia ecológica',
    desc: 'Divulgação de marcas nacionais e internacionais, através do uso de sacos biodegradáveis para armazenar produtos alimentares entre outros.',
    highlights: [
      'Ecológico e indispensável',
      'Distribuição nos estabelecimentos comerciais',
      '0% de desperdício'
    ],
    steps: [
      'Produção e impressão com publicidade',
      'Distribuição em padarias, supermercados, farmácias, entre outros.',
      'Nas mãos do consumidor diariamente'
    ]
  },
  impact: ['Impacto', 'Números que', 'comprovam.'],
  about: [
    'Quem somos',
    'O pensamento',
    'fora da caixa.',
    'Imagem 360, Lda, agência de marketing e publicidade, existente desde 2015. Nasceu por necessidade de uma empresa criativa com elevação de valores sociais, dinamizando o marketing com respostas a todas as demandas.',
    'Publicitamos com educação, projetando as melhores soluções.'
  ],
  aboutCards: [
    { l: 'Visão', v: 'Elevar o nível da criatividade, alavancando marcas nacionais e internacionais.' },
    { l: 'Missão', v: 'Comprometimento no crescimento estratégico e manutenção das marcas.' },
    { l: 'Valores', v: 'Responsabilidade ambiental · Social · Qualidade · Eficácia · Integridade · Inovação' },
    { l: 'Inovação', v: 'Inovamos, trazendo sentido e vida à nossa comunicação.' },
    { l: 'Canais', v: 'Temos os melhores canais de marketing digital e publicidade out of home.' },
    { l: 'Equipa', v: 'Contamos com uma equipa dedicada, genial e super responsável.' }
  ],
  brands: [
    'Marcas que confiam em nós',
    'Empresas moçambicanas e internacionais que escolheram a Imagem 360 como parceira de trabalho.'
  ],
  product: [
    'Produto · 360-Message',
    'A comunicação',
    'da sua marca,',
    'numa só plataforma.',
    'SMS, Email e USSD integrados na plataforma multicanal, rápida e feita para o mercado nacional e internacional.',
    'Experimentar o 360-Message'
  ],
  productFeatures: [
    { title: 'SMS em Massa', desc: 'Chegue a milhares de contactos em segundos' },
    { title: 'Email Marketing', desc: 'Campanhas visuais com métricas em tempo real' },
    { title: 'USSD', desc: 'Interacção directa sem necessidade de internet' },
    { title: 'Relatórios', desc: 'Dashboards com resultados de cada campanha' }
  ],
  contact: [
    'Contacto',
    'Vamos',
    'conversar.',
    'Estamos ansiosos pelo seu contacto!',
    'Endereço',
    'Ver no Google Maps',
    'Telefone',
    'Envie-nos uma mensagem',
    'Nome',
    'Assunto',
    'Mensagem',
    'Enviar mensagem',
    'Obrigado pelo envio!'
  ],
  footer: {
    copyright: 'Todos os direitos do autor reservados'
  }
}

const fullEnCopy = {
  nav: ['Services', 'About Us', 'Impact', 'Brands', '360-Message', 'Contact'],
  hero: [
    'Your brand across the',
    'essential channels.',
    'We advertise through education, designing the best communication solutions for brands that want to grow anywhere in the world.',
    'Explore services',
    'User',
    'Communication',
    'Marketing'
  ],
  services: ['What we do', 'Multiple actions applied.', 'One partner.', 'Included services'],
  channels: [
    {
      num: '01',
      tag: 'Channel 01',
      title: 'Digital Marketing',
      desc: 'Precise reach, immediate delivery. SMS, email and social media integrated into one strategy.',
      items: ['Bulk SMS', 'Transactional SMS (OTP)', 'Two-way SMS', 'Email Marketing', 'Transactional Email', 'USSD', 'Social media creation and management']
    },
    {
      num: '02',
      tag: 'Channel 02',
      title: 'Out-of-Home Advertising',
      desc: 'Where it is least expected, it creates the greatest impact. Advertising that meets people where they are.',
      items: ['Eco-media advertising']
    },
    {
      num: '03',
      tag: 'Channel 03',
      title: 'Marketing Strategies',
      desc: 'From idea to execution—we approach your brand communication as a whole.',
      items: ['Strategic consulting', 'Visual Identity', 'Campaign creation', 'Activations and more']
    }
  ],
  ecoMedia: {
    badge: 'Copyright',
    title1: 'Eco-media',
    titleHighlight: 'advertising',
    desc: 'Promoting national and international brands through biodegradable bags used to store food products and more.',
    highlights: [
      'Eco-friendly and essential',
      'Distribution in retail establishments',
      '0% waste'
    ],
    steps: [
      'Production and printing with advertising',
      'Distribution in bakeries, supermarkets, pharmacies and more.',
      'In consumers’ hands every day'
    ]
  },
  impact: ['Impact', 'Numbers that', 'prove it.'],
  about: [
    'About us',
    'Thinking',
    'outside the box.',
    'Imagem 360, Lda is a marketing and advertising agency established in 2015. It was born from the need for a creative company that elevates social values and energises marketing with answers to every demand.',
    'We advertise through education, designing the best solutions.'
  ],
  aboutCards: [
    { l: 'Vision', v: 'Elevating creativity to advance national and international brands.' },
    { l: 'Mission', v: 'Commitment to the strategic growth and long-term development of brands.' },
    { l: 'Values', v: 'Environmental responsibility · Social responsibility · Quality · Effectiveness · Integrity · Innovation' },
    { l: 'Innovation', v: 'We innovate, bringing meaning and life to our communication.' },
    { l: 'Channels', v: 'We offer the best digital marketing and out-of-home advertising channels.' },
    { l: 'Team', v: 'We have a dedicated, brilliant and highly responsible team.' }
  ],
  brands: [
    'Brands that trust us',
    'Mozambican and international companies that chose Imagem 360 as their working partner.'
  ],
  product: [
    'Product · 360-Message',
    'Your brand’s',
    'communication,',
    'on one platform.',
    'SMS, Email and USSD integrated into a fast multichannel platform built for national and international markets.',
    'Try 360-Message'
  ],
  productFeatures: [
    { title: 'Bulk SMS', desc: 'Reach thousands of contacts in seconds' },
    { title: 'Email Marketing', desc: 'Visual campaigns with real-time metrics' },
    { title: 'USSD', desc: 'Direct interaction without internet access' },
    { title: 'Reports', desc: 'Dashboards with results from every campaign' }
  ],
  contact: [
    'Contact',
    'Let’s',
    'talk.',
    'We look forward to hearing from you!',
    'Address',
    'View on Google Maps',
    'Phone',
    'Send us a message',
    'Name',
    'Subject',
    'Message',
    'Send message',
    'Thank you for your message!'
  ],
  footer: {
    copyright: 'All rights reserved'
  }
}

siteJson.copy = {
  pt: fullPtCopy,
  en: fullEnCopy
}

if (!siteJson.contactInfo) {
  siteJson.contactInfo = {
    email: 'team@imagem360.agency',
    phones: ['(+258) 834920306', '(+258) 875500828'],
    addressPt: 'Av. Maguiguana, 845, Maputo, Moçambique',
    addressEn: 'Av. Maguiguana, 845, Maputo, Mozambique',
    mapsUrl: 'https://maps.google.com/?q=Av.+Maguiguana+845+Maputo+Mozambique'
  }
}

fs.writeFileSync(jsonFile, JSON.stringify(siteJson, null, 2), 'utf8')
console.log('✓ [2/4] src/data/site-content.json populado com 100% dos textos!')

// 3. ATUALIZAR src/versions/V3.tsx
const v3File = path.resolve(__dirname, 'src/versions/V3.tsx')
let v3 = fs.readFileSync(v3File, 'utf8')

// Garantir leitura dos canais e novos campos dinâmicos
v3 = v3.replace(
  /const copy = content\.copy\[lang\] \|\| COPY\[lang\]\s*const canais = lang === 'pt' \? CANAIS_PT : CANAIS_EN/g,
  `const copy = content.copy[lang] || COPY[lang]
  const canais = copy.channels || (lang === 'pt' ? CANAIS_PT : CANAIS_EN)
  const ecoMedia = copy.ecoMedia
  const aboutCards = copy.aboutCards || (content.aboutCards && content.aboutCards[lang])
  const productFeatures = copy.productFeatures
  const contactInfo = content.contactInfo`
)

// Utilizador no diagrama
v3 = v3.replace(
  /\{lang === 'pt' \? 'Utilizador' : 'User'\}/g,
  `{copy.hero[4] || (lang === 'pt' ? 'Utilizador' : 'User')}`
)

// Comunicação e Marketing no diagrama
v3 = v3.replace(
  /\{\s*label:\s*lang === 'pt' \? 'Comunicação' : 'Communication',\s*type:\s*'communication',\s*bottom:\s*'10%',\s*right:\s*'-2%'\s*\},/g,
  `{ label: copy.hero[5] || (lang === 'pt' ? 'Comunicação' : 'Communication'), type: 'communication', bottom: '10%', right: '-2%' },`
)
v3 = v3.replace(
  /\{\s*label:\s*'Marketing',\s*type:\s*'marketing',\s*bottom:\s*'10%',\s*left:\s*'0%'\s*\},/g,
  `{ label: copy.hero[6] || 'Marketing', type: 'marketing', bottom: '10%', left: '0%' },`
)

// Badge mídia ecológica
v3 = v3.replace(
  /\{lang === 'pt' \? 'Direitos do autor' : 'Copyright'\}/g,
  `{ecoMedia?.badge || (lang === 'pt' ? 'Direitos do autor' : 'Copyright')}`
)

// Título mídia ecológica
v3 = v3.replace(
  /\{lang === 'pt' \? 'Publicidade na' : 'Eco-media'\}<br \/><span style=\{\{ color: R \}\}>\{lang === 'pt' \? 'mídia ecológica' : 'advertising'\}<\/span>/g,
  `{ecoMedia?.title1 || (lang === 'pt' ? 'Publicidade na' : 'Eco-media')}<br /><span style={{ color: R }}>{ecoMedia?.titleHighlight || (lang === 'pt' ? 'mídia ecológica' : 'advertising')}</span>`
)

// Descrição mídia ecológica
v3 = v3.replace(
  /\{lang === 'pt'\s*\?\s*'Divulgação de marcas nacionais e internacionais, através do uso de sacos biodegradáveis para armazenar produtos alimentares entre outros\.'\s*:\s*'Promoting national and international brands through biodegradable bags used to store food products and more\.'\}/g,
  `{ecoMedia?.desc || (lang === 'pt' ? 'Divulgação de marcas nacionais e internacionais, através do uso de sacos biodegradáveis para armazenar produtos alimentares entre outros.' : 'Promoting national and international brands through biodegradable bags used to store food products and more.')}`
)

// Passos mídia ecológica
v3 = v3.replace(
  /\(lang === 'pt'\s*\?\s*\['Produção e impressão com publicidade',\s*'Distribuição em padarias, supermercados, farmácias, entre outros\.',\s*'Nas mãos do consumidor diariamente'\]\s*:\s*\['Production and printing with advertising',\s*'Distribution in bakeries, supermarkets, pharmacies and more\.',\s*'In consumers’ hands every day'\]\s*\)\.map\(\(step, i\) => \(/g,
  `(ecoMedia?.steps || (lang === 'pt' ? ['Produção e impressão com publicidade', 'Distribuição em padarias, supermercados, farmácias, entre outros.', 'Nas mãos do consumidor diariamente'] : ['Production and printing with advertising', 'Distribution in bakeries, supermarkets, pharmacies and more.', 'In consumers’ hands every day'])).map((step, i) => (`
)

// Destaques (highlights) da mídia ecológica
v3 = v3.replace(
  /\{\s*icon:\s*'M20\.8 3\.2C14 3\.5 8\.6 5\.8 6\.1 10\.1c-1\.9 3\.2-\.8 6\.5 1\.6 8\.2 2\.6 1\.8 6\.2 1\.1 8\.1-1\.8 2\.4-3\.7 2\.1-8\.3 5-13\.3ZM5 21c2-5 5\.5-8\.2 10\.5-10\.5',\s*color:\s*'#2f9e62',\s*label:\s*lang === 'pt' \? 'Ecológico e indispensável' : 'Eco-friendly and essential'\s*\},/g,
  `{ icon: 'M20.8 3.2C14 3.5 8.6 5.8 6.1 10.1c-1.9 3.2-.8 6.5 1.6 8.2 2.6 1.8 6.2 1.1 8.1-1.8 2.4-3.7 2.1-8.3 5-13.3ZM5 21c2-5 5.5-8.2 10.5-10.5', color: '#2f9e62', label: ecoMedia?.highlights?.[0] || (lang === 'pt' ? 'Ecológico e indispensável' : 'Eco-friendly and essential') },`
)
v3 = v3.replace(
  /\{\s*icon:\s*'M4 20V10l8-6 8 6v10M8 20v-6h8v6',\s*label:\s*lang === 'pt' \? 'Distribuição nos estabelecimentos comerciais' : 'Distribution in retail establishments'\s*\},/g,
  `{ icon: 'M4 20V10l8-6 8 6v10M8 20v-6h8v6', label: ecoMedia?.highlights?.[1] || (lang === 'pt' ? 'Distribuição nos estabelecimentos comerciais' : 'Distribution in retail establishments') },`
)
v3 = v3.replace(
  /\{\s*icon:\s*'M2 12s3\.5-6 10-6 10 6 10 6-3\.5 6-10 6S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z',\s*label:\s*lang === 'pt' \? '0% de desperdício' : '0% waste'\s*\},/g,
  `{ icon: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z', label: ecoMedia?.highlights?.[2] || (lang === 'pt' ? '0% de desperdício' : '0% waste') },`
)

// Sobre nós: parágrafos
v3 = v3.replace(
  /\{lang === 'pt'\s*\?\s*'Imagem 360, Lda, agência de marketing e publicidade, existente desde 2015\. Nasceu por necessidade de uma empresa criativa com elevação de valores sociais, dinamizando o marketing com respostas a todas as demandas\.'\s*:\s*'Imagem 360, Lda is a marketing and advertising agency established in 2015\. It was born from the need for a creative company that elevates social values and energises marketing with answers to every demand\.'\}/g,
  `{copy.about[3] || (lang === 'pt' ? 'Imagem 360, Lda, agência de marketing e publicidade, existente desde 2015. Nasceu por necessidade de uma empresa criativa com elevação de valores sociais, dinamizando o marketing com respostas a todas as demandas.' : 'Imagem 360, Lda is a marketing and advertising agency established in 2015. It was born from the need for a creative company that elevates social values and energises marketing with answers to every demand.')}`
)
v3 = v3.replace(
  /\{lang === 'pt' \? 'Publicitamos com educação, projetando as melhores soluções\.' : 'We advertise through education, designing the best solutions\.'\}/g,
  `{copy.about[4] || (lang === 'pt' ? 'Publicitamos com educação, projetando as melhores soluções.' : 'We advertise through education, designing the best solutions.')}`
)

// Sobre nós: cards de Visão, Missão, etc.
v3 = v3.replace(
  /\(lang === 'pt' \? \[\s*\{ l: 'Visão'[\s\S]*?\}\s*\]\s*\)\.map\(\(row, i, arr\) => \(/g,
  `(aboutCards || (lang === 'pt' ? [
    { l: 'Visão', v: 'Elevar o nível da criatividade, alavancando marcas nacionais e internacionais.' },
    { l: 'Missão', v: 'Comprometimento no crescimento estratégico e manutenção das marcas.' },
    { l: 'Valores', v: 'Responsabilidade ambiental · Social · Qualidade · Eficácia · Integridade · Inovação' },
    { l: 'Inovação', v: 'Inovamos, trazendo sentido e vida à nossa comunicação.' },
    { l: 'Canais', v: 'Temos os melhores canais de marketing digital e publicidade out of home.' },
    { l: 'Equipa', v: 'Contamos com uma equipa dedicada, genial e super responsável.' },
  ] : [
    { l: 'Vision', v: 'Elevating creativity to advance national and international brands.' },
    { l: 'Mission', v: 'Commitment to the strategic growth and long-term development of brands.' },
    { l: 'Values', v: 'Environmental responsibility · Social responsibility · Quality · Effectiveness · Integrity · Innovation' },
    { l: 'Innovation', v: 'We innovate, bringing meaning and life to our communication.' },
    { l: 'Channels', v: 'We offer the best digital marketing and out-of-home advertising channels.' },
    { l: 'Team', v: 'We have a dedicated, brilliant and highly responsible team.' },
  ])).map((row, i, arr) => (`
)

// 360-Message: cards de features dinâmicos
v3 = v3.replace(
  /\{lang === 'pt' \? f\.title : \(\{ 'SMS em Massa': 'Bulk SMS', 'Email Marketing': 'Email Marketing', USSD: 'USSD', Relatórios: 'Reports' \}\[f\.title\] \?\? f\.title\)\}/g,
  `{(productFeatures && productFeatures[fIndex]?.title) || (lang === 'pt' ? f.title : ({ 'SMS em Massa': 'Bulk SMS', 'Email Marketing': 'Email Marketing', USSD: 'USSD', Relatórios: 'Reports' }[f.title] ?? f.title))}`
)
v3 = v3.replace(
  /\[\s*\{\s*icon:\s*'M3 8l7\.89[\s\S]*?desc:\s*'Dashboards com resultados de cada campanha'\s*\}\s*\]\.map\(f => \(/g,
  `[
    { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'SMS em Massa', desc: 'Chegue a milhares de contactos em segundos' },
    { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'Email Marketing', desc: 'Campanhas visuais com métricas em tempo real' },
    { icon: 'M12 18h.01M8 21h8a2 2 0 002-2v-1a7 7 0 10-14 0v1a2 2 0 002 2z', title: 'USSD', desc: 'Interacção directa sem necessidade de internet' },
    { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'Relatórios', desc: 'Dashboards com resultados de cada campanha' },
  ].map((f, fIndex) => (`
)
v3 = v3.replace(
  /\{lang === 'pt' \? f\.desc : \(\{ 'Chegue a milhares de contactos em segundos': 'Reach thousands of contacts in seconds', 'Campanhas visuais com métricas em tempo real': 'Visual campaigns with real-time metrics', 'Interacção directa sem necessidade de internet': 'Direct interaction without internet access', 'Dashboards com resultados de cada campanha': 'Dashboards with results from every campaign' \}\[f\.desc\] \?\? f\.desc\)\}/g,
  `{(productFeatures && productFeatures[fIndex]?.desc) || (lang === 'pt' ? f.desc : ({ 'Chegue a milhares de contactos em segundos': 'Reach thousands of contacts in seconds', 'Campanhas visuais com métricas em tempo real': 'Visual campaigns with real-time metrics', 'Interacção directa sem necessidade de internet': 'Direct interaction without internet access', 'Dashboards com resultados de cada campanha': 'Dashboards with results from every campaign' }[f.desc] ?? f.desc))}`
)

// Morada de contacto
v3 = v3.replace(
  /<span style=\{\{ fontSize: '14px', color: t\.fgMid, transition: 'color 0\.3s' \}\}>Av\. Maguiguana, 845, Maputo, Moçambique<\/span>/g,
  `<span style={{ fontSize: '14px', color: t.fgMid, transition: 'color 0.3s' }}>{lang === 'pt' ? (contactInfo?.addressPt || 'Av. Maguiguana, 845, Maputo, Moçambique') : (contactInfo?.addressEn || 'Av. Maguiguana, 845, Maputo, Mozambique')}</span>`
)

// Rodapé
v3 = v3.replace(
  /\{lang === 'pt' \? 'Todos os direitos do autor reservados' : 'All rights reserved'\}/g,
  `{copy.footer?.copyright || (lang === 'pt' ? 'Todos os direitos do autor reservados' : 'All rights reserved')}`
)

fs.writeFileSync(v3File, v3, 'utf8')
console.log('✓ [3/4] src/versions/V3.tsx agora lê 100% dos textos do contexto!')

// 4. ATUALIZAR src/components/AdminPanel.tsx
const adminFile = path.resolve(__dirname, 'src/components/AdminPanel.tsx')
let admin = fs.readFileSync(adminFile, 'utf8')

// Adicionar estados de idioma e submenu de textos caso não existam
if (!admin.includes('const [textLang, setTextLang] = useState')) {
  admin = admin.replace(
    /const \[newStat, setNewStat\] = useState<Omit<StatItem, 'id'>>\(\{[\s\S]*?\}\)/,
    `const [newStat, setNewStat] = useState<Omit<StatItem, 'id'>>({
    value: 10,
    suffix: '+',
    prefix: false,
    labelPt: '',
    labelEn: '',
  })
  const [textLang, setTextLang] = useState<'pt' | 'en'>('pt')
  const [textSection, setTextSection] = useState<'hero' | 'servicos' | 'eco' | 'sobre' | 'produto' | 'contato' | 'geral'>('hero')`
  )
}

// Substituir aba de textos antiga por uma completa
const textTabRegex = /\{activeTab === 'textos' && \([\s\S]*?\)\s*\}\s*\{activeTab === 'seguranca'/

const newTextTabContent = `{activeTab === 'textos' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px' }}>Edição de Textos do Website</h3>
                    <p style={{ fontSize: '13px', color: ui.textMuted, margin: 0 }}>Edite todos os textos e selecione o idioma desejado.</p>
                  </div>

                  {/* Seletor de Idioma */}
                  <div style={{ display: 'flex', background: ui.inputBg, padding: '4px', borderRadius: '12px', border: \`1px solid \${ui.border}\` }}>
                    <button
                      onClick={() => setTextLang('pt')}
                      style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: textLang === 'pt' ? '#e8384a' : 'transparent', color: textLang === 'pt' ? '#fff' : ui.textMuted, fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      🇲🇿 Português
                    </button>
                    <button
                      onClick={() => setTextLang('en')}
                      style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: textLang === 'en' ? '#e8384a' : 'transparent', color: textLang === 'en' ? '#fff' : ui.textMuted, fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                </div>

                {/* Sub-navegação por seções */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px', borderBottom: \`1px solid \${ui.border}\` }}>
                  {[
                    { id: 'hero', label: '1. Hero & Cabeçalho' },
                    { id: 'servicos', label: '2. Serviços & Canais' },
                    { id: 'eco', label: '3. Mídia Ecológica' },
                    { id: 'sobre', label: '4. Quem Somos' },
                    { id: 'produto', label: '5. 360-Message' },
                    { id: 'contato', label: '6. Contato & Morada' },
                    { id: 'geral', label: '7. Menu & Rodapé' },
                  ].map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => setTextSection(sec.id as any)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '999px',
                        border: \`1px solid \${textSection === sec.id ? '#e8384a' : ui.border}\`,
                        background: textSection === sec.id ? (adminDark ? 'rgba(232,56,74,0.18)' : '#ffebee') : ui.cardBg,
                        color: textSection === sec.id ? '#e8384a' : ui.text,
                        fontSize: '12px',
                        fontWeight: textSection === sec.id ? 700 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>

                {/* SEÇÃO 1: HERO */}
                {textSection === 'hero' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Título Principal e Subtítulo</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Linha 1 do Título</label>
                          <input
                            type="text"
                            value={content.copy[textLang].hero[0] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].hero[0] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Linha 2 (Destaque Vermelho)</label>
                          <input
                            type="text"
                            value={content.copy[textLang].hero[1] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].hero[1] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px', fontWeight: 700 }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Parágrafo de Descrição</label>
                          <textarea
                            rows={3}
                            value={content.copy[textLang].hero[2] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].hero[2] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px', resize: 'vertical' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Botão de Ação (CTA)</label>
                          <input
                            type="text"
                            value={content.copy[textLang].hero[3] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].hero[3] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Rótulos do Diagrama Visual Hero</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Ponto Superior</label>
                          <input
                            type="text"
                            value={content.copy[textLang].hero[4] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].hero[4] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Ponto Direito</label>
                          <input
                            type="text"
                            value={content.copy[textLang].hero[5] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].hero[5] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Ponto Esquerdo</label>
                          <input
                            type="text"
                            value={content.copy[textLang].hero[6] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].hero[6] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEÇÃO 2: SERVIÇOS & CANAIS */}
                {textSection === 'servicos' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Cabeçalho de Serviços</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Tag Superior</label>
                          <input
                            type="text"
                            value={content.copy[textLang].services[0] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].services[0] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Linha 1</label>
                          <input
                            type="text"
                            value={content.copy[textLang].services[1] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].services[1] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Linha 2</label>
                          <input
                            type="text"
                            value={content.copy[textLang].services[2] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].services[2] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {(content.copy[textLang].channels || []).map((ch, idx) => (
                      <div key={idx} style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#e8384a', margin: 0 }}>Canal {ch.num} - {ch.title}</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Tag</label>
                              <input
                                type="text"
                                value={ch.tag}
                                onChange={e => {
                                  const updated = { ...content }
                                  updated.copy[textLang].channels[idx].tag = e.target.value
                                  updateContent(updated)
                                }}
                                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título</label>
                              <input
                                type="text"
                                value={ch.title}
                                onChange={e => {
                                  const updated = { ...content }
                                  updated.copy[textLang].channels[idx].title = e.target.value
                                  updateContent(updated)
                                }}
                                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Descrição</label>
                            <textarea
                              rows={2}
                              value={ch.desc}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].channels[idx].desc = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Itens / Serviços (separados por vírgula ou nova linha)</label>
                            <textarea
                              rows={3}
                              value={(ch.items || []).join('\\n')}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].channels[idx].items = e.target.value.split('\\n').filter(Boolean)
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SEÇÃO 3: MÍDIA ECOLÓGICA */}
                {textSection === 'eco' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Textos da Seção Mídia Ecológica</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Badge (Ex: Direitos do autor)</label>
                          <input
                            type="text"
                            value={content.copy[textLang].ecoMedia?.badge || ''}
                            onChange={e => {
                              const updated = { ...content }
                              if (!updated.copy[textLang].ecoMedia) updated.copy[textLang].ecoMedia = {} as any
                              updated.copy[textLang].ecoMedia.badge = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Parte 1</label>
                            <input
                              type="text"
                              value={content.copy[textLang].ecoMedia?.title1 || ''}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].ecoMedia.title1 = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Destacado (Vermelho)</label>
                            <input
                              type="text"
                              value={content.copy[textLang].ecoMedia?.titleHighlight || ''}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].ecoMedia.titleHighlight = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Descrição Principal</label>
                          <textarea
                            rows={3}
                            value={content.copy[textLang].ecoMedia?.desc || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].ecoMedia.desc = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>3 Destaques e 3 Passos do Processo</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: ui.textMuted, marginBottom: '6px' }}>3 Vantagens (1 por linha)</label>
                          <textarea
                            rows={4}
                            value={(content.copy[textLang].ecoMedia?.highlights || []).join('\\n')}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].ecoMedia.highlights = e.target.value.split('\\n').filter(Boolean)
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: ui.textMuted, marginBottom: '6px' }}>3 Passos de Distribuição (1 por linha)</label>
                          <textarea
                            rows={4}
                            value={(content.copy[textLang].ecoMedia?.steps || []).join('\\n')}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].ecoMedia.steps = e.target.value.split('\\n').filter(Boolean)
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEÇÃO 4: QUEM SOMOS */}
                {textSection === 'sobre' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Apresentação Institucional</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Parte 1</label>
                            <input
                              type="text"
                              value={content.copy[textLang].about[1] || ''}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].about[1] = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Destacado (Vermelho)</label>
                            <input
                              type="text"
                              value={content.copy[textLang].about[2] || ''}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].about[2] = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Texto Principal</label>
                          <textarea
                            rows={3}
                            value={content.copy[textLang].about[3] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].about[3] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Frase de Fechamento</label>
                          <input
                            type="text"
                            value={content.copy[textLang].about[4] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].about[4] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Cartões de Valores & Pilares</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        {(content.copy[textLang].aboutCards || []).map((card, idx) => (
                          <div key={idx} style={{ padding: '12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '10px' }}>
                            <input
                              type="text"
                              value={card.l}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].aboutCards[idx].l = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', background: 'transparent', border: \`1px solid \${ui.border}\`, borderRadius: '6px', color: '#e8384a', fontWeight: 800, fontSize: '12px', marginBottom: '6px' }}
                            />
                            <textarea
                              rows={2}
                              value={card.v}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].aboutCards[idx].v = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', background: 'transparent', border: \`1px solid \${ui.border}\`, borderRadius: '6px', color: ui.text, fontSize: '12px' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SEÇÃO 5: 360-MESSAGE */}
                {textSection === 'produto' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Chamadas da Seção 360-Message</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Badge Superior</label>
                          <input
                            type="text"
                            value={content.copy[textLang].product[0] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].product[0] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Linha 1</label>
                            <input
                              type="text"
                              value={content.copy[textLang].product[1] || ''}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].product[1] = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Linha 2</label>
                            <input
                              type="text"
                              value={content.copy[textLang].product[2] || ''}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].product[2] = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Linha 3 (Vermelho)</label>
                            <input
                              type="text"
                              value={content.copy[textLang].product[3] || ''}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].product[3] = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Texto Explicativo</label>
                          <textarea
                            rows={3}
                            value={content.copy[textLang].product[4] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].product[4] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Texto do Botão CTA</label>
                          <input
                            type="text"
                            value={content.copy[textLang].product[5] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].product[5] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>4 Cards de Funcionalidades</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        {(content.copy[textLang].productFeatures || []).map((feat, idx) => (
                          <div key={idx} style={{ padding: '12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '10px' }}>
                            <input
                              type="text"
                              value={feat.title}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].productFeatures[idx].title = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', background: 'transparent', border: \`1px solid \${ui.border}\`, borderRadius: '6px', color: ui.text, fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}
                            />
                            <textarea
                              rows={2}
                              value={feat.desc}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].productFeatures[idx].desc = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', background: 'transparent', border: \`1px solid \${ui.border}\`, borderRadius: '6px', color: ui.textMuted, fontSize: '12px' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SEÇÃO 6: CONTATO */}
                {textSection === 'contato' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Textos da Seção de Contato</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Parte 1</label>
                          <input
                            type="text"
                            value={content.copy[textLang].contact[1] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].contact[1] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Título Destacado</label>
                          <input
                            type="text"
                            value={content.copy[textLang].contact[2] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].contact[2] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Subtítulo</label>
                          <input
                            type="text"
                            value={content.copy[textLang].contact[3] || ''}
                            onChange={e => {
                              const updated = { ...content }
                              updated.copy[textLang].contact[3] = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Dados da Empresa & Formulário</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Email Geral</label>
                          <input
                            type="email"
                            value={content.contactInfo?.email || ''}
                            onChange={e => updateContent({ ...content, contactInfo: { ...content.contactInfo, email: e.target.value } })}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Telefones (separados por vírgula)</label>
                          <input
                            type="text"
                            value={(content.contactInfo?.phones || []).join(', ')}
                            onChange={e => updateContent({ ...content, contactInfo: { ...content.contactInfo, phones: e.target.value.split(',').map(p => p.trim()) } })}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Morada Físíca ({textLang === 'pt' ? 'Português' : 'Inglês'})</label>
                          <input
                            type="text"
                            value={textLang === 'pt' ? content.contactInfo?.addressPt : content.contactInfo?.addressEn}
                            onChange={e => {
                              const updated = { ...content }
                              if (textLang === 'pt') updated.contactInfo.addressPt = e.target.value
                              else updated.contactInfo.addressEn = e.target.value
                              updateContent(updated)
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEÇÃO 7: GERAL */}
                {textSection === 'geral' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Links do Menu de Navegação</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                        {(content.copy[textLang].nav || []).map((item, idx) => (
                          <div key={idx}>
                            <label style={{ display: 'block', fontSize: '11px', color: ui.textMuted, marginBottom: '4px' }}>Item {idx + 1}</label>
                            <input
                              type="text"
                              value={item}
                              onChange={e => {
                                const updated = { ...content }
                                updated.copy[textLang].nav[idx] = e.target.value
                                updateContent(updated)
                              }}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: '18px', background: ui.cardBg, border: \`1px solid \${ui.border}\`, borderRadius: '14px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Texto de Copyright no Rodapé</h4>
                      <input
                        type="text"
                        value={content.copy[textLang].footer?.copyright || ''}
                        onChange={e => {
                          const updated = { ...content }
                          if (!updated.copy[textLang].footer) updated.copy[textLang].footer = {} as any
                          updated.copy[textLang].footer.copyright = e.target.value
                          updateContent(updated)
                        }}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: ui.inputBg, border: \`1px solid \${ui.border}\`, borderRadius: '8px', color: ui.text, fontSize: '13px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'seguranca'`

admin = admin.replace(textTabRegex, newTextTabContent)
fs.writeFileSync(adminFile, admin, 'utf8')
console.log('✓ [4/4] src/components/AdminPanel.tsx aba de textos enriquecida com todas as seções!')

console.log('\\n✅ ATUALIZAÇÃO CONCLUÍDA! TODOS OS TEXTOS AGORA SÃO 100% DINÂMICOS E EDITÁVEIS NO PAINEL ADMIN.')