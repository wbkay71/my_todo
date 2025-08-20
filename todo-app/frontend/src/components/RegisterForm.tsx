import React, { useState } from 'react';

interface RegisterFormProps {
  onRegister: (userData: { email: string; password: string; name?: string }) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwörter stimmen nicht überein');
      return;
    }

    if (password.length < 6) {
      alert('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    if (email.trim() && password.trim()) {
      onRegister({ 
        email: email.trim(), 
        password,
        name: name.trim() || undefined
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Registrieren</h2>
      <div className="form-group">
        <label htmlFor="name">Name (optional):</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">E-Mail:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Passwort:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">Passwort bestätigen:</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <button type="submit" className="submit-button">
        Registrieren
      </button>
    </form>
  );
};

export default RegisterForm;
