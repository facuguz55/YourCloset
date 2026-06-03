import { useState } from 'react'
import Header from './components/Header/Header'
import Home from './pages/Home/Home'
import ProjectEditor from './pages/ProjectEditor/ProjectEditor'

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState(null)

  function openProject(project) {
    setActiveProjectId(project.id)
  }

  function goHome() {
    setActiveProjectId(null)
  }

  return (
    <>
      <Header />
      {activeProjectId ? (
        <ProjectEditor projectId={activeProjectId} onBack={goHome} />
      ) : (
        <Home onSelectProject={openProject} />
      )}
    </>
  )
}
