import iconSun from './assets/icon-sun.svg'
import iconPartlyCloudy from './assets/image 5.png'
import iconOvercastFog from './assets/image 13.png'
import iconRain from './assets/image 7.png'
import iconDayShowers from './assets/Weather _))10 18.png'
import iconThunder from './assets/image 8.png'
import iconThunderRain from './assets/image 9.png'
import iconSnow from './assets/image 10.png'
import iconNightClear from './assets/image 19.png'
import iconNightPartlyCloudy from './assets/image 15.png'
import iconNightRain from './assets/image 16.png'
import iconNightThunder from './assets/image 17.png'
import iconNightSnow from './assets/image 18.png'

export function getWeatherIcon(code, isDay = true) {
  if (!isDay) {
    if (code <= 1)                        return iconNightClear
    if (code <= 3)                        return iconNightPartlyCloudy
    if (code === 45 || code === 48)       return iconOvercastFog
    if (code >= 51 && code <= 67)         return iconNightRain
    if (code >= 71 && code <= 86)         return iconNightSnow
    if (code >= 80 && code <= 82)         return iconNightRain
    if (code === 95)                      return iconNightThunder
    if (code >= 96)                       return iconNightThunder
    return iconNightClear
  }

  if (code === 0)                         return iconSun
  if (code === 1 || code === 2)           return iconPartlyCloudy
  if (code === 3)                         return iconOvercastFog
  if (code === 45 || code === 48)         return iconOvercastFog
  if (code >= 51 && code <= 67)           return iconRain
  if (code >= 71 && code <= 86)           return iconSnow
  if (code >= 80 && code <= 82)           return iconDayShowers
  if (code === 95)                        return iconThunder
  if (code >= 96)                         return iconThunderRain
  return iconPartlyCloudy
}
