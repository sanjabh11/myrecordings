// src/pages/Login.jsx
import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import Header from '../components/layout/Header';

const Login = () => {
  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;