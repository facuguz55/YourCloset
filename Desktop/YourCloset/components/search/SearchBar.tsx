'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  onFilterToggle: () => void
  filterActive?: boolean
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  onFilterToggle,
  filterActive,
  placeholder,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#AEAEB2' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Buscá camperas, vestidos...'}
          className="w-full pl-9 pr-9 outline-none transition-all"
          style={{
            height: '44px',
            backgroundColor: '#F5F5F7',
            borderRadius: '12px',
            fontSize: '15px',
            color: '#1D1D1F',
            border: '1px solid transparent',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#D2D2D7'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'transparent'
          }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: '#AEAEB2' }}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <button
        onClick={onFilterToggle}
        className="flex-none flex items-center justify-center transition-colors duration-200"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: filterActive ? '#0071E3' : '#F5F5F7',
          color: filterActive ? '#FFFFFF' : '#6E6E73',
        }}
      >
        <SlidersHorizontal size={18} />
      </button>
    </div>
  )
}
