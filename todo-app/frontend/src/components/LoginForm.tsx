import React, { useState, useEffect } from 'react';

interface LoginFormProps {
  onLogin: (credentials: { email: string; password: string; rememberMe?: boolean }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // E-Mail aus dem localStorage laden (falls vorhanden)
  useEffect(() => {
    const savedEmail = localStorage.getItem('lastEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      // E-Mail für zukünftige Logins speichern (sicher)
      localStorage.setItem('lastEmail', email.trim());
      onLogin({ email: email.trim(), password, rememberMe });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Anmelden</h2>
      <div className="form-group">
        <label htmlFor="email">E-Mail:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Passwort:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span className="checkbox-text">Angemeldet bleiben (30 Tage)</span>
        </label>
      </div>
      <button type="submit" className="submit-button">
        Anmelden
      </button>
    </form>
  );
};

export default LoginForm;
