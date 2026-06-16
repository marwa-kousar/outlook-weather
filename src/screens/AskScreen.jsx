import { useState } from 'react'
import iconRun from '../assets/icon-run.svg'
import LocationPill from '../components/LocationPill'
import iconBike from '../assets/icon-bike.svg'
import iconParty from '../assets/icon-party.svg'
import iconCanoe from '../assets/icon-canoe.svg'
import './AskScreen.css'

const SUGGESTIONS = [
  { id: 1, icon: iconRun,   text: 'Is today a good day for a run?',           lines: 1 },
  { id: 2, icon: iconBike,  text: 'Should I bike to work?',                   lines: 1 },
  { id: 3, icon: iconParty, text: 'Is this weekend good for an outdoor party?', lines: 2 },
  { id: 4, icon: iconCanoe, text: 'Is this now a good time to go canoeing?',   lines: 2 },
]

export default function AskScreen({ onResult, location, onChangeLocation, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery)

  function handleSubmit(text) {
    const q = text ?? query
    if (q.trim()) onResult?.(q.trim())
  }

  const pill = (
    <LocationPill
      display={location?.display || 'Toronto, ON'}
      onChangeLocation={onChangeLocation}
      className="ask-pill"
    />
  )

  const inputEl = (
    <div className="ask-input-wrap">
      <input
        className="ask-input"
        type="text"
        placeholder="Ask about any outdoor activity..."
        aria-label="Ask about any outdoor activity"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <button className="ask-send" aria-label="Send" onClick={() => handleSubmit()}>
        <svg viewBox="0 0 17 14.73" fill="none" className="ask-send-icon" aria-hidden="true">
          <path d="M16.707 8.071a1 1 0 0 0 0-1.414L10.343.293a1 1 0 1 0-1.414 1.414L14.586 7.364 8.929 13.021a1 1 0 1 0 1.414 1.414l6.364-6.364ZM0 7.364v2h16v-2H0Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  )

  const chips = (cls) => (
    <div className={`ask-chips ${cls}`}>
      {SUGGESTIONS.map((s, i) => (
        <button
          key={s.id}
          type="button"
          className={`ask-chip ask-chip-${i + 1}`}
          onClick={() => handleSubmit(s.text)}
        >
          <img src={s.icon} alt="" aria-hidden="true" className="ask-chip-icon" />
          <span>{s.text}</span>
        </button>
      ))}
    </div>
  )

  const layout = (
    <>
      {pill}
      <h1 className="ask-heading">What would you<br />like to know?</h1>
      <p className="ask-subtitle">Ask anything about the weather<br />or your outdoor plans.</p>
      {inputEl}
      <p className="ask-try-label">Try asking</p>
      {chips('')}
    </>
  )

  const desktopLayout = (
    <>
      {pill}
      <div className="ask-d-grid">
        <div className="ask-d-left">
          <h1 className="ask-heading">What would you<br />like to know?</h1>
          <p className="ask-subtitle">Ask anything about the weather<br />or your outdoor plans.</p>
          {inputEl}
        </div>
        <div className="ask-d-right">
          <p className="ask-try-label">Try asking</p>
          {chips('ask-d-chips')}
        </div>
      </div>
    </>
  )

  return (
    <main className="ask-page" aria-label="Ask about outdoor activities">
      <div className="ask-mobile">{layout}</div>
      <div className="ask-desktop">{desktopLayout}</div>
    </main>
  )
}
