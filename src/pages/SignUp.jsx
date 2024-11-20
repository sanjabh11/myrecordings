// src/pages/SignUp.jsx
import React from 'react';
import SignUpForm from '../components/auth/SignUpForm';
import Header from '../components/layout/Header';

const SignUp = () => {
  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;