'use client'

import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const check = () =>
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')

    const stored = localStorage.getItem('yc-theme')
    if (stored === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
    check()

    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    localStorage.setItem('yc-theme', next ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
  }

  return { dark, toggle }
}
