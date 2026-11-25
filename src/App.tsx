import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  Archive, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Clock3, FolderOpen,
  Grid2X2, Heart, History, Home, LayoutList, Menu, Pencil, Plus, Search,
  Settings, Sun, Trash2, X,
} from 'lucide-react'
import './App.css'

type ContentType = 'Video' | 'Text' | 'Course' | 'PDF' | 'Image'
type Status = 'Not started' | 'In progress' | 'Completed' | 'Paused'

type Collection = {
  id: string
  name: string
  description: string
  cover: string
  color: string
}

type CollectionDraft = Omit<Collection, 'id'>

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
  mediaDataUrl?: string
  channelName?: string
  duration?: string
}

const initialCollections: Collection[] = [
  { id: 'art-visual-culture', name: 'Art & Visual Culture', description: 'Works, ideas, and visual references from across art history.', cover: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=900&q=85', color: '#59634c' },
  { id: 'study-of-cities', name: 'A Study of Cities', description: 'Architecture, urban life, and the places that shape us.', cover: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=85', color: '#7c493d' },
]
const maxImageSizeBytes = 1_000_000
const fallbackImage = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85'

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
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('renasentir-collections')
    return saved ? JSON.parse(saved) : initialCollections
  })
  const [myDay, setMyDay] = useState<string[]>(() => JSON.parse(localStorage.getItem('renasentir-my-day') || '["1","3","4","6"]'))
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null)
  const [storageError, setStorageError] = useState('')
  const [collectionStorageError, setCollectionStorageError] = useState('')
  const [collectionModalOpen, setCollectionModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem('renasentir-library', JSON.stringify(items))
      setStorageError('')
    } catch {
      setStorageError('Your library could not be saved. Browser storage may be full; remove large images and try again.')
    }
  }, [items])
  useEffect(() => {
    try {
      localStorage.setItem('renasentir-collections', JSON.stringify(collections))
    } catch {
      setCollectionStorageError('Your collections could not be saved. Browser storage may be full.')
    }
  }, [collections])
  useEffect(() => localStorage.setItem('renasentir-my-day', JSON.stringify(myDay)), [myDay])

  const openCollectionEditor = (collection: Collection | null = null) => {
    setEditingCollection(collection)
    setCollectionModalOpen(true)
  }

  const filtered = items.filter(item =>
    `${item.title} ${item.description} ${item.category} ${item.author}`.toLowerCase().includes(search.toLowerCase())
  )

  const toggleFavorite = (id: string) => setItems(current =>
    current.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item)
  )

  const toggleMyDay = (id: string) => setMyDay(current =>
    current.includes(id) ? current.filter(value => value !== id) : [...current, id]
  )

  const addItemToCollection = (itemId: string, collectionName: string) => {
    setItems(current => current.map(item => item.id === itemId
      ? { ...item, collection: collectionName }
      : item))
  }

  const addItem = (item: Omit<LibraryItem, 'id' | 'createdAt' | 'status' | 'favorite'>) => {
    setItems(current => [{
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Not started',
      favorite: false,
    }, ...current])
  }

  const saveCollection = (draft: CollectionDraft, collectionId?: string) => {
    setCollectionStorageError('')
    const existing = collectionId ? collections.find(collection => collection.id === collectionId) : undefined
    const savedCollection: Collection = {
      ...draft,
      id: existing?.id || crypto.randomUUID(),
    }

    if (existing) {
      setCollections(current => current.map(collection => collection.id === existing.id ? savedCollection : collection))
      if (existing.name !== savedCollection.name) {
        setItems(current => current.map(item => item.collection === existing.name
          ? { ...item, collection: savedCollection.name }
          : item))
      }
    } else {
      setCollections(current => [...current, savedCollection])
    }
    return savedCollection
  }

  const deleteCollection = (collection: Collection) => {
    setCollectionStorageError('')
    setCollections(current => current.filter(value => value.id !== collection.id))
    setItems(current => current.map(item => item.collection === collection.name
      ? { ...item, collection: null }
      : item))
    if (page === collection.name) setPage('Collections')
    setDeletingCollection(null)
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
          <div className="nav-heading"><button className="nav-label nav-section-button" onClick={() => setPage('Collections')}>My collections</button><button aria-label="Create collection" onClick={() => openCollectionEditor()}><Plus size={15} /></button></div>
          <button className={`collection-link ${page === 'Collections' ? 'active' : ''}`} onClick={() => setPage('Collections')}><FolderOpen size={15} />All collections</button>
          {collections.map(collection => (
            <button key={collection.id} className={`collection-link ${page === collection.name ? 'active' : ''}`} onClick={() => setPage(collection.name)}>
              <span className="collection-dot" style={{ backgroundColor: collection.color }} />{collection.name}
            </button>
          ))}
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
          {page === 'Collections'
            ? <button className="add-button" onClick={() => openCollectionEditor()}><Plus size={17} />Add Collection</button>
            : <button className="add-button" onClick={() => setModalOpen(true)}><Plus size={17} />Add content</button>}
        </header>
        {(storageError || collectionStorageError) && <p className="storage-error" role="alert">{storageError || collectionStorageError}</p>}

        {page === 'Home' ? (
          <HomePage items={items} myDay={myDay} onNavigate={setPage} onFavorite={toggleFavorite} onAdd={() => setModalOpen(true)} onOpen={setSelectedItem} />
        ) : page === 'Collections' ? (
          <CollectionsPage
            collections={collections}
            items={items}
            onOpen={collection => setPage(collection.name)}
            onEdit={collection => openCollectionEditor(collection)}
            onDelete={collection => setDeletingCollection(collection)}
          />
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
            onOpen={setSelectedItem}
            collections={collections}
          />
        ) : page === 'My Day' ? (
          <MyDayPage items={items.filter(item => myDay.includes(item.id))} onOpen={setSelectedItem} />
        ) : (
          <LibraryPage
            key={page}
            title={page}
            items={collections.some(collection => collection.name === page) ? filtered.filter(item => item.collection === page) : filtered}
            view={view}
            setView={setView}
            onFavorite={toggleFavorite}
            onMyDay={toggleMyDay}
            myDay={myDay}
            onOpen={setSelectedItem}
            collections={collections}
            libraryItems={filtered}
            collection={collections.find(value => value.name === page)}
            onAddToCollection={addItemToCollection}
            onEditCollection={openCollectionEditor}
            onDeleteCollection={collection => setDeletingCollection(collection)}
          />
        )}
      </main>

      {modalOpen && <AddContentModal onClose={() => setModalOpen(false)} onAdd={addItem} collections={collections} onSaveCollection={saveCollection} />}
      {collectionModalOpen && (
        <CollectionEditorModal
          key={editingCollection?.id || 'new-collection'}
          initialCollection={editingCollection}
          collections={collections}
          onSave={saveCollection}
          onClose={() => setCollectionModalOpen(false)}
        />
      )}
      {deletingCollection && <DeleteCollectionModal collection={deletingCollection} onCancel={() => setDeletingCollection(null)} onConfirm={() => deleteCollection(deletingCollection)} />}
      {selectedItem && <ContentViewerModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  )
}

function CollectionsPage({ collections, items, onOpen, onEdit, onDelete }: {
  collections: Collection[]
  items: LibraryItem[]
  onOpen: (collection: Collection) => void
  onEdit: (collection: Collection) => void
  onDelete: (collection: Collection) => void
}) {
  return (
    <div className="page collections-page">
      <div className="page-heading">
        <div><p className="eyebrow">Gathered with intention</p><h1>My Collections</h1></div>
        <span className="collection-count">{collections.length} collections</span>
      </div>
      {collections.length === 0 ? (
        <div className="empty-state"><BookOpen size={38} /><h2>Your shelves are waiting</h2><p>Create a collection to bring related discoveries together.</p></div>
      ) : (
        <div className="collection-grid">
          {collections.map(collection => {
            const count = items.filter(item => item.collection === collection.name).length
            return (
              <article className="collection-card" key={collection.id}>
                <button className="content-open-overlay" onClick={() => onOpen(collection)} aria-label={`Open ${collection.name}`} />
                <div className="collection-card-cover" style={{ backgroundColor: collection.color }}>
                  {collection.cover ? <img src={collection.cover} alt="" /> : <BookOpen size={34} strokeWidth={1.2} />}
                  <span>{count} {count === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="collection-card-copy">
                  <h2>{collection.name}</h2>
                  <p>{collection.description || 'A personal gathering of related content.'}</p>
                </div>
                <div className="collection-card-actions">
                  <button className="square-button" onClick={() => onEdit(collection)} aria-label={`Edit ${collection.name}`}><Pencil size={15} /></button>
                  <button className="square-button" onClick={() => onDelete(collection)} aria-label={`Delete ${collection.name}`}><Trash2 size={15} /></button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CollectionEditorModal({ initialCollection, collections, onSave, onClose, onSaved }: {
  initialCollection: Collection | null
  collections: Collection[]
  onSave: (draft: CollectionDraft, collectionId?: string) => Collection
  onClose: () => void
  onSaved?: (collection: Collection) => void
}) {
  const [name, setName] = useState(initialCollection?.name || '')
  const [description, setDescription] = useState(initialCollection?.description || '')
  const [cover, setCover] = useState(initialCollection?.cover || '')
  const [color, setColor] = useState(initialCollection?.color || '#59634c')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Enter a collection name.')
      return
    }

    const duplicate = collections.some(collection =>
      collection.id !== initialCollection?.id && collection.name.trim().toLocaleLowerCase() === trimmedName.toLocaleLowerCase()
    )
    if (duplicate) {
      setError('A collection with this name already exists.')
      return
    }

    const safeCover = getSafeUrl(cover.trim())
    if (cover.trim() && !safeCover) {
      setError('Enter a valid HTTP or HTTPS cover image URL.')
      return
    }

    const saved = onSave({
      name: trimmedName,
      description: description.trim(),
      cover: safeCover?.href || '',
      color,
    }, initialCollection?.id)
    onSaved?.(saved)
    onClose()
  }

  return (
    <div className="modal-backdrop collection-editor-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal collection-editor-modal" role="dialog" aria-modal="true" aria-labelledby="collection-editor-title">
        <div className="modal-header">
          <div><p className="eyebrow">Make room for a new thread</p><h2 id="collection-editor-title">{initialCollection ? 'Edit collection' : 'Create a collection'}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close collection editor"><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <label>Collection name<input autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Renaissance gardens" maxLength={60} required /></label>
          <label>Description<textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="What brings these materials together?" rows={3} /></label>
          <label>Cover image URL<input type="url" value={cover} onChange={event => setCover(event.target.value)} placeholder="https://..." /></label>
          <label>Accent color<select value={color} onChange={event => setColor(event.target.value)}>
            <option value="#59634c">Olive</option><option value="#7c493d">Wine</option><option value="#9b7546">Aged gold</option><option value="#5d7180">Slate blue</option>
          </select></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button"><Plus size={16} />{initialCollection ? 'Save changes' : 'Create collection'}</button></div>
        </form>
      </section>
    </div>
  )
}

function DeleteCollectionModal({ collection, onCancel, onConfirm }: {
  collection: Collection
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="modal-backdrop collection-editor-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onCancel() }}>
      <section className="modal delete-collection-modal" role="dialog" aria-modal="true" aria-labelledby="delete-collection-title">
        <div className="modal-header"><div><p className="eyebrow">Collection settings</p><h2 id="delete-collection-title">Delete collection?</h2></div><button className="icon-button" onClick={onCancel} aria-label="Close delete confirmation"><X size={18} /></button></div>
        <div className="delete-collection-copy"><p><strong>{collection.name}</strong> will be removed. Its contents will stay in My Library and become uncollected.</p></div>
        <div className="modal-actions"><button className="secondary-button" onClick={onCancel}>Cancel</button><button className="danger-button" onClick={onConfirm}><Trash2 size={15} />Delete collection</button></div>
      </section>
    </div>
  )
}

function HomePage({ items, myDay, onNavigate, onFavorite, onAdd, onOpen }: {
  items: LibraryItem[]
  myDay: string[]
  onNavigate: (page: string) => void
  onFavorite: (id: string) => void
  onAdd: () => void
  onOpen: (item: LibraryItem) => void
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
              <button key={item.id} className={`day-preview-row ${index === 0 ? 'complete' : ''}`} onClick={() => onOpen(item)}>
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
                <button className="content-open-overlay" onClick={() => onOpen(item)} aria-label={`Open ${item.title}`} />
                <div className="recent-image"><img src={item.image} alt="" /><span>{item.type}</span></div>
                <h3>{item.title}</h3>
                <p>{item.category}</p>
                <ContentTags item={item} />
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
              <button className="content-open-overlay" onClick={() => onOpen(item)} aria-label={`Open ${item.title}`} />
              <img src={item.image} alt={item.title} />
              <div className="mosaic-overlay"><span className="mosaic-category">{item.category}</span><h3>{item.title}</h3><ContentTags item={item} /></div>
              <button className={`card-heart ${item.favorite ? 'active' : ''}`} onClick={() => onFavorite(item.id)} aria-label="Favorite"><Heart size={16} fill={item.favorite ? 'currentColor' : 'none'} /></button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function LibraryPage({ title, items, view, setView, onFavorite, onMyDay, myDay, onOpen, collections, libraryItems, collection, onAddToCollection, onEditCollection, onDeleteCollection }: {
  title: string
  items: LibraryItem[]
  view: 'grid' | 'list'
  setView: (view: 'grid' | 'list') => void
  onFavorite: (id: string) => void
  onMyDay: (id: string) => void
  myDay: string[]
  onOpen: (item: LibraryItem) => void
  collections: Collection[]
  libraryItems?: LibraryItem[]
  collection?: Collection
  onAddToCollection?: (itemId: string, collectionName: string) => void
  onEditCollection?: (collection: Collection) => void
  onDeleteCollection?: (collection: Collection) => void
}) {
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [collectionFilter, setCollectionFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [suggestionPage, setSuggestionPage] = useState(0)
  const collectionSuggestions = collection
    ? (libraryItems || []).filter(item => !item.collection?.trim())
    : []
  const suggestionPageCount = Math.ceil(collectionSuggestions.length / 20)
  const currentSuggestionPage = Math.min(suggestionPage, Math.max(suggestionPageCount - 1, 0))
  const pagedSuggestions = collectionSuggestions.slice(currentSuggestionPage * 20, currentSuggestionPage * 20 + 20)
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
        <div><p className="eyebrow">{collection?.description || (title === 'My Library' ? 'Personal collection' : 'Curated view')}</p><h1>{title}</h1></div>
        <div className="page-heading-actions">
          {collection && onEditCollection && <button className="secondary-button collection-edit-button" onClick={() => onEditCollection(collection)}><Pencil size={15} />Edit collection</button>}
          {collection && onDeleteCollection && <button className="square-button collection-delete-button" onClick={() => onDeleteCollection(collection)} aria-label={`Delete ${collection.name}`}><Trash2 size={16} /></button>}
          <div className="view-toggle">
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view"><Grid2X2 size={17} /></button>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view"><LayoutList size={18} /></button>
          </div>
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
          {collections.map(value => <option key={value.id}>{value.name}</option>)}
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
              <button className="content-open-overlay" onClick={() => onOpen(item)} aria-label={`Open ${item.title}`} />
              <div className="card-image"><img src={item.image} alt={item.title} /><span className="type-pill">{item.type}</span><button className={`card-heart ${item.favorite ? 'active' : ''}`} onClick={() => onFavorite(item.id)} aria-label="Favorite"><Heart size={16} fill={item.favorite ? 'currentColor' : 'none'} /></button></div>
              <div className="card-copy"><p>{item.category}</p><h3>{item.title}</h3><div className="card-meta"><span className={`status-dot ${item.status.toLowerCase().replaceAll(' ', '-')}`} />{item.status}<button onClick={() => onMyDay(item.id)} aria-label="Add to My Day" className={myDay.includes(item.id) ? 'in-day' : ''}><Plus size={14} /></button></div><ContentTags item={item} /></div>
            </article>
          ))}
        </div>
      ) : (
        <div className="content-feed">
          {visibleItems.map(item => (
            <article className="feed-row" key={item.id}>
              <button className="content-open-overlay" onClick={() => onOpen(item)} aria-label={`Open ${item.title}`} />
              <img src={item.image} alt="" />
              <div className="feed-copy"><p>{item.category} · {item.type}</p><h3>{item.title}</h3><span>{item.description}</span><ContentTags item={item} /></div>
              <div className="feed-status"><span className={`status-dot ${item.status.toLowerCase().replaceAll(' ', '-')}`} />{item.status}</div>
              <button className={`square-button ${myDay.includes(item.id) ? 'in-day' : ''}`} onClick={() => onMyDay(item.id)} aria-label="Add to My Day"><Plus size={16} /></button>
              <button className={`square-button ${item.favorite ? 'favorite' : ''}`} onClick={() => onFavorite(item.id)} aria-label="Favorite"><Heart size={16} fill={item.favorite ? 'currentColor' : 'none'} /></button>
            </article>
          ))}
        </div>
      )}
      {collection && (
        <section className="collection-suggestions" aria-labelledby="collection-suggestions-title">
          <div className="collection-suggestions-heading">
            <div>
              <p className="eyebrow">From My Library</p>
              <h2 id="collection-suggestions-title">Add to {collection.name}</h2>
              <p>Choose an uncollected item to add it to this collection.</p>
            </div>
            <span>{collectionSuggestions.length} available</span>
          </div>
          {pagedSuggestions.length === 0 ? (
            <p className="collection-suggestions-empty">No uncollected items are available in My Library.</p>
          ) : (
            <div className="library-grid collection-suggestion-grid">
              {pagedSuggestions.map(item => (
                <article className="content-card" key={item.id}>
                  <button className="content-open-overlay" onClick={() => onOpen(item)} aria-label={`Open ${item.title}`} />
                  <div className="card-image"><img src={item.image} alt={item.title} /><span className="type-pill">{item.type}</span></div>
                  <div className="card-copy">
                    <p>{item.category}</p>
                    <h3>{item.title}</h3>
                    <div className="card-meta"><span className={`status-dot ${item.status.toLowerCase().replaceAll(' ', '-')}`} />{item.status}</div>
                    <ContentTags item={item} />
                    <button
                      className="add-suggestion-button"
                      aria-label={`Add ${item.title} to ${collection.name}`}
                      onClick={() => onAddToCollection?.(item.id, collection.name)}
                    ><Plus size={14} />Add to collection</button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {suggestionPageCount > 1 && (
            <nav className="collection-pagination" aria-label="Library suggestions pages">
              <button aria-label="Previous page" disabled={currentSuggestionPage === 0} onClick={() => setSuggestionPage(currentSuggestionPage - 1)}><ChevronLeft size={16} /></button>
              <span>Page {currentSuggestionPage + 1} of {suggestionPageCount}</span>
              <button aria-label="Next page" disabled={currentSuggestionPage >= suggestionPageCount - 1} onClick={() => setSuggestionPage(currentSuggestionPage + 1)}><ChevronRight size={16} /></button>
            </nav>
          )}
        </section>
      )}
    </div>
  )
}

function MyDayPage({ items, onOpen }: { items: LibraryItem[]; onOpen: (item: LibraryItem) => void }) {
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
            <button className="content-open-overlay" onClick={() => onOpen(item)} aria-label={`Open ${item.title}`} />
            <button className="day-checkbox" onClick={() => setCompleted(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])} aria-label="Mark complete">{completed.includes(item.id) && <Check size={15} />}</button>
            <img src={item.image} alt="" />
            <div className="day-item-copy"><p>{item.category}</p><h3>{item.title}</h3><ContentTags item={item} /></div>
            <span className="day-duration">{item.duration || 'Flexible'}</span>
            <button className="drag-handle" aria-label="Reorder">⠿</button>
          </article>
        ))}
      </div>
    </div>
  )
}

function getSafeUrl(value?: string) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null
  } catch {
    return null
  }
}

function getYouTubeVideoId(value?: string) {
  const url = getSafeUrl(value)
  if (!url) return null

  let videoId = ''
  if (url.hostname === 'youtu.be') {
    videoId = url.pathname.slice(1)
  } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
    videoId = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] || ''
  }

  return /^[\w-]{11}$/.test(videoId) ? videoId : null
}

function getYouTubeEmbedUrl(value?: string) {
  const videoId = getYouTubeVideoId(value)
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null
}

function getYouTubeThumbnailUrl(value?: string) {
  const videoId = getYouTubeVideoId(value)
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
}

async function fetchYouTubeChannelName(value: string) {
  const videoId = getYouTubeVideoId(value)
  if (!videoId) return null

  const endpoint = new URL('https://www.youtube.com/oembed')
  endpoint.searchParams.set('url', `https://www.youtube.com/watch?v=${videoId}`)
  endpoint.searchParams.set('format', 'json')
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error(`YouTube metadata request failed (${response.status}).`)

  const metadata: unknown = await response.json()
  if (typeof metadata !== 'object' || metadata === null || !('author_name' in metadata)) return null
  return typeof metadata.author_name === 'string' && metadata.author_name.trim()
    ? metadata.author_name.trim()
    : null
}

function getVideoChannelName(item: LibraryItem) {
  if (item.type !== 'Video') return null
  const channelName = item.channelName || (item.author !== 'Personal archive' ? item.author : null)
  if (!channelName) return null
  const characters = Array.from(channelName)
  if (characters.length <= 40) return channelName

  const cutoff = characters.slice(0, 39).join('')
  const wordBoundary = cutoff.lastIndexOf(' ')
  const shortened = wordBoundary > 0 ? cutoff.slice(0, wordBoundary) : cutoff
  return `${shortened.trimEnd()}…`
}

function ContentTags({ item }: { item: LibraryItem }) {
  const channelName = getVideoChannelName(item)
  const collection = item.collection?.trim()
  if (!channelName && !collection) return null

  return (
    <div className="content-tags">
      {collection && <span className="content-tag">{collection}</span>}
      {collection && channelName && <span className="tag-separator" aria-hidden="true" />}
      {channelName && <span className="content-tag">{channelName}</span>}
    </div>
  )
}

function readImageAsDataUrl(file: File) {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!supportedTypes.includes(file.type)) {
    return Promise.reject(new Error('Choose a JPG, PNG, WEBP, or GIF image.'))
  }
  if (file.size > maxImageSizeBytes) {
    return Promise.reject(new Error('Images must be 1 MB or smaller for browser storage.'))
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('The image could not be read.'))
    }
    reader.onerror = () => reject(new Error('The image could not be read.'))
    reader.readAsDataURL(file)
  })
}

function ContentViewerModal({ item, onClose }: { item: LibraryItem; onClose: () => void }) {
  const sourceUrl = getSafeUrl(item.originalUrl)
  const youtubeUrl = item.type === 'Video' ? getYouTubeEmbedUrl(item.originalUrl) : null
  const isPdf = item.type === 'PDF' && sourceUrl && /\.pdf$/i.test(sourceUrl.pathname)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="modal-backdrop viewer-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="viewer-modal" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
        <header className="viewer-header">
          <div><p className="eyebrow">{item.category} · {item.type}</p><h2 id="viewer-title">{item.title}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close content viewer"><X size={19} /></button>
        </header>
        <div className="viewer-body">
          <div className="viewer-stage">
            {youtubeUrl ? (
              <iframe src={youtubeUrl} title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            ) : isPdf && sourceUrl ? (
              <iframe src={sourceUrl.href} title={item.title} />
            ) : item.type === 'Image' ? (
              <img src={item.mediaDataUrl || item.image} alt={item.title} />
            ) : (
              <div className="viewer-placeholder">
                <img src={item.image} alt="" />
                <span>{item.type === 'Video' ? 'Video preview' : item.type === 'PDF' ? 'PDF preview' : 'Reading view'}</span>
              </div>
            )}
          </div>
          <aside className="viewer-details">
            <p className="eyebrow">From your library</p>
            <h3>{item.title}</h3>
            <p className="viewer-description">{item.description}</p>
            <dl><div><dt>Source</dt><dd>{item.author}</dd></div><div><dt>Status</dt><dd>{item.status}</dd></div>{item.duration && <div><dt>Duration</dt><dd>{item.duration}</dd></div>}</dl>
            {sourceUrl && <a className="primary-button source-link" href={sourceUrl.href} target="_blank" rel="noreferrer">Open original source <ArrowRight size={15} /></a>}
          </aside>
        </div>
      </section>
    </div>
  )
}

function AddContentModal({ onClose, onAdd, collections, onSaveCollection }: {
  onClose: () => void
  onAdd: (item: Omit<LibraryItem, 'id' | 'createdAt' | 'status' | 'favorite'>) => void
  collections: Collection[]
  onSaveCollection: (draft: CollectionDraft, collectionId?: string) => Collection
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<ContentType>('Text')
  const [collection, setCollection] = useState('')
  const [previewMode, setPreviewMode] = useState<'automatic' | 'custom'>('automatic')
  const [customCoverUrl, setCustomCoverUrl] = useState('')
  const [customCoverData, setCustomCoverData] = useState('')
  const [imageData, setImageData] = useState('')
  const [imageError, setImageError] = useState('')
  const [metadataNotice, setMetadataNotice] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [collectionEditorOpen, setCollectionEditorOpen] = useState(false)

  const loadImageFile = (event: ChangeEvent<HTMLInputElement>, onLoad: (dataUrl: string) => void) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    setImageError('')
    void readImageAsDataUrl(file)
      .then(onLoad)
      .catch(error => setImageError(error instanceof Error ? error.message : 'The image could not be read.'))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void saveContent()
  }

  const saveContent = async () => {
    setImageError('')
    const originalUrl = getSafeUrl(url.trim())
    const customUrl = getSafeUrl(customCoverUrl.trim())

    if (!title.trim()) {
      setImageError('Enter a title for this content.')
      return
    }
    if (url.trim() && !originalUrl) {
      setImageError('Enter a valid HTTP or HTTPS content link.')
      return
    }
    if (type === 'Image' && !imageData) {
      setImageError('Upload the image you want to save to your library.')
      return
    }
    if (previewMode === 'custom' && !customCoverData && !customUrl) {
      setImageError('Upload a custom preview image or paste a direct image URL.')
      return
    }

    setIsSaving(true)
    setMetadataNotice('')
    let channelName: string | undefined
    let notice = ''
    if (type === 'Video' && originalUrl) {
      if (getYouTubeVideoId(originalUrl.href)) {
        try {
          channelName = await fetchYouTubeChannelName(originalUrl.href) || undefined
          if (!channelName) notice = 'The YouTube channel name was unavailable; the video was saved without a channel tag.'
        } catch {
          notice = 'Could not retrieve the YouTube channel name; the video was saved without a channel tag.'
        }
      } else {
        notice = 'Channel tags are retrieved automatically for YouTube videos only.'
      }
    }

    const automaticPreview = type === 'Image'
      ? imageData
      : type === 'Video'
        ? getYouTubeThumbnailUrl(originalUrl?.href) || fallbackImage
        : fallbackImage
    const customPreview = customCoverData || customUrl?.href

    onAdd({
      title: title.trim(),
      description: 'A new discovery added to your personal library.',
      type,
      category: 'Unsorted',
      author: channelName || 'Personal archive',
      channelName,
      image: previewMode === 'custom' ? customPreview || automaticPreview : automaticPreview,
      collection: collection || null,
      originalUrl: originalUrl?.href,
      mediaDataUrl: type === 'Image' && previewMode === 'custom' ? imageData : undefined,
    })
    setMetadataNotice(notice)
    setTitle('')
    setUrl('')
    setCollection('')
    setType('Text')
    setPreviewMode('automatic')
    setCustomCoverUrl('')
    setCustomCoverData('')
    setImageData('')
    setIsSaving(false)
  }

  const automaticPreview = type === 'Image'
    ? imageData || fallbackImage
    : type === 'Video'
      ? getYouTubeThumbnailUrl(url) || fallbackImage
      : fallbackImage
  const customPreview = customCoverData || getSafeUrl(customCoverUrl)?.href || automaticPreview
  const currentPreview = previewMode === 'custom' ? customPreview : automaticPreview

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title">
        <div className="modal-header"><div><p className="eyebrow">Expand the collection</p><h2 id="add-title">Add content</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <form onSubmit={submit}>
          <label>Paste a link or enter a title<input value={url} onChange={event => { setUrl(event.target.value); setMetadataNotice('') }} placeholder="https://..." /></label>
          <label>Title<input value={title} onChange={event => setTitle(event.target.value)} placeholder="What did you discover?" required /></label>
          <div className="form-row"><label>Type<select value={type} onChange={event => setType(event.target.value as ContentType)}><option>Text</option><option>Video</option><option>Course</option><option>PDF</option><option>Image</option></select></label><label>Collection<select value={collection} onChange={event => {
            if (event.target.value === '__create_collection__') {
              setCollectionEditorOpen(true)
              return
            }
            setCollection(event.target.value)
          }}><option value="">Choose later</option>{collections.map(value => <option key={value.id} value={value.name}>{value.name}</option>)}<option value="__create_collection__">Create new...</option></select></label></div>
          {type === 'Image' && <label>Image to save<input key={imageData ? 'image-selected' : 'image-empty'} type="file" accept="image/jpeg,image/png,image/webp,image/gif" required={!imageData} onChange={event => loadImageFile(event, setImageData)} /></label>}
          <label>Card preview<select value={previewMode} onChange={event => setPreviewMode(event.target.value as 'automatic' | 'custom')}><option value="automatic">Automatic preview</option><option value="custom">Use a custom image</option></select></label>
          {previewMode === 'custom' && <div className="custom-preview-fields">
            <label>Custom image URL<input type="url" value={customCoverUrl} onChange={event => setCustomCoverUrl(event.target.value)} placeholder="https://.../image.jpg" /></label>
            <label>Or upload a custom image<input key={customCoverData ? 'cover-selected' : 'cover-empty'} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => loadImageFile(event, setCustomCoverData)} /></label>
          </div>}
          <div className="cover-preview"><img src={currentPreview} alt="Selected card preview" /><span>Card preview</span></div>
          {imageError && <p className="form-error" role="alert">{imageError}</p>}
          {isSaving && <p className="form-notice" role="status">Retrieving YouTube channel details…</p>}
          {metadataNotice && <p className="form-notice" role="status">{metadataNotice}</p>}
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}><Plus size={16} />{isSaving ? 'Saving…' : 'Save to library'}</button></div>
        </form>
      </section>
      {collectionEditorOpen && <CollectionEditorModal initialCollection={null} collections={collections} onSave={onSaveCollection} onClose={() => setCollectionEditorOpen(false)} onSaved={created => setCollection(created.name)} />}
    </div>
  )
}

export default App
