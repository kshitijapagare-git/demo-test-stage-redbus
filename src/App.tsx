import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import BookingPage from './pages/BookingPage'
import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </>
  )
}

export default App
