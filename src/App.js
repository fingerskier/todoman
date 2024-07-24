import React from 'react'
import {HREFProvider} from './lib/HREFContext'
import Header from './com/Header.js'
import Footer from './com/Footer.js'
import Home from './com/Home.js'

import './App.css'


function App() {
  return <HREFProvider>
    <Header />
    
    <Home />
    
    <Footer />
  </HREFProvider>
}

export default App;
