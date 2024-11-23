// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import RecordingStudio from './pages/RecordingStudio';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AuthCallback from './pages/AuthCallback';
import SharePage from './pages/SharePage';
import './styles/main.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<RecordingStudio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/share/:userId/:recordingId" element={<SharePage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;