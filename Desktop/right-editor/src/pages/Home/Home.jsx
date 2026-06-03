import { useState } from 'react'
import { useProjects } from '../../hooks/useProjects'
import { isConfigured } from '../../lib/supabase'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import NewProjectModal from '../../components/NewProjectModal/NewProjectModal'
import styles from './Home.module.css'

const FILTERS = [
  { value: 'all',        label: 'Todos'      },
  { value: 'pending',    label: 'Pendiente'  },
  { value: 'processing', label: 'Procesando' },
  { value: 'completed',  label: 'Completado' },
  { value: 'error',      label: 'Error'      },
]

function EmptyState({ filtered, onNew }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="8" width="40" height="32" rx="4" stroke="var(--border-2)" strokeWidth="1.5"/>
          <path d="M4 16H44" stroke="var(--border-2)" strokeWidth="1.5"/>
          <path d="M19 26L24 24L29 26V34H19V26Z" stroke="var(--cyan)" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.5"/>
          <circle cx="24" cy="20" r="2" stroke="var(--cyan)" strokeWidth="1.5" strokeOpacity="0.5"/>
        </svg>
      </div>
      {filtered ? (
        <p className={styles.emptyText}>No hay proyectos con ese estado</p>
      ) : (
        <>
          <p className={styles.emptyTitle}>Sin proyectos todavía</p>
          <p className={styles.emptyText}>Creá tu primer proyecto para empezar a procesar videos.</p>
          <button className={styles.btnNew} onClick={onNew}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nuevo proyecto
          </button>
        </>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={`${styles.skeletonThumb} skeleton`} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeletonLine} skeleton`} style={{ width: '65%', height: '14px' }} />
        <div className={`${styles.skeletonLine} skeleton`} style={{ width: '40%', height: '11px', marginTop: '6px' }} />
      </div>
    </div>
  )
}

export default function Home({ onSelectProject }) {
  const { projects, loading, error, createProject } = useProjects()
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = projects.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const stats = {
    total:      projects.length,
    processing: projects.filter(p => p.status === 'processing').length,
    completed:  projects.filter(p => p.status === 'completed').length,
    error:      projects.filter(p => p.status === 'error').length,
  }

  return (
    <main className={styles.main}>
      {/* Banner de configuración pendiente */}
      {!isConfigured && (
        <div className={styles.setupBanner}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#ffaa00" strokeWidth="1.3"/>
            <path d="M8 5V8.5M8 10.5V11" stroke="#ffaa00" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div>
            <strong>Supabase no configurado.</strong> Completá las variables en{' '}
            <code>.env.local</code> y reiniciá el servidor para conectar la base de datos.
          </div>
        </div>
      )}

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Proyectos de Video
            <span className={styles.heroCyan}> / Right Botines</span>
          </h1>
          <p className={styles.heroSub}>
            Procesá videos con IA — eliminá silencios, subtítulos animados y logo automático.
          </p>
        </div>

        <button className={styles.btnNew} onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nuevo Proyecto
        </button>
      </section>

      {/* Stats */}
      {!loading && projects.length > 0 && (
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} text-cyan`}>{stats.processing}</span>
            <span className={styles.statLabel}>Procesando</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} text-green`}>{stats.completed}</span>
            <span className={styles.statLabel}>Completados</span>
          </div>
          {stats.error > 0 && (
            <div className={styles.statCard}>
              <span className={`${styles.statValue} text-error`}>{stats.error}</span>
              <span className={styles.statLabel}>Errores</span>
            </div>
          )}
        </section>
      )}

      {/* Toolbar */}
      <section className={styles.toolbar}>
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`${styles.filterBtn} ${filter === f.value ? styles.filterActive : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              {f.value !== 'all' && projects.filter(p => p.status === f.value).length > 0 && (
                <span className={styles.filterCount}>
                  {projects.filter(p => p.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.search}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className={styles.searchIcon}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </section>

      {/* Content */}
      {error ? (
        <div className={styles.errorBanner}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="var(--error)" strokeWidth="1.3"/>
            <path d="M8 5V8.5M8 10.5V11" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Error al cargar proyectos: {error}</span>
        </div>
      ) : loading ? (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filtered={filter !== 'all' || search !== ''} onNew={() => setShowModal(true)} />
      ) : (
        <div className={styles.grid}>
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={onSelectProject}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreate={createProject}
        />
      )}
    </main>
  )
}
