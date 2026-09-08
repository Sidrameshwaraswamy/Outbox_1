import React, { useEffect, useState } from 'react';
import { LoginPage } from './components/pages/LoginPage';
import { Dashboard } from './components/pages/Dashboard';
import { LoadingSpinner } from './components/ui';
import { apiClient } from './services/api';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const loggedInUser = await apiClient.getMe();
          if (loggedInUser) {
            setUser(loggedInUser);
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  return isLoggedIn && user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <LoginPage onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;
