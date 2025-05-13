import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- SECURITY WARNING REPEATED ---
// Hashing passwords client-side, even for login, is not standard secure practice.
// Verification should ideally happen server-side comparing against a securely stored hash.
// --------------------------------

// Re-define hash function (ideally import from a shared util)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Define API_BASE - adjust as needed for production/local
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://bitstone-backend-b7ff3c04c40d.herokuapp.com/api'
  : 'http://localhost:5000/api';

const LoginModal = ({ show, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login for:", email);
      // Hash the password before sending
      console.log("Hashing password for login...");
      const passwordHash = await hashPassword(password);
      console.log("Hashed password for login:", passwordHash);

      const response = await fetch(`${API_BASE}/login`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the HASHED password using the key 'password'
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: passwordHash }), 
      });

      const data = await response.json();

      if (!response.ok) {
        // Prioritize data.error if available, then data.message
        const errorMsg = data.error || data.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      console.log("Login successful:", data);
      if (data.token) {
        localStorage.setItem('sessionToken', data.token);
        console.log("Session token stored in localStorage");
        onClose(); // Close modal on success
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        throw new Error('Login successful, but no token received.');
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Login failed. Please check credentials or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithoutLogin = () => {
    onClose(); // Close the modal
    navigate('/dashboard'); // Navigate to dashboard
  };

  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[5000]"
      onClick={onClose} 
    >
      <div
        className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Login</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="login-email" // Use unique id
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="login-password" // Use unique id
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mb-3 bg-gradient-to-r from-primary to-secondary text-white font-medium py-2.5 px-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /* ... */ >
                <circle /* ... */></circle>
                <path /* ... */></path>
              </svg>
            ) : (
              'Login'
            )}
          </button>
          
          {/* Continue without login button */}
          <button
            type="button"
            onClick={handleContinueWithoutLogin}
            className="w-full bg-gray-100 text-gray-700 font-medium py-2.5 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Continue without login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal; 