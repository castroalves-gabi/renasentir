import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Archive, ArrowRight, BookOpen, Check, Clock3,
  Grid2X2, Heart, History, Home, LayoutList, Menu, Plus, Search,
  Settings, Sun, X,
} from 'lucide-react'
import './App.css'

type ContentType = 'Video' | 'Text' | 'Course' | 'PDF' | 'Image'
type Status = 'Not started' | 'In progress' | 'Completed' | 'Paused'

type LibraryItem = {
  id: string
  title: string
  description: string
  type: ContentType
  category: string
  author: string
  status: Status
  favorite: boolean
  image: string
  createdAt: string
  collection?: string | null
  originalUrl?: string
  duration?: string
}

const collections = ['Art & Visual Culture', 'A Study of Cities']

const seedItems: LibraryItem[] = [
  { id: '1', title: 'The Golden Ratio in Renaissance Art', description: 'A visual essay tracing proportion, harmony and the search for beauty.', type: 'Video', category: 'Art & Design', author: 'Museum of Thought', status: 'In progress', favorite: true, image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=900&q=85', createdAt: '2026-11-24', duration: '18 min' },
  { id: '2', title: 'Notes on the Sacred Grove', description: 'Botanical observations gathered from an imagined Renaissance manuscript.', type: 'Text', category: 'Botany', author: 'Elena Morandi', status: 'Not started', favorite: false, image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85', createdAt: '2026-11-23' },
  { id: '3', title: 'Understanding Classical Perspective', description: 'A practical course about vanishing points and spatial composition.', type: 'Course', category: 'Art & Design', author: 'Atelier Digital', status: 'Completed', favorite: true, image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=900&q=85', createdAt: '2026-11-21', duration: '4h 20m' },
  { id: '4', title: 'A Field Guide to the Night Sky', description: 'Constellations, instruments and celestial maps for curious observers.', type: 'PDF', category: 'Science', author: 'The Astral Society', status: 'Paused', favorite: false, image: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=900&q=85', createdAt: '2026-11-20' },
  { id: '5', title: 'Windows, Shadows & Morning Light', description: 'A photographic study of quiet architectural moments.', type: 'Image', category: 'Photography', author: 'Noemi Archive', status: 'Not started', favorite: true, image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=85', createdAt: '2026-11-18' },
  { id: '6', title: 'The Architecture of Memory', description: 'How spaces shape recollection, place and imaginative interior worlds.', type: 'Text', category: 'Culture', author: 'Commonplace Review', status: 'In progress', favorite: false, image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=85', createdAt: '2026-11-16', duration: '12 min' },
]

const navItems = [
  { label: 'Home', icon: Home },
  { label: 'My Library', icon: Archive },
  { label: 'My Day', icon: Sun, count: 4 },
  { label: 'History', icon: History },
  { label: 'Favorites', icon: Heart },
]

function App() {
  const [page, setPage] = useState('Home')
  const [items, setItems] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem('renasentir-library')
    return saved ? JSON.parse(saved) : seedItems
  })
  const [myDay, setMyDay] = useState<string[]>(() => JSON.parse(localStorage.getItem('renasentir-my-day') || '["1","3","4","6"]'))
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => localStorage.setItem('renasentir-library', JSON.stringify(items)), [items])
  useEffect(() => localStorage.setItem('renasentir-my-day', JSON.stringify(myDay)), [myDay])

  const filtered = items.filter(item =>
    `${item.title} ${item.description} ${item.category} ${item.author}`.toLowerCase().includes(search.toLowerCase())
  )

  const toggleFavorite = (id: string) => setItems(current =>
    current.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item)
  )

  const toggleMyDay = (id: string) => setMyDay(current =>
    current.includes(id) ? current.filter(value => value !== id) : [...current, id]
  )

  const addItem = (item: Omit<LibraryItem, 'id' | 'createdAt' | 'status' | 'favorite'>) => {
    setItems(current => [{
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Not started',
      favorite: false,
    }, ...current])
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">R</div>
          <span>Renasentir</span>
          <button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>

        <nav>
          <p className="nav-label">Library</p>
          {navItems.map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => { setPage(label); setSidebarOpen(false) }}>
              <Icon size={18} strokeWidth={1.7} />
              <span>{label}</span>
              {count && <small>{count}</small>}
            </button>
          ))}

          <div className="nav-divider" />
          <div className="nav-heading"><p className="nav-label">My collections</p><button aria-label="Create collection"><Plus size={15} /></button></div>
          <button className="collection-link" onClick={() => setPage('Art & Visual Culture')}><span className="collection-dot olive" />Art & Visual Culture</button>
          <button className="collection-link" onClick={() => setPage('A Study of Cities')}><span className="collection-dot wine" />A Study of Cities</button>
        </nav>

        <button className="sidebar-settings" onClick={() => setPage('Settings')}><Settings size={18} /><span>Settings</span></button>
      </aside>

      {sidebarOpen && <button className="backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="global-search">
            <Search size={17} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search your library" aria-label="Search your library" />
            <kbd>⌘ K</kbd>
          </div>
          <button className="add-button" onClick={() => setModalOpen(true)}><Plus size={17} />Add content</button>
        </header>

        {page === 'Home' ? (
                  <HomePage items={items} myDay={myDay} onNavigate={setPage} onFavorite={toggleFavorite} onAdd={() => setModalOpen(true)} />
        ) : page === 'My Library' || page === 'Favorites' ? (
          <LibraryPage
            key={page}
            title={page === 'My Library' ? 'My Library' : page}
            items={page === 'Favorites' ? filtered.filter(item => item.favorite) : filtered}
            view={view}
            setView={setView}
            onFavorite={toggleFavorite}
            onMyDay={toggleMyDay}
            myDay={myDay}
          />
        ) : page === 'My Day' ? (
          <MyDayPage items={items.filter(item => myDay.includes(item.id))} onToggle={toggleMyDay} />
        ) : (
          <LibraryPage key={page} title={page} items={collections.includes(page) ? filtered.filter(item => item.collection === page) : filtered} view={view} setView={setView} onFavorite={toggleFavorite} onMyDay={toggleMyDay} myDay={myDay} />
        )}
      </main>

      {modalOpen && <AddContentModal onClose={() => setModalOpen(false)} onAdd={addItem} />}
    </div>
  )
}

function HomePage({ items, myDay, onNavigate, onFavorite, onAdd }: {
  items: LibraryItem[]
  myDay: string[]
  onNavigate: (page: string) => void
  onFavorite: (id: string) => void
  onAdd: () => void
}) {
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const dayItems = items.filter(item => myDay.includes(item.id)).slice(0, 3)
  return (
    <div className="page home-page">
      <section className="welcome">
        <div>
          <p className="eyebrow">Wednesday edition</p>
          <h1>Your personal world<br />of knowledge.</h1>
          <p className="date"><Clock3 size={15} />{date}</p>
        </div>
        <div className="welcome-actions">
          <button className="secondary-button" onClick={() => onNavigate('My Day')}><Sun size={17} />My Day</button>
          <button className="primary-button" onClick={onAdd}><Plus size={17} />Add content</button>
        </div>
      </section>

      <div className="home-layout">
        <section className="day-card">
          <div className="section-heading">
            <div><p className="eyebrow">Today</p><h2>My Day</h2></div>
            <button className="text-button" onClick={() => onNavigate('My Day')}>Open <ArrowRight size={15} /></button>
          </div>
          <div className="progress-row"><span>2 of {myDay.length} complete</span><span>{Math.round((2 / Math.max(myDay.length, 1)) * 100)}%</span></div>
          <div className="progress-track"><span style={{ width: `${Math.round((2 / Math.max(myDay.length, 1)) * 100)}%` }} /></div>
          <div className="day-preview">
            {dayItems.map((item, index) => (
              <button key={item.id} className={`day-preview-row ${index === 0 ? 'complete' : ''}`}>
                <span className="mini-check">{index === 0 && <Check size={13} />}</span>
                <img src={item.image} alt="" />
                <div><strong>{item.title}</strong><small>{item.type}{item.duration ? ` · ${item.duration}` : ''}</small></div>
              </button>
            ))}
          </div>
        </section>

        <section className="recent-section">
          <div className="section-heading">
            <div><p className="eyebrow">Your shelf</p><h2>Recently added</h2></div>
            <button className="text-button" onClick={() => onNavigate('My Library')}>View all <ArrowRight size={15} /></button>
          </div>
          <div className="recent-grid">
            {items.slice(0, 3).map(item => (
              <article className="recent-card" key={item.id}>
                <div className="recent-image"><img src={item.image} alt="" /><span>{item.type}</span></div>
                <h3>{item.title}</h3>
                <p>{item.category}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="discovery">
        <div className="section-heading">
          <div><p className="eyebrow">Open a path</p><h2>Discover your library</h2></div>
          <button className="text-button" onClick={() => onNavigate('My Library')}>Explore <ArrowRight size={15} /></button>
        </div>
        <div className="mosaic">
          {items.slice(0, 5).map((item, index) => (
            <article className={`mosaic-card mosaic-${index + 1}`} key={item.id}>
              <img src={item.image} alt={item.title} />
              <div className="mosaic-overlay"><span>{item.category}</span><h3>{item.title}</h3></div>
              <button className={`card-heart ${item.favorite ? 'active' : ''}`} onClick={() => onFavorite(item.id)} aria-label="Favorite"><Heart size={16} fill={item.favorite ? 'currentColor' : 'none'} /></button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function LibraryPage({ title, items, view, setView, onFavorite, onMyDay, myDay }: {
  title: string
  items: LibraryItem[]
  view: 'grid' | 'list'
  setView: (view: 'grid' | 'list') => void
  onFavorite: (id: string) => void
  onMyDay: (id: string) => void
  myDay: string[]
}) {
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [collectionFilter, setCollectionFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const visibleItems = items
    .filter(item => !typeFilter || item.type === typeFilter)
    .filter(item => !statusFilter || item.status === statusFilter)
    .filter(item => collectionFilter === 'all'
      || (collectionFilter === 'none' ? !item.collection : item.collection === collectionFilter))
    .sort((a, b) => {
      if (sortOrder === 'oldest') return a.createdAt.localeCompare(b.createdAt)
      if (sortOrder === 'title') return a.title.localeCompare(b.title)
      return b.createdAt.localeCompare(a.createdAt)
    })

  return (
    <div className="page library-page">
      <div className="page-heading">
        <div><p className="eyebrow">{title === 'My Library' ? 'Personal collection' : 'Curated view'}</p><h1>{title}</h1></div>
        <div className="view-toggle">
          <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view"><Grid2X2 size={17} /></button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view"><LayoutList size={18} /></button>
        </div>
      </div>
      <div className="filterbar">
        <select aria-label="Filter by type" value={typeFilter} onChange={event => setTypeFilter(event.target.value)}>
          <option value="">All types</option>
          <option>Video</option><option>Text</option><option>Course</option><option>PDF</option><option>Image</option>
        </select>
        <select aria-label="Filter by status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
          <option value="">All statuses</option>
          <option>Not started</option><option>In progress</option><option>Completed</option><option>Paused</option>
        </select>
        <select aria-label="Filter by collection" value={collectionFilter} onChange={event => setCollectionFilter(event.target.value)}>
          <option value="all">All collections</option>
          <option value="none">Without collection</option>
          {collections.map(collection => <option key={collection}>{collection}</option>)}
        </select>
        <select aria-label="Sort library items" value={sortOrder} onChange={event => setSortOrder(event.target.value)}>
          <option value="newest">Recently added</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title</option>
        </select>
        <span>{visibleItems.length} items</span>
      </div>
      {visibleItems.length === 0 ? (
        <div className="empty-state"><BookOpen size={38} /><h2>No discoveries yet</h2><p>Add something that sparks your curiosity.</p></div>
      ) : view === 'grid' ? (
        <div className="library-grid">
          {visibleItems.map(item => (
            <article className="content-card" key={item.id}>
              <div className="card-image"><img src={item.image} alt={item.title} /><span className="type-pill">{item.type}</span><button className={`card-heart ${item.favorite ? 'active' : ''}`} onClick={() => onFavorite(item.id)} aria-label="Favorite"><Heart size={16} fill={item.favorite ? 'currentColor' : 'none'} /></button></div>
              <div className="card-copy"><p>{item.category}</p><h3>{item.title}</h3><div className="card-meta"><span className={`status-dot ${item.status.toLowerCase().replaceAll(' ', '-')}`} />{item.status}<button onClick={() => onMyDay(item.id)} aria-label="Add to My Day" className={myDay.includes(item.id) ? 'in-day' : ''}><Plus size={14} /></button></div></div>
            </article>
          ))}
        </div>
      ) : (
        <div className="content-feed">
          {visibleItems.map(item => (
            <article className="feed-row" key={item.id}>
              <img src={item.image} alt="" />
              <div className="feed-copy"><p>{item.category} · {item.type}</p><h3>{item.title}</h3><span>{item.description}</span></div>
              <div className="feed-status"><span className={`status-dot ${item.status.toLowerCase().replaceAll(' ', '-')}`} />{item.status}</div>
              <button className={`square-button ${myDay.includes(item.id) ? 'in-day' : ''}`} onClick={() => onMyDay(item.id)} aria-label="Add to My Day"><Plus size={16} /></button>
              <button className={`square-button ${item.favorite ? 'favorite' : ''}`} onClick={() => onFavorite(item.id)} aria-label="Favorite"><Heart size={16} fill={item.favorite ? 'currentColor' : 'none'} /></button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function MyDayPage({ items }: { items: LibraryItem[]; onToggle: (id: string) => void }) {
  const [completed, setCompleted] = useState<string[]>(['3'])
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  const progress = items.length ? Math.round(completed.length / items.length * 100) : 0
  return (
    <div className="page myday-page">
      <div className="page-heading"><div><p className="eyebrow">{date}</p><h1>My Day</h1></div><div className="day-progress"><span>{completed.length} of {items.length} complete</span><strong>{progress}%</strong></div></div>
      <div className="day-progress-track"><span style={{ width: `${progress}%` }} /></div>
      <div className="day-list">
        {items.map(item => (
          <article className={`day-row ${completed.includes(item.id) ? 'complete' : ''}`} key={item.id}>
            <button className="day-checkbox" onClick={() => setCompleted(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])} aria-label="Mark complete">{completed.includes(item.id) && <Check size={15} />}</button>
            <img src={item.image} alt="" />
            <div className="day-item-copy"><p>{item.category}</p><h3>{item.title}</h3></div>
            <span className="day-duration">{item.duration || 'Flexible'}</span>
            <button className="drag-handle" aria-label="Reorder">⠿</button>
          </article>
        ))}
      </div>
    </div>
  )
}

function AddContentModal({ onClose, onAdd }: { onClose: () => void; onAdd: (item: Omit<LibraryItem, 'id' | 'createdAt' | 'status' | 'favorite'>) => void }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<ContentType>('Text')
  const [collection, setCollection] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    onAdd({
      title: title.trim(),
      description: 'A new discovery added to your personal library.',
      type,
      category: 'Unsorted',
      author: 'Personal archive',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85',
      collection: collection || null,
      originalUrl: url.trim() || undefined,
    })
    setTitle('')
    setUrl('')
    setCollection('')
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title">
        <div className="modal-header"><div><p className="eyebrow">Expand the collection</p><h2 id="add-title">Add content</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <form onSubmit={submit}>
          <label>Paste a link or enter a title<input value={url} onChange={event => setUrl(event.target.value)} placeholder="https://..." /></label>
          <label>Title<input value={title} onChange={event => setTitle(event.target.value)} placeholder="What did you discover?" required /></label>
          <div className="form-row"><label>Type<select value={type} onChange={event => setType(event.target.value as ContentType)}><option>Text</option><option>Video</option><option>Course</option><option>PDF</option><option>Image</option></select></label><label>Collection<select value={collection} onChange={event => setCollection(event.target.value)}><option value="">Escolher depois</option>{collections.map(value => <option key={value} value={value}>{value}</option>)}</select></label></div>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button"><Plus size={16} />Save to library</button></div>
        </form>
      </section>
    </div>
  )
}

export default App
