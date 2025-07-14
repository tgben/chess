import { createRoot } from 'react-dom/client'
import './index.css'
import ChessDashboard from './components/ChessDashboard'

createRoot(document.getElementById('root')!).render(
  <div className="min-h-screen bg-bg-main text-text-white">
    <main className="container mx-auto px-4 py-8 pt-24">
      <ChessDashboard />
    </main>
  </div>
);