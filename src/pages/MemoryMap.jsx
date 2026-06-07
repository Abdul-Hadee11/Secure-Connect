import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Plus, X, MapPin, Trash2, Calendar } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { db } from '../firebase/config.js';
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';

const MemoryMap = () => {
  const { user } = useAuth();
  const [pins, setPins] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ place: '', date: '', story: '' });

  useEffect(() => {
    const q = query(collection(db, 'map_pins'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, s => setPins(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => setPins([]));
    return () => unsub();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.place.trim()) return;
    await addDoc(collection(db, 'map_pins'), {
      ...form, author: user, createdAt: serverTimestamp()
    });
    setForm({ place: '', date: '', story: '' });
    setOpen(false);
  };

  const remove = async (id) => {
    if (confirm('Remove this pin?')) await deleteDoc(doc(db, 'map_pins', id));
  };

  return (
    <>
      <PageHeader icon={Map} title="Memory Map" subtitle="Every place that holds a piece of us." accent="#9C8EC7" />

      <div className="text-center mb-8">
        <button onClick={() => setOpen(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} /> Pin a place
        </button>
      </div>

      {pins.length === 0 ? (
        <EmptyState icon={MapPin} title="The map is empty…" subtitle="Pin your first shared place." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pins.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card p-6 group">
              <div className="flex items-start justify-between">
                <MapPin className="text-blush-500" size={28} />
                <button onClick={() => remove(p.id)} className="text-mauve-300 hover:text-rose-deep opacity-0 group-hover:opacity-100"><Trash2 size={15} /></button>
              </div>
              <h3 className="serif text-2xl font-semibold text-rose-deep mt-2">{p.place}</h3>
              {p.date && (
                <p className="text-xs text-mauve-300 flex items-center gap-1 mt-1">
                  <Calendar size={11} /> {p.date}
                </p>
              )}
              {p.story && <p className="handwritten text-lg text-mauve-500 mt-3 leading-relaxed">{p.story}</p>}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div className="glass-card max-w-md w-full p-8"
              initial={{ scale: 0.92 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="title-script text-3xl">A new pin</h2>
                <button onClick={() => setOpen(false)}><X /></button>
              </div>
              <form onSubmit={add} className="space-y-4">
                <input className="input-soft" placeholder="Place name…" value={form.place}
                  onChange={e => setForm({ ...form, place: e.target.value })} required />
                <input className="input-soft" type="date" value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })} />
                <textarea className="input-soft" rows={4} placeholder="Our story here…" value={form.story}
                  onChange={e => setForm({ ...form, story: e.target.value })} />
                <div className="flex gap-3 justify-end">
                  <button type="button" className="btn-soft" onClick={() => setOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Pin it 📍</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MemoryMap;
