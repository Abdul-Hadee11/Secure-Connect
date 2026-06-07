import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clapperboard, Plus, Trash2, Star, Check } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { db } from '../firebase/config.js';
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';

const MovieNights = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ title: '', note: '' });
  const [tab, setTab] = useState('watchlist');

  useEffect(() => {
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, s => setMovies(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => setMovies([]));
    return () => unsub();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addDoc(collection(db, 'movies'), {
      ...form, watched: false, rating: 0, author: user, createdAt: serverTimestamp()
    });
    setForm({ title: '', note: '' });
  };

  const markWatched = async (m) => updateDoc(doc(db, 'movies', m.id), { watched: !m.watched });
  const setRating = async (m, r) => updateDoc(doc(db, 'movies', m.id), { rating: r, watched: true });
  const remove = async (id) => deleteDoc(doc(db, 'movies', id));

  const filtered = movies.filter(m => tab === 'watchlist' ? !m.watched : m.watched);

  return (
    <>
      <PageHeader icon={Clapperboard} title="Movie Nights" subtitle="Cuddle-and-watch list." accent="#D9869A" />

      <form onSubmit={add} className="glass-card max-w-2xl mx-auto p-6 mb-6 flex flex-col sm:flex-row gap-3">
        <input className="input-soft flex-1" placeholder="Movie / show title" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} required />
        <input className="input-soft flex-1" placeholder="Optional note" value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })} />
        <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2"><Plus size={16} /> Add</button>
      </form>

      <div className="flex items-center justify-center gap-3 mb-6">
        <button onClick={() => setTab('watchlist')} className={`tab-pill ${tab === 'watchlist' ? 'active' : ''}`}>🎬 Watchlist</button>
        <button onClick={() => setTab('watched')} className={`tab-pill ${tab === 'watched' ? 'active' : ''}`}>✅ Watched</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Clapperboard} title={tab === 'watchlist' ? 'Nothing to watch yet' : 'Nothing watched yet'} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {filtered.map((m, i) => (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card p-5 group">
              <div className="flex items-start justify-between">
                <Clapperboard className="text-blush-400" size={22} />
                <button onClick={() => remove(m.id)} className="text-mauve-300 hover:text-rose-deep opacity-0 group-hover:opacity-100"><Trash2 size={15} /></button>
              </div>
              <h3 className="serif text-xl font-semibold text-rose-deep mt-2">{m.title}</h3>
              {m.note && <p className="handwritten text-lg text-mauve-500">{m.note}</p>}
              <div className="flex items-center gap-1 mt-3">
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={() => setRating(m, r)}>
                    <Star size={18} className={r <= (m.rating || 0) ? 'fill-blush-400 text-blush-400' : 'text-mauve-300'} />
                  </button>
                ))}
              </div>
              {!m.watched && (
                <button onClick={() => markWatched(m)} className="btn-soft mt-3 !py-1.5 !px-3 text-sm inline-flex items-center gap-1">
                  <Check size={13} /> Mark watched
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
};

export default MovieNights;
