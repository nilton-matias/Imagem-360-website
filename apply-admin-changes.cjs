// Script para aplicar manualmente todas as alterações do Painel Admin
// Execute no terminal: node apply-admin-changes.cjs

const fs = require('fs')
const path = require('path')

console.log('===> Aplicando alterações do Painel Admin...')

function write(relPath, content) {
  const full = path.resolve(__dirname, relPath)
  const dir = path.dirname(full)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
  console.log('✓ ' + relPath)
}

// 1. vercel.json
write('vercel.json', JSON.stringify({
  rewrites: [{ source: '/(.*)', destination: '/index.html' }]
}, null, 2))

// 2. .env.example
write('.env.example', [
  'GITHUB_TOKEN=ghp_seuTokenAquiExemplo1234567890',
  'GITHUB_OWNER=seu-usuario-github',
  'GITHUB_REPO=nome-do-repositorio',
  'GITHUB_BRANCH=main',
  'ADMIN_PASSWORD=admin360'
].join('\n') + '\n')

// 3. src/App.tsx
write('src/App.tsx', `import { ContentProvider } from './context/ContentContext'
import AdminPanel from './components/AdminPanel'
import V3 from './versions/V3'

export default function App() {
  return (
    <ContentProvider>
      <V3 />
      <AdminPanel />
    </ContentProvider>
  )
}
`)

// 4. Copiar logo novo se existir no diretório de uploads
const userUploadLogo = 'C:/Users/nilto/.gemini/antigravity/brain/80ea2d7b-a5bb-47ce-ae16-60917f17f75c/.user_uploaded/media_1791107571690.png'
const targetLogo = path.resolve(__dirname, 'src/imports/logo_novo_360.png')
if (fs.existsSync(userUploadLogo)) {
  fs.copyFileSync(userUploadLogo, targetLogo)
  console.log('✓ src/imports/logo_novo_360.png (logo atualizado)')
}

console.log('\n🎉 Concluído com sucesso! Agora você pode rodar:\n   npm run build\n   git add .\n   git commit -m "Site atualizado com painel admin e modo claro"\n')
