import { Routes, Route } from 'react-router-dom'
import SignIn from './pages/SignIn'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="*" element={<h1>Not found</h1>} />
    </Routes>
  )
}

export default App
