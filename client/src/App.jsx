import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import ObjetsPage from './pages/Objets/index'
import ObjetDetail from './pages/Objets/ObjetDetail'
import ObjetForm from './pages/Objets/ObjetForm'
import DecisionPage from './pages/Decision/index'
import VendeursPage from './pages/Vendeurs/index'
import VendeurDetail from './pages/Vendeurs/VendeurDetail'
import VendeurForm from './pages/Vendeurs/VendeurForm'
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
            <Route index element={<Navigate to="/objets" replace />} />
            <Route path="objets" element={<ObjetsPage />} />
            <Route path="objets/nouveau" element={<ObjetForm />} />
            <Route path="objets/:id" element={<ObjetDetail />} />
            <Route path="objets/:id/modifier" element={<ObjetForm />} />
            <Route path="terrain" element={<DecisionPage />} />
            <Route path="vendeurs" element={<VendeursPage />} />
            <Route path="vendeurs/nouveau" element={<VendeurForm />} />
            <Route path="vendeurs/:id" element={<VendeurDetail />} />
            <Route path="vendeurs/:id/modifier" element={<VendeurForm />} />
            <Route path="preparation" element={<PreparationPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
