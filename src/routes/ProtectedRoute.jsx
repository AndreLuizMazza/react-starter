// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '@/store/auth'

export default function ProtectedRoute({ children }) {
  const user = useAuth(s => s.user)
  const location = useLocation()
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}