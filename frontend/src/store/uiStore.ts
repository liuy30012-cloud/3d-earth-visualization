import { create } from 'zustand'
import type { City } from '../data/cities'

interface UIState {
  selectedCity: City | null
  setSelectedCity: (city: City | null) => void
  layers: {
    borders: boolean
    markers: boolean
    flylines: boolean
    heatmap: boolean
  }
  toggleLayer: (layer: keyof UIState['layers']) => void
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedCity: null,
  setSelectedCity: (city) => set({ selectedCity: city }),
  layers: {
    borders: true,
    markers: true,
    flylines: false,
    heatmap: false,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
  showLoginModal: false,
  setShowLoginModal: (show) => set({ showLoginModal: show }),
}))
