import React, { useState } from 'react';
import authService from '../services/authService';
import { useNavigate } from "react-router-dom";

function LoginForm(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Client-side validation function
  function validate() {
    const errors = [];
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Please enter a valid email.");
    if (!password || password.length < 8) errors.push("Password must be at least 8 characters.");
    return errors;
  }

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const errors = validate();
    if (errors.length) {
      setStatus({ type: 'error', messages: errors });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.outcome === 'success') {
        setStatus({ type: 'success', messages: [res.message] });
        // save token to localStorage (demo). In production prefer HttpOnly cookies.
        localStorage.setItem('token', res.token);
        navigate('/success');
      } else {
        setStatus({ type: 'error', messages: [res.message || 'Login failed'] });
      }
    } catch (err) {
      // display helpful messages for common outcomes
      if (err.response) {
        const data = err.response.data;
        if (data.outcome === 'account_locked') {
          setStatus({ type: 'error', messages: ['Account temporarily locked. Try again later.'] });
        } else if (err.response.status === 429) {
          setStatus({ type: 'error', messages: ['Too many attempts. Slow down.'] });
        } else if (data.errors) {
          setStatus({ type: 'error', messages: data.errors.map(e => e.msg) });
        } else {
          setStatus({ type: 'error', messages: [data.message || 'Invalid credentials'] });
        }
      } else {
        setStatus({ type: 'error', messages: ['Network error'] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {status && (
        <div className={`alert ${status.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
          {status.messages.map((m, i) => <div key={i}>{m}</div>)}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input type="email" className="form-control" value={email}
               onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
      </div>

      <div className="mb-3">
        <label className="form-label">Password</label>
        <input type="password" className="form-control" value={password}
               onChange={(e)=>setPassword(e.target.value)} placeholder="At least 8 characters" />
        <div className="form-text">Password should include uppercase, lowercase, digit and special char.</div>
      </div>

      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

export default LoginForm;
