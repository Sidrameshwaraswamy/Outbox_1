import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '../ui';
import { apiClient } from '../../services/api';
import type { User } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [loginMethod, setLoginMethod] = useState<'form' | 'google'>('form');

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize Google One Tap or use Google Sign-In button
      // For now, we'll use the @react-oauth/google library
      // This will be triggered when the Google button is clicked
      window.google?.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large' }
      );
    } catch (err) {
      setError('Failed to initialize Google login. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Demo authentication - create a mock user and token
      const mockUser: User = {
        id: 'demo-user-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        avatar: 'DU',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      // Store demo token for API calls
      const demoToken = 'demo-token-' + Date.now();
      localStorage.setItem('auth_token', demoToken);

      // Call success callback
      onLoginSuccess(mockUser);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during login. Please try again.'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);

      if (response.credential) {
        const user = await apiClient.loginWithGoogle(response.credential);
        onLoginSuccess(user);
      } else {
        setError('Google login failed. Please try again.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during login. Please try again.'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'outline', size: 'large', width: '300' }
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [loginMethod]);

  return (
    <div className="login-screen">
      <div className="login-brand"><Mail size={18} /><span>ReachInbox</span></div>
      <div className="login-card">
          <h1>Login</h1>
          <p className="login-subtitle">Access your inbox workspace</p>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Login Method Tabs */}
          <div className="login-tabs">
            <button
              onClick={() => {
                setLoginMethod('form');
                setError(null);
              }}
              className={`login-tab ${
                loginMethod === 'form'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => {
                setLoginMethod('google');
                setError(null);
                handleGoogleLogin();
              }}
              className={`login-tab ${
                loginMethod === 'google'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Google OAuth
            </button>
          </div>

          {/* Email & Password Login Form */}
          {loginMethod === 'form' && (
            <>
              <form onSubmit={handleEmailPasswordLogin} className="login-form">
                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    className="login-input"
                    required
                  />
                </div>
                <div>
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    className="login-input"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  Login
                </Button>
              </form>

              <p className="login-hint">Use any email and a 6+ character password</p>
            </>
          )}

          {/* Google Sign-In Button */}
          {loginMethod === 'google' && (
            <div className="login-google">
              <div id="google-signin-button" />
              <p>
                Click the Google Sign-In button above to continue
              </p>
            </div>
          )}

          <p className="login-terms">By signing in, you agree to our Terms of Service.</p>
      </div>
      </div>
  );
};

// Extend window to include google
declare global {
  interface Window {
    google?: any;
  }
}
