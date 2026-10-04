import { ContentProvider } from './context/ContentContext'
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
