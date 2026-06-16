import { useState, useRef, useEffect } from 'react'
import iconPin from '../assets/icon-pin.svg'
import iconDropdown from '../assets/icon-dropdown.svg'
import { geocode } from '../utils/weather'
import './LocationPill.css'

export default function LocationPill({ display, onChangeLocation, className = '' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function onOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setError('')
      }
    }
    if (open) document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [open])

  async function handleSearch() {
    if (!query.trim()) return
    setError('')
    setLoading(true)
    try {
      const loc = await geocode(query.trim())
      setOpen(false)
      setQuery('')
      onChangeLocation?.(loc)
    } catch (e) {
      setError('Location not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`lpill-wrap ${className}`} ref={wrapRef}>
      <button
        type="button"
        className={`lpill ${open ? 'lpill-active' : ''}`}
        onClick={() => { setOpen(o => !o); setError('') }}
        aria-label="Change location"
        aria-expanded={open}
      >
        <img src={iconPin} alt="" aria-hidden="true" className="lpill-pin" />
        <span>{display}</span>
        <img
          src={iconDropdown}
          alt=""
          aria-hidden="true"
          className={`lpill-chevron ${open ? 'lpill-chevron-open' : ''}`}
        />
      </button>

      {open && (
        <div className="lpill-dropdown">
          <div className="lpill-search-row">
            <input
              ref={inputRef}
              className="lpill-input"
              type="text"
              placeholder="Search city…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearch()
                if (e.key === 'Escape') setOpen(false)
              }}
              disabled={loading}
            />
            <button
              type="button"
              className="lpill-go"
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              aria-label="Search"
            >
              {loading ? '…' : '→'}
            </button>
          </div>
          {error && <p className="lpill-error">{error}</p>}
        </div>
      )}
    </div>
  )
}
