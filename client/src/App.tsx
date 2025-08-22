import './App.css';
import ShareFilePage from './pages/ShareFilePage';
import Navbar from './components/Navbar';
import { MantineProvider } from '@mantine/core';
import { Outlet, Route, Routes } from 'react-router-dom';
import PreviewFilePage from './pages/PreviewFilePage';
import FaqPage from './pages/FaqPage';


function Layout() {
  return (
    <div className="max-w-2xl w-full mx-auto p-4">
      <div className='mt-40'>
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <MantineProvider forceColorScheme='dark'>
      <Navbar />
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<ShareFilePage />} />
          <Route path='/faq' element={<FaqPage />} />
          <Route path='/file/:fileId' element={<PreviewFilePage />} />
        </Route>
      </Routes>
    </MantineProvider>
  )
}

export default App
