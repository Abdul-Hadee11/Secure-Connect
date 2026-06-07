import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Plus, Trash2, ExternalLink } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { db } from '../firebase/config.js';
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';

const MusicBox = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [form, setForm] = useState({ title: '', artist: '', link: '', note: '' });

  useEffect(() => {
    const q = query(collection(db, 'music'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, s => setSongs(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => setSongs([]));
    return () => unsub();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addDoc(collection(db, 'music'), { ...form, author: user, createdAt: serverTimestamp() });
    setForm({ title: '', artist: '', link: '', note: '' });
  };

  const remove = async (id) => deleteDoc(doc(db, 'music', id));

  return (
    <>
      <PageHeader icon={Music} title="Music Box" subtitle="The songs that sound like us." accent="#C9A9C0" />

      <form onSubmit={add} className="glass-card max-w-2xl mx-auto p-6 mb-8 grid sm:grid-cols-2 gap-3">
        <input className="input-soft" placeholder="Song title" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} required />
        <input className="input-soft" placeholder="Artist" value={form.artist}
          onChange={e => setForm({ ...form, artist: e.target.value })} />
        <input className="input-soft sm:col-span-2" placeholder="Spotify / YouTube link (optional)" value={form.link}
          onChange={e => setForm({ ...form, link: e.target.value })} />
        <input className="input-soft sm:col-span-2" placeholder="Why this song? 🎵" value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })} />
        <button type="submit" className="btn-primary sm:col-span-2 inline-flex items-center justify-center gap-2">
          <Plus size={16} /> Add to box
        </button>
      </form>

      {songs.length === 0 ? (
        <EmptyState icon={Music} title="The box is silent…" subtitle="Add the first song that sounds like us." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {songs.map((s, i) => (
            <motion.div key={s.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card p-5 group">
              <div className="flex items-start justify-between">
                <Music className="text-blush-400" size={22} />
                <button onClick={() => remove(s.id)} className="text-mauve-300 hover:text-rose-deep opacity-0 group-hover:opacity-100"><Trash2 size={15} /></button>
              </div>
              <h3 className="serif text-xl font-semibold text-rose-deep mt-2">{s.title}</h3>
              {s.artist && <p className="text-sm text-mauve-500">{s.artist}</p>}
              {s.note && <p className="handwritten text-lg text-mauve-500 mt-2">{s.note}</p>}
              {s.link && (
                <a href={s.link} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blush-500 mt-3 hover:underline">
                  <ExternalLink size={13} /> Listen
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
};

export default MusicBox;
