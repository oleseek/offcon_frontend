import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import Contacts from './pages/Contacts';
import News from './pages/News';
import Privacy from './pages/Privacy';
import ServicesPage from './pages/ServicesPage';
import Reviews from './pages/Reviews';
import About from './pages/About';
import Projects from './pages/Projects';
import NewsDetail from './pages/NewsDetail';
import ProjectDetail from './pages/ProjectDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cabinet from './pages/Cabinet';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/news" element={<News />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cabinet" element={<PrivateRoute><Cabinet /></PrivateRoute>} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
