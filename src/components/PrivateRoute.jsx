import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '@/store/auth'

export default function PrivateRoute({ children }) {
  const isAuth = useAuth(s => s.isAuthenticated())
  const location = useLocation()

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}
