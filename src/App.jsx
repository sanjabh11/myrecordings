import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import RecordingStudio from './pages/RecordingStudio';
import './styles/main.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<RecordingStudio />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;