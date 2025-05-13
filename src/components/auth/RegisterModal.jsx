import React, { useState } from 'react';

// --- SECURITY WARNING ---
// Hashing passwords on the client-side is generally NOT recommended.
// It does not provide the same level of security as proper server-side hashing
// (e.g., using bcrypt with salts). This implementation is provided based on
// the user request but should be carefully reviewed and ideally replaced
// with server-side hashing for production environments.
// -----------------------

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Define API_BASE - adjust as needed for production/local
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://bitstone-backend-b7ff3c04c40d.herokuapp.com/api'
  : 'http://localhost:5000/api';

const RegisterModal = ({ show, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Hashing password..."); // Debug log
      const passwordHash = await hashPassword(password);
      console.log("Password hashed (SHA-256):", passwordHash); // Debug log

      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: passwordHash }), // Send hash using key 'password'
      });

      const data = await response.json();

      if (!response.ok) {
        // Prioritize data.error if available, then data.message
        const errorMsg = data.error || data.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      console.log("Registration successful:", data); // Debug log
      setSuccess('Registration successful! You can now close this window.');
      // Store the token in localStorage
      if (data.token) {
        localStorage.setItem('sessionToken', data.token);
        console.log("Session token stored in localStorage"); // Debug log
      }
      setEmail(''); // Clear form on success
      setPassword('');

    } catch (err) {
      console.error("Registration error:", err); // Debug log
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[5000]"
      onClick={onClose} // Close on backdrop click
    >
      <div
        className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Register</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6" // Example: enforce minimum length
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-medium py-2.5 px-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal; 