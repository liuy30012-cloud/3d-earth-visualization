import { useRef, useCallback, useEffect, useState } from 'react'
import { useUIStore } from '../../store/uiStore'
import { cities } from '../../data/cities'
import './SearchBar.css'

export function SearchBar() {
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const setSearchResults = useUIStore((s) => s.setSearchResults)
  const highlightedIndex = useUIStore((s) => s.highlightedIndex)
  const setHighlightedIndex = useUIStore((s) => s.setHighlightedIndex)
  const setSelectedCity = useUIStore((s) => s.setSelectedCity)
  const [compareMode, setCompareMode] = useState(false)
  const [focused, setFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([])
      return
    }
    const query = searchQuery.toLowerCase()
    const results = cities.filter(
      (c) => c.name.toLowerCase().includes(query) || c.country.toLowerCase().includes(query),
    )
    setSearchResults(results.slice(0, 10))
  }, [searchQuery, setSearchResults])

  const searchResults = useUIStore((s) => s.searchResults)
  const handleSelect = useCallback(
    (city: typeof cities[number]) => {
      setSearchQuery('')
      setSearchResults([])
      setHighlightedIndex(-1)
      if (compareMode) {
        window.dispatchEvent(
          new CustomEvent('compareCity', { detail: { city } }),
        )
      } else {
        setSelectedCity(city)
        window.dispatchEvent(
          new CustomEvent('cameraTarget', { detail: { city } }),
        )
      }
    },
    [setSearchQuery, setSearchResults, setHighlightedIndex, setSelectedCity, compareMode],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const count = searchResults.length
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < count - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : count - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
          handleSelect(searchResults[highlightedIndex])
        }
      } else if (e.key === 'Escape') {
        inputRef.current?.blur()
        setSearchQuery('')
        setSearchResults([])
      }
    },
    [searchResults, highlightedIndex, handleSelect, setHighlightedIndex, setSearchQuery, setSearchResults],
  )

  return (
    <div className="search-bar">
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder="搜索城市..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {focused && searchQuery.trim().length > 0 && searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map((city, i) => (
            <li
              key={`${city.name}-${city.country}`}
              className={`search-result-item ${i === highlightedIndex ? 'highlighted' : ''}`}
              onMouseDown={() => handleSelect(city)}
            >
              <span className="search-result-name">{city.name}</span>
              <span className="search-result-country">{city.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
