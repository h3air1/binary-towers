import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Doctors } from './pages/Doctors'
import { Cabinet } from './pages/Cabinet'
import { About } from './pages/About'
import { Services } from './pages/Services'
import { Contacts } from './pages/Contacts'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index           element={<Home />} />
            <Route path="doctors"  element={<Doctors />} />
            <Route path="cabinet"  element={<Cabinet />} />
            <Route path="about"    element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="*"        element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
