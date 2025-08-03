import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/home'
import Armar from './pages/armar'

function App() {
  

  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path='/armar' element={<Armar/>}/>
      </Routes>
    </>
  )
}

export default App
