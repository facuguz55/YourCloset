import { useState } from 'react'
import Header from './components/Header/Header'
import Home from './pages/Home/Home'

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null)

  // Por ahora solo la pantalla Home; las demás pantallas se añaden en fases siguientes
  return (
    <>
      <Header />
      <Home onSelectProject={setSelectedProject} />
    </>
  )
}
