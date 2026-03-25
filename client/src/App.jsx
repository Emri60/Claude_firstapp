import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard/index'
import ObjetsPage from './pages/Objets/index'
import ObjetDetail from './pages/Objets/ObjetDetail'
import ObjetForm from './pages/Objets/ObjetForm'
import GestionPage from './pages/Gestion/index'
import PreparationPage from './pages/Preparation/index'

function ProtectedRoute({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="objets" element={<ObjetsPage />} />
            <Route path="objets/nouveau" element={<ObjetForm />} />
            <Route path="objets/:id" element={<ObjetDetail />} />
            <Route path="objets/:id/modifier" element={<ObjetForm />} />
            <Route path="gestion" element={<GestionPage />} />
            <Route path="preparation" element={<PreparationPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
