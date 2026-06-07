import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ListChecks, Plus, Check, Trash2, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { db } from '../firebase/config.js';
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';

const BucketList = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'bucket'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, s => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => setItems([]));
    return () => unsub();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, 'bucket'), {
      text: text.trim(), done: false, author: user, createdAt: serverTimestamp()
    });
    setText('');
  };

  const toggle = async (it) => updateDoc(doc(db, 'bucket', it.id), { done: !it.done });
  const remove = async (id) => deleteDoc(doc(db, 'bucket', id));

  const todo = items.filter(i => !i.done);
  const done = items.filter(i => i.done);

  return (
    <>
      <PageHeader icon={ListChecks} title="Bucket List" subtitle="Dreams we'll chase, together." accent="#8E6586" />

      <form onSubmit={add} className="max-w-2xl mx-auto mb-8 flex gap-3">
        <input className="input-soft flex-1" placeholder="A dream to add…" value={text} onChange={e => setText(e.target.value)} />
        <button type="submit" className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Add</button>
      </form>

      {items.length === 0 ? (
        <EmptyState icon={Sparkles} title="No dreams yet" subtitle="What's the first one you both want to chase?" />
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <section>
            <h3 className="handwritten text-2xl text-rose-deep mb-3">Still to chase ✨</h3>
            {todo.length === 0 && <p className="text-mauve-300 handwritten text-xl">All dreams achieved! 🌟</p>}
            <div className="space-y-2">
              {todo.map((it, i) => (
                <motion.div key={it.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="glass-card p-4 flex items-center gap-3 group">
                  <button onClick={() => toggle(it)}
                    className="w-6 h-6 rounded-full border-2 border-blush-300 hover:bg-blush-100 flex items-center justify-center" />
                  <span className="serif text-lg text-mauve-500 flex-1">{it.text}</span>
                  <button onClick={() => remove(it.id)} className="text-mauve-300 opacity-0 group-hover:opacity-100"><Trash2 size={15} /></button>
                </motion.div>
              ))}
            </div>
          </section>

          {done.length > 0 && (
            <section>
              <h3 className="handwritten text-2xl text-rose-deep mb-3">Done together 💕</h3>
              <div className="space-y-2">
                {done.map(it => (
                  <div key={it.id} className="glass-card p-4 flex items-center gap-3 group opacity-70">
                    <button onClick={() => toggle(it)}
                      className="w-6 h-6 rounded-full bg-blush-400 text-white flex items-center justify-center">
                      <Check size={14} />
                    </button>
                    <span className="serif text-lg text-mauve-500 line-through flex-1">{it.text}</span>
                    <button onClick={() => remove(it.id)} className="text-mauve-300 opacity-0 group-hover:opacity-100"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
};

export default BucketList;
