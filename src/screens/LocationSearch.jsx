import { useState } from 'react'
import locationBg from '../assets/location-bg.png'
import iconSearch from '../assets/icon-search.svg'
import iconLocation from '../assets/icon-location.svg'
import { geocode, reverseGeocode } from '../utils/weather'
import './LocationSearch.css'

export default function LocationSearch({ onNext }) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setError('')
    setLoading(true)
    try {
      const loc = await geocode(query.trim())
      onNext?.(loc)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  async function handleGeolocate() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setError('')
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const loc = await reverseGeocode(coords.latitude, coords.longitude)
          onNext?.(loc)
        } catch {
          setError('Could not determine your location.')
          setLoading(false)
        }
      },
      () => {
        setError('Location access denied.')
        setLoading(false)
      }
    )
  }

  const content = (
    <>
      <h1 className="loc-heading">Where are you?</h1>
      <p className="loc-subtitle">
        Search for a city, neighbourhood,
        <br />
        or zip code.
      </p>

      <div className="loc-search-box" role="search">
        <input
          className="loc-search-input"
          type="text"
          placeholder="Search location"
          aria-label="Search location"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <button
          type="button"
          aria-label="Search"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
          onClick={handleSearch}
          disabled={loading}
        >
          <img className="loc-search-icon" src={iconSearch} alt="" aria-hidden="true" />
        </button>
      </div>

      {error && <p className="loc-error">{error}</p>}

      <button type="button" className="loc-btn" onClick={handleGeolocate} disabled={loading}>
        <img src={iconLocation} alt="" aria-hidden="true" />
        <span>{loading ? 'Loading…' : 'Use my current location'}</span>
      </button>
    </>
  )

  return (
    <main className="loc-page" aria-label="Location search">
      <img className="loc-bg" src={locationBg} alt="" aria-hidden="true" />
      <section className="loc-mobile">{content}</section>
      <section className="loc-desktop">{content}</section>
    </main>
  )
}
