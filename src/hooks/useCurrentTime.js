import { useState, useEffect } from 'react'

function format() {
  const now = new Date()
  const day = now.toLocaleDateString('en-US', { weekday: 'short' })
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day}, ${date} · ${time}`
}

export default function useCurrentTime() {
  const [label, setLabel] = useState(format)

  useEffect(() => {
    const id = setInterval(() => setLabel(format()), 60_000)
    return () => clearInterval(id)
  }, [])

  return label
}
