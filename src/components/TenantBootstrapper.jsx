// src/components/TenantBootstrapper.jsx
import { useEffect, useRef } from 'react'
import { bootstrapTenant } from '@/boot/tenant'

export default function TenantBootstrapper(){
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return    // evita reexecução fora do StrictMode
    ran.current = true
    bootstrapTenant()
  }, [])
  return null
}
