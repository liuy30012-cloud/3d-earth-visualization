import { cities } from '../data/cities'
import type { CityFilter } from '../store/uiStore'

export function applyFilter(filter: CityFilter) {
  return (city: typeof cities[number]) => {
    if (filter.continent.length > 0 && !filter.continent.includes(city.continent)) return false
    if (filter.countries.length > 0 && !filter.countries.includes(city.country)) return false
    if (filter.populationRange[0] > 0 && city.population < filter.populationRange[0]) return false
    if (filter.populationRange[1] < Infinity && city.population > filter.populationRange[1]) return false
    return true
  }
}
