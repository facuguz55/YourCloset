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

  return dark
}
