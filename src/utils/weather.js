const WMO = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  56: 'Freezing drizzle', 57: 'Heavy freezing drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  66: 'Freezing rain', 67: 'Heavy freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Light showers', 81: 'Rain showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
}

export async function geocode(name) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
  )
  const data = await res.json()
  if (!data.results?.length) throw new Error(`No location found for "${name}"`)
  const r = data.results[0]
  const display = r.admin1 ? `${r.name}, ${r.admin1}` : `${r.name}, ${r.country_code}`
  return { display, lat: r.latitude, lon: r.longitude }
}

export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    const a = data.address ?? {}
    const city = a.city || a.town || a.village || a.county || 'Your location'
    const region = a.state || a.country || ''
    return { display: region ? `${city}, ${region}` : city, lat, lon }
  } catch {
    return { display: 'Your location', lat, lon }
  }
}

export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,precipitation_probability,is_day',
    hourly: 'temperature_2m,weather_code,is_day,relative_humidity_2m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
    forecast_days: 7,
    timezone: 'auto',
    wind_speed_unit: 'mph',
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error('Weather fetch failed')
  return res.json()
}

function formatHour(timeStr) {
  const hour = parseInt(timeStr.split('T')[1], 10)
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

function avg(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

// Returns the worst-severity WMO code from an array
function worstCode(codes) {
  const severity = c => {
    if (c >= 95) return 5
    if (c >= 80) return 4
    if (c >= 61) return 3
    if (c >= 51) return 2
    if (c >= 45) return 1
    return 0
  }
  return codes.reduce((w, c) => severity(c) >= severity(w) ? c : w, codes[0])
}

// Build a "conditions snapshot" from daily indices (for tomorrow/weekend scoring)
function buildDailySnapshot(raw, indices) {
  const d = raw.daily
  const codes = indices.map(i => d.weather_code[i])
  const code = worstCode(codes)

  const avgTemp = Math.round(avg(
    indices.map(i => (d.temperature_2m_max[i] + d.temperature_2m_min[i]) / 2)
  ))
  const maxPrecip = Math.round(Math.max(...indices.map(i => d.precipitation_probability_max[i] ?? 0)))
  const maxWind = Math.round(Math.max(...indices.map(i => d.wind_speed_10m_max[i] ?? 0)))
  const maxUV = Math.round(Math.max(...indices.map(i => d.uv_index_max[i] ?? 0)))

  // Compute avg humidity for those days from hourly data
  let humidity = 55 // fallback
  const dayDates = indices.map(i => d.time[i])
  const humidityReadings = raw.hourly.time.reduce((acc, t, i) => {
    if (dayDates.some(date => t.startsWith(date))) {
      acc.push(raw.hourly.relative_humidity_2m[i])
    }
    return acc
  }, [])
  if (humidityReadings.length > 0) humidity = Math.round(avg(humidityReadings))

  return {
    temp: avgTemp,
    feelsLike: avgTemp - 2,
    condition: WMO[code] ?? 'Unknown',
    weatherCode: code,
    windSpeed: maxWind,
    humidity,
    precipProb: maxPrecip,
    uvIndex: maxUV,
    isDay: true,
  }
}

export function parseWeather(raw) {
  const c = raw.current
  const uvIndex = raw.daily?.uv_index_max?.[0] ?? 0

  const currentHour = c.time.slice(0, 13)
  const nowIdx = Math.max(0, raw.hourly.time.findIndex(t => t.startsWith(currentHour)))

  const hourly = Array.from({ length: 5 }, (_, i) => {
    const idx = nowIdx + i
    return {
      time: i === 0 ? 'Now' : formatHour(raw.hourly.time[idx] ?? ''),
      temp: Math.round(raw.hourly.temperature_2m[idx] ?? c.temperature_2m),
      code: raw.hourly.weather_code[idx] ?? c.weather_code,
      isDay: (raw.hourly.is_day?.[idx] ?? c.is_day) === 1,
    }
  })

  // Tomorrow: daily index 1
  const tomorrow = raw.daily?.time?.length > 1
    ? buildDailySnapshot(raw, [1])
    : null

  // Weekend: find upcoming Saturday (6) and Sunday (0) within 7 days
  const weekendIndices = (raw.daily?.time ?? []).reduce((acc, dateStr, i) => {
    const day = new Date(dateStr + 'T12:00:00').getDay()
    if (day === 0 || day === 6) acc.push(i)
    return acc
  }, [])
  const weekend = weekendIndices.length > 0
    ? buildDailySnapshot(raw, weekendIndices)
    : null

  // Full 24h hourly from now
  const hourlyFull = Array.from({ length: 24 }, (_, i) => {
    const idx = nowIdx + i
    if (idx >= raw.hourly.time.length) return null
    return {
      time: i === 0 ? 'Now' : formatHour(raw.hourly.time[idx]),
      temp: Math.round(raw.hourly.temperature_2m[idx] ?? c.temperature_2m),
      code: raw.hourly.weather_code[idx] ?? c.weather_code,
      isDay: (raw.hourly.is_day?.[idx] ?? c.is_day) === 1,
    }
  }).filter(Boolean)

  // 7-day daily
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dailyForecast = (raw.daily?.time ?? []).map((dateStr, i) => {
    const d = new Date(dateStr + 'T12:00:00')
    const code = raw.daily.weather_code[i]
    return {
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[d.getDay()],
      date: dateStr,
      code,
      condition: WMO[code] ?? 'Unknown',
      tempMax: Math.round(raw.daily.temperature_2m_max[i]),
      tempMin: Math.round(raw.daily.temperature_2m_min[i]),
      precipProb: Math.round(raw.daily.precipitation_probability_max[i] ?? 0),
      windMax: Math.round(raw.daily.wind_speed_10m_max[i] ?? 0),
      uvIndex: Math.round(raw.daily.uv_index_max[i] ?? 0),
    }
  })

  return {
    current: {
      temp: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      condition: WMO[c.weather_code] ?? 'Unknown',
      weatherCode: c.weather_code,
      windSpeed: Math.round(c.wind_speed_10m),
      humidity: Math.round(c.relative_humidity_2m),
      precipProb: Math.round(c.precipitation_probability ?? 0),
      uvIndex: Math.round(uvIndex),
      isDay: c.is_day === 1,
    },
    hourly,
    hourlyFull,
    dailyForecast,
    tomorrow,
    weekend,
  }
}

const ACTIVITY_RANGES = {
  run:    [5,  18],
  walk:   [5,  22],
  bike:   [8,  24],
  party:  [16, 28],
  canoe:  [15, 30],
  swim:   [22, 35],
  golf:   [12, 26],
  fish:   [10, 24],
  camp:   [10, 25],
  sport:  [8,  24],
  garden: [10, 28],
  water:  [8,  32],
  other:  [12, 25],
}

function detectActivity(query) {
  const q = query.toLowerCase()
  // Plant watering — check before 'garden' to catch "water my plants"
  if (/\b(water|watering)\b.{0,30}\b(plant|plants|garden|zucchini|flower|flowers|vegetable|vegetables|herb|herbs|lawn|grass)\b/.test(q)) return 'water'
  if (/\b(plant|plants|zucchini|flower|flowers|vegetable|vegetables|herb|herbs)\b.{0,20}\b(water|watering)\b/.test(q)) return 'water'
  if (/\bshould i water\b/.test(q)) return 'water'
  // Running / hiking
  if (/\b(run|jog|jogging|running|hike|hiking|trek|trekking)\b/.test(q)) return 'run'
  // Walking
  if (/\b(walk|walking|stroll|strolling)\b/.test(q)) return 'walk'
  // Biking
  if (/\b(bike|biking|bicycle|cycling|cycle|commute by bike)\b/.test(q)) return 'bike'
  // Parties / outdoor events / picnics
  if (/\b(party|bbq|barbecue|gathering|festival|birthday|celebration|picnic|cookout)\b/.test(q)) return 'party'
  // Water sports
  if (/\b(canoe|kayak|paddle|paddling|rowing|row|raft|rafting|sailing|sail)\b/.test(q)) return 'canoe'
  // Swimming
  if (/\b(swim|swimming|pool|beach)\b/.test(q)) return 'swim'
  // Golf
  if (/\b(golf|golfing)\b/.test(q)) return 'golf'
  // Fishing
  if (/\b(fish|fishing|angling)\b/.test(q)) return 'fish'
  // Camping
  if (/\b(camp|camping|tent|bonfire)\b/.test(q)) return 'camp'
  // Sports / games
  if (/\b(soccer|football|basketball|tennis|volleyball|badminton|frisbee|sport|sports|game|match|practice)\b/.test(q)) return 'sport'
  // General gardening
  if (/\b(garden|gardening|mow|mowing|lawn|plant|planting|dig|digging|weed|weeding)\b/.test(q)) return 'garden'
  return 'other'
}

function detectTimeContext(query) {
  const q = query.toLowerCase()
  if (/\b(weekend|this weekend|saturday|sunday)\b/.test(q)) return 'weekend'
  if (/\b(tomorrow)\b/.test(q)) return 'tomorrow'
  return 'now'
}

function tempRating(temp, activity) {
  const [min, max] = ACTIVITY_RANGES[activity]
  if (temp >= min && temp <= max) return 'Ideal'
  if (temp >= min - 5 && temp <= max + 5) return 'Good'
  if (temp >= min - 10 && temp <= max + 10) return 'Fair'
  return 'Poor'
}

function precipRating(prob) {
  if (prob <= 10) return 'Great'
  if (prob <= 30) return 'Good'
  if (prob <= 60) return 'Fair'
  return 'Poor'
}

function windRating(speed) {
  if (speed <= 10) return 'Ideal'
  if (speed <= 20) return 'Good'
  if (speed <= 30) return 'Fair'
  return 'Poor'
}

function humidityRating(h) {
  if (h <= 40) return 'Ideal'
  if (h <= 60) return 'Good'
  if (h <= 75) return 'Fair'
  return 'Poor'
}

function uvRating(uv) {
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  return 'Very High'
}

export function scoreQuery(query, weather) {
  const activity = detectActivity(query)
  const timeContext = detectTimeContext(query)

  const conditions =
    timeContext === 'weekend' && weather.weekend ? weather.weekend :
    timeContext === 'tomorrow' && weather.tomorrow ? weather.tomorrow :
    weather.current

  const timeLabel =
    timeContext === 'weekend' ? 'this weekend' :
    timeContext === 'tomorrow' ? 'tomorrow' :
    'today'

  const { temp, precipProb, windSpeed, humidity, uvIndex, weatherCode } = conditions
  const [tMin, tMax] = ACTIVITY_RANGES[activity]

  let score = 10
  const issues = []
  const positives = []

  // Precipitation / storms
  if (weatherCode >= 95) {
    score -= 5; issues.push('thunderstorms')
  } else if (weatherCode >= 61 && weatherCode < 95) {
    score -= 3; issues.push('rain')
  } else if (weatherCode >= 51) {
    score -= 1.5; issues.push('light drizzle')
  } else if (precipProb > 60) {
    score -= 1.5; issues.push('a high chance of rain')
  } else if (precipProb <= 10) {
    positives.push('no rain')
  }

  // Temperature
  if (temp < tMin - 10 || temp > tMax + 10) {
    score -= 2.5
    issues.push(temp < tMin ? 'very cold temperatures' : 'extreme heat')
  } else if (temp < tMin - 3) {
    score -= 1; issues.push('cool temperatures')
  } else if (temp > tMax + 3) {
    score -= 1; issues.push('warm temperatures')
  } else if (temp >= tMin && temp <= tMax) {
    positives.push('ideal temperature')
  }

  // Wind
  if (windSpeed > 30) {
    score -= 2; issues.push('strong winds')
  } else if (windSpeed > 20) {
    score -= 1; issues.push('wind')
  } else if (windSpeed <= 10) {
    positives.push('light wind')
  }

  // Humidity — applies to strenuous or heat-sensitive activities
  const humidSensitive = ['run', 'walk', 'bike', 'sport', 'garden', 'other']
  if (humidSensitive.includes(activity)) {
    if (humidity > 80) {
      score -= 1.5; issues.push('high humidity')
    } else if (humidity > 65) {
      score -= 0.5
    } else if (humidity <= 50) {
      positives.push('low humidity')
    }
  }

  if (uvIndex > 8) score -= 0.5

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10))
  const tier = score >= 7 ? 'high' : score >= 5 ? 'mid' : 'low'

  const ANSWERS = {
    run:    { high: 'Go for it!',        mid: 'Should be fine',     low: 'Maybe skip it'       },
    walk:   { high: 'Great day for it!', mid: 'Should be fine',     low: 'Maybe stay in'       },
    bike:   { high: 'Ride on!',          mid: 'Should be okay',     low: 'Maybe drive instead' },
    party:  { high: 'Party on!',         mid: 'Should work',        low: 'Move it inside'      },
    canoe:  { high: 'Paddle away!',      mid: 'Probably okay',      low: 'Stay ashore'         },
    swim:   { high: 'Dive in!',          mid: 'Might be okay',      low: 'Too cold for it'     },
    golf:   { high: 'Tee it up!',        mid: 'Should be playable', low: 'Maybe reschedule'    },
    fish:   { high: 'Cast away!',        mid: 'Should be okay',     low: 'Rough day for it'    },
    camp:   { high: 'Set up camp!',      mid: 'Should be okay',     low: 'Maybe stay home'     },
    sport:  { high: 'Game on!',          mid: 'Should be okay',     low: 'Maybe reschedule'    },
    garden: { high: 'Perfect for it!',   mid: 'Should be okay',     low: 'Maybe hold off'      },
    water:  { high: 'Water them!',       mid: 'Maybe a little',     low: 'Rain will do it'     },
    other:  { high: 'Go for it!',        mid: 'Should be okay',     low: 'Maybe not'           },
  }
  const answer = ANSWERS[activity]?.[tier] ?? ANSWERS.other[tier]

  const actLabel = {
    run:    'running',
    walk:   'a walk',
    bike:   'cycling',
    party:  'an outdoor event',
    canoe:  'paddling',
    swim:   'swimming',
    golf:   'golf',
    fish:   'fishing',
    camp:   'camping',
    sport:  'outdoor sports',
    garden: 'gardening',
    water:  'watering your plants',
    other:  'outdoor activities',
  }[activity] ?? 'outdoor activities'

  let description
  if (activity === 'water') {
    if (tier === 'high') {
      description = `Dry conditions ${timeLabel} — a good time to water your plants.`
    } else if (tier === 'mid') {
      description = precipProb > 40
        ? `Some rain possible ${timeLabel}, but an early watering could still help.`
        : `Conditions are okay ${timeLabel} — check soil moisture before watering.`
    } else {
      description = weatherCode >= 61
        ? `Rain is on the way ${timeLabel} — no need to water, nature's got it.`
        : `High chance of rain ${timeLabel}, so hold off on watering for now.`
    }
  } else if (issues.length === 0) {
    const pos = positives.slice(0, 2).join(' and ')
    description = pos
      ? `${pos.charAt(0).toUpperCase() + pos.slice(1)} make for great ${actLabel} conditions ${timeLabel}.`
      : `Conditions look great for ${actLabel} ${timeLabel}.`
  } else if (score >= 7) {
    const pos = positives[0] || 'Decent conditions'
    description = `${pos.charAt(0).toUpperCase() + pos.slice(1)} ${timeLabel}, though watch out for ${issues[0]}.`
  } else {
    description = `${issues[0].charAt(0).toUpperCase() + issues[0].slice(1)} may affect your plans ${timeLabel}.`
  }

  const stats = [
    { label: 'Temperature',   value: `${temp}°C`,       rating: tempRating(temp, activity) },
    { label: 'Precipitation', value: `${precipProb}%`,  rating: precipRating(precipProb) },
    { label: 'Wind',          value: `${windSpeed} mph`, rating: windRating(windSpeed) },
    { label: 'Humidity',      value: `${humidity}%`,    rating: humidityRating(humidity) },
    { label: 'UV Index',      value: `${uvIndex}`,      rating: uvRating(uvIndex) },
  ]

  return { answer, tier, score, description, stats, activity }
}
