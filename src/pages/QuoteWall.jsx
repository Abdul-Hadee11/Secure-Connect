import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { db } from '../firebase/config.js';
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';

const palette = ['#FFE4E9', '#FFF5EC', '#F3E6EF', '#FBE8D6', '#FFC8D1'];

const QuoteWall = () => {
  const { user, COUPLE } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [form, setForm] = useState({ quote: '', saidBy: 'him' });

  useEffect(() => {
    const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, s => setQuotes(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => setQuotes([]));
    return () => unsub();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.quote.trim()) return;
    await addDoc(collection(db, 'quotes'), {
      ...form, addedBy: user, createdAt: serverTimestamp()
    });
    setForm({ quote: '', saidBy: 'him' });
  };

  const remove = async (id) => deleteDoc(doc(db, 'quotes', id));

  return (
    <>
      <PageHeader icon={MessageCircle} title="Quote Wall" subtitle="Cute things we've said to each other." accent="#A8506C" />

      <form onSubmit={add} className="glass-card max-w-2xl mx-auto p-6 mb-8 space-y-3">
        <textarea className="input-soft" rows={2} placeholder='"You said…"' value={form.quote}
          onChange={e => setForm({ ...form, quote: e.target.value })} required />
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <select className="input-soft sm:flex-1" value={form.saidBy}
            onChange={e => setForm({ ...form, saidBy: e.target.value })}>
            <option value="him">{COUPLE.him.nickname} said it</option>
            <option value="her">{COUPLE.her.nickname} said it</option>
          </select>
          <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2"><Plus size={16} /> Pin to wall</button>
        </div>
      </form>

      {quotes.length === 0 ? (
        <EmptyState icon={MessageCircle} title="The wall is bare" subtitle="Pin the first cute thing you both have said." />
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {quotes.map((q, i) => {
            const who = q.saidBy === 'him' ? COUPLE.him : COUPLE.her;
            const bg = palette[i % palette.length];
            return (
              <motion.div key={q.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="break-inside-avoid p-5 rounded-2xl shadow-soft group"
                style={{ background: bg, transform: `rotate(${(i % 5 - 2) * 0.6}deg)` }}>
                <p className="handwritten text-2xl text-rose-deep leading-snug">“{q.quote}”</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-mauve-500">— {who?.nickname}</p>
                  <button onClick={() => remove(q.id)} className="text-mauve-300 hover:text-rose-deep opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default QuoteWall;
