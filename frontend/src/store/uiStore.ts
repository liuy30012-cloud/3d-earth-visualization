import { create } from 'zustand'
import type { City } from '../data/cities'

const STORAGE_KEY = 'earth3d-ui-config'

interface PersistedConfig {
  layers: { borders: boolean; markers: boolean; flylines: boolean; heatmap: boolean; barchart: boolean; dayNight: boolean }
  filter: { continent: string[]; countries: string[]; populationRange: [number, number] }
  earthTheme: 'satellite' | 'dark' | 'terrain'
}

function loadConfig(): Partial<PersistedConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveConfig(state: {
  layers: { borders: boolean; markers: boolean; flylines: boolean; heatmap: boolean; barchart: boolean; dayNight: boolean }
  filter: { continent: string[]; countries: string[]; populationRange: [number, number] }
  earthTheme: 'satellite' | 'dark' | 'terrain'
}) {
  const config: PersistedConfig = {
    layers: state.layers,
    filter: state.filter,
    earthTheme: state.earthTheme,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export interface CityFilter {
  continent: string[]
  countries: string[]
  populationRange: [number, number]
}

const DEFAULT_FILTER: CityFilter = {
  continent: [],
  countries: [],
  populationRange: [0, Infinity],
}

const saved = loadConfig()

interface UIState {
  selectedCity: City | null
  setSelectedCity: (city: City | null) => void
  layers: {
    borders: boolean
    markers: boolean
    flylines: boolean
    heatmap: boolean
    barchart: boolean
    dayNight: boolean
  }
  toggleLayer: (layer: keyof UIState['layers']) => void
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: City[]
  setSearchResults: (results: City[]) => void
  highlightedIndex: number
  setHighlightedIndex: (index: number) => void
  filter: CityFilter
  setFilter: (filter: Partial<CityFilter>) => void
  resetFilter: () => void
  flylineMode: boolean
  setFlylineMode: (enabled: boolean) => void
  customFlylineStart: City | null
  setCustomFlylineStart: (city: City | null) => void
  customFlylineEnd: City | null
  setCustomFlylineEnd: (city: City | null) => void
  loadingProgress: number
  setLoadingProgress: (progress: number) => void
  isLoaded: boolean
  setIsLoaded: (loaded: boolean) => void
  earthTheme: 'satellite' | 'dark' | 'terrain'
  setEarthTheme: (theme: 'satellite' | 'dark' | 'terrain') => void
}

export const useUIStore = create<UIState>((set, get) => ({
  selectedCity: null,
  setSelectedCity: (city) => set({ selectedCity: city }),
  layers: {
    borders: saved.layers?.borders ?? true,
    markers: saved.layers?.markers ?? true,
    flylines: saved.layers?.flylines ?? false,
    heatmap: saved.layers?.heatmap ?? false,
    barchart: saved.layers?.barchart ?? false,
    dayNight: saved.layers?.dayNight ?? false,
  },
  toggleLayer: (layer) =>
    set((state) => {
      const next = { layers: { ...state.layers, [layer]: !state.layers[layer] } }
      saveConfig({ ...state, ...next })
      return next
    }),
  showLoginModal: false,
  setShowLoginModal: (show) => set({ showLoginModal: show }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query, highlightedIndex: -1 }),
  setSearchResults: (results) => set({ searchResults: results, highlightedIndex: -1 }),
  highlightedIndex: -1,
  setHighlightedIndex: (index) => set({ highlightedIndex: index }),
  filter: saved.filter ?? DEFAULT_FILTER,
  setFilter: (partial) =>
    set((state) => {
      const next = { filter: { ...state.filter, ...partial } }
      saveConfig({ ...state, ...next })
      return next
    }),
  resetFilter: () => set({ filter: { ...DEFAULT_FILTER } }),
  flylineMode: false,
  setFlylineMode: (enabled) => set({ flylineMode: enabled, customFlylineStart: null, customFlylineEnd: null }),
  customFlylineStart: null,
  setCustomFlylineStart: (city) => set({ customFlylineStart: city }),
  customFlylineEnd: null,
  setCustomFlylineEnd: (city) => set({ customFlylineEnd: city }),
  loadingProgress: 0,
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  isLoaded: false,
  setIsLoaded: (loaded) => set({ isLoaded: loaded }),
  earthTheme: saved.earthTheme ?? 'satellite',
  setEarthTheme: (theme) => set((state) => {
    saveConfig({ ...state, earthTheme: theme })
    return { earthTheme: theme }
  }),
}))
