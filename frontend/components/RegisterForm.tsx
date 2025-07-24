import React, { useState } from 'react';
import { Colors } from '../constants.ts';

interface RegisterFormProps {
  onRegisterSubmit: (username: string, email: string, pass: string) => Promise<void>;
  onSwitchToLogin: () => void;
  onGoogleLogin: () => Promise<void>; 
  isLoading: boolean;
  error: string | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSubmit, onSwitchToLogin, onGoogleLogin, isLoading, error }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }
    onRegisterSubmit(username, email, password);
  };

  const googleButtonIcon = (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> 
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      <path d="M1 1h22v22H1z" fill="none"/>
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5"> 
      <div>
        <label htmlFor="reg-username" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}> 
          Username
        </label>
        <input
          id="reg-username" name="username" type="text" autoComplete="username" required
          value={username} onChange={(e) => setUsername(e.target.value)}
          className="input-base" disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}> 
          Email address
        </label>
        <input
          id="reg-email" name="email" type="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="input-base" disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}> 
          Password
        </label>
        <input
          id="reg-password" name="password" type="password" autoComplete="new-password" required
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="input-base" disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="reg-confirm-password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}> 
          Confirm Password
        </label>
        <input
          id="reg-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-base" disabled={isLoading}
        />
      </div>

      {(error || formError) && (
        <p className="text-xs text-center py-2 px-3 rounded-md" style={{ color: 'var(--color-accent-danger)', backgroundColor: `var(--color-accent-danger)1A`}}>{error || formError}</p>
      )}

      <div>
        <button
          type="submit" disabled={isLoading}
          className="btn btn-primary w-full flex justify-center py-3 px-4"
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </div>

      <div className="relative my-2"> 
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t" style={{borderColor: 'var(--color-glass-border)'}}></div>
        </div>
        <div className="relative flex justify-center text-xs"> 
          <span className="px-2" style={{backgroundColor: 'var(--color-glass-bg)', color: 'var(--color-text-secondary)'}}>
            Or
          </span>
        </div>
      </div>

      <div>
        <button
          type="button" onClick={onGoogleLogin} disabled={isLoading}
          className="btn btn-secondary w-full flex items-center justify-center py-2.5 px-4"
        >
          {googleButtonIcon}
          Sign up with Google
        </button>
      </div>

      <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}> 
        Already have an account?{' '}
        <button
          type="button" onClick={onSwitchToLogin}
          className={`font-medium hover:underline focus:outline-none focus:ring-1 focus:ring-offset-1 rounded`}
          style={{ color: 'var(--color-primary-dark)' }}
          disabled={isLoading}
        >
          Login
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;