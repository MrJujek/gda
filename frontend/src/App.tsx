import { Routes, Route, BrowserRouter } from 'react-router-dom'
import SignIn from './pages/SignIn'
import NotFound from './pages/NotFound'
import Chat from './pages/Chat'
import Keys from './pages/Keys'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/keys' element={<Keys />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
