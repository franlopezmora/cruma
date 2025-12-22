import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/home'
import LoginPage from './pages/login'
import SeleccionarMaterias from './pages/seleccionar-materias'
import Armar from './pages/armar'
import { Correlativas } from './pages/correlativas'
import Perfil from './pages/perfil'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'

function App() {
  

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path='/seleccionar-materias' element={<SeleccionarMaterias/>}/>
        <Route path='/armar' element={<Armar/>}/>
        <Route 
          path='/perfil' 
          element={
            <ProtectedRoute>
              <Perfil/>
            </ProtectedRoute>
          }
        />
        <Route path='/correlativas' element={<Correlativas/>}/>
      </Routes>
    </>
  )
}

export default App
