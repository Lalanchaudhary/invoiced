import React, { useEffect } from 'react';
import { BrowserRouter as Router, useRoutes, useNavigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { ToastContainer } from 'react-toastify'; // Import ToastContainer and toast

import OrganizationForm from './components/OrganizationForm';
import Chatbot from './components/Chatbot';
import { LanguageProvider } from './LanguageContext';

// Global Styles using Inter font
const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap');
  
  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

function AppRoutes() {
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If the user is logged in, redirect to dashboard when on login/signup
        if (["/login", "/signup"].includes(window.location.pathname)) {
          navigate('/dashboard');
        }
      } else {
        // If the user is not logged in, redirect to login for non-login/signup paths
        if (!["/login", "/signup"].includes(window.location.pathname)) {
          navigate('/login');
        }
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [auth, navigate]);

  // Define application routes
  return useRoutes([
    { path: "/", element: <Login /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    { path: "/dashboard/*", element: <Dashboard /> },
    { path: "/orgform", element: <OrganizationForm /> },
  ]);
}

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <Router>
          <ToastContainer /> 
          <GlobalStyles />
          <AppRoutes />
          <Chatbot />
        </Router>
      </div>
    </LanguageProvider>
  );
}

export default App;
