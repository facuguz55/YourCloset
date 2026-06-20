'use client'

function SearchSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function FilterSVG({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#FFFFFF' : '#6E6E73'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  )
}

function XSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <SearchSVG />
        </span>
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
          <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <XSvg />
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
        <FilterSVG active={filterActive} />
      </button>
    </div>
  )
}
