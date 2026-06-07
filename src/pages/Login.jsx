import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login, COUPLE } = useAuth();
  const navigate = useNavigate();
  const [who, setWho] = useState('him');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const ok = login(password.trim(), who);
    if (ok) navigate('/');
    else setError('Hmm, that doesn\'t match our secret 💔 Try again, love.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-card w-full max-w-md p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <Heart className="mx-auto text-blush-500 animate-pulse-heart mb-3" size={48} fill="#F58A9C" />
          <h1 className="title-script text-5xl mb-1">Hadee &amp; Mehak</h1>
          <p className="handwritten text-xl text-mauve-500">Our little corner of the universe ✨</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {['him','her'].map(k => {
            const p = COUPLE[k];
            const active = who === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setWho(k)}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${active ? 'border-blush-400 bg-blush-100/60 shadow-petal' : 'border-blush-100 bg-white/50'}`}
              >
                <div className="text-xs uppercase tracking-wider text-mauve-300">I am</div>
                <div className="serif text-xl font-semibold" style={{ color: p.color }}>{p.name}</div>
                <div className="text-xs text-mauve-500">{k === 'him' ? '💙 him' : '💕 her'}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blush-400" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Our secret word…"
              className="input-soft !pl-10"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-rose-deep handwritten text-lg">{error}</p>}
          <button type="submit" className="btn-primary w-full">Unlock our garden 🌷</button>
        </form>

        <p className="text-center text-xs text-mauve-300 mt-6">
          Only the two of us know the words to open this door.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
