import React, {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';

import {
  Star,
  Plus,
  Trash2,
} from 'lucide-react';

import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

import { db } from '../firebase/config.js';

import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

import { useAuth } from '../context/AuthContext.jsx';

const Stargazing = () => {
  const { user, COUPLE } =
    useAuth();

  const [side, setSide] =
    useState(
      user || 'him'
    );

  const [
    hisWishes,
    setHisWishes,
  ] = useState([]);

  const [
    herWishes,
    setHerWishes,
  ] = useState([]);

  const [text, setText] =
    useState('');

  // LOAD WISHES
  useEffect(() => {
    const q = query(
      collection(
        db,
        'wishes'
      )
    );

    const unsub =
      onSnapshot(
        q,
        (snap) => {
          const arr =
            snap.docs.map(
              (d) => ({
                id: d.id,
                ...d.data(),
              })
            );

          console.log(
            'ALL WISHES:',
            arr
          );

          // FILTER IN FRONTEND
          const him =
            arr.filter(
              (w) =>
                w.author ===
                'him'
            );

          const her =
            arr.filter(
              (w) =>
                w.author ===
                'her'
            );

          setHisWishes(
            him.reverse()
          );

          setHerWishes(
            her.reverse()
          );
        },
        (err) => {
          console.log(
            err
          );
        }
      );

    return () =>
      unsub();
  }, []);

  // ADD WISH
  const add = async (
    e
  ) => {
    e.preventDefault();

    if (!text.trim())
      return;

    await addDoc(
      collection(
        db,
        'wishes'
      ),
      {
        text: text.trim(),

        author: user,

        createdAt:
          serverTimestamp(),
      }
    );

    setText('');
  };

  // DELETE
  const remove =
    async (id) =>
      deleteDoc(
        doc(
          db,
          'wishes',
          id
        )
      );

  const current =
    side === 'him'
      ? hisWishes
      : herWishes;

  const owner =
    side === 'him'
      ? COUPLE.him
      : COUPLE.her;

  const canAdd =
    user === side;

  return (
    <div className="relative">
      {/* STARRY BACKDROP */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({
          length: 40,
        }).map(
          (_, i) => (
            <span
              key={i}
              className="absolute text-white/40"
              style={{
                left: `${
                  Math.random() *
                  100
                }%`,
                top: `${
                  Math.random() *
                  100
                }%`,
                fontSize: `${
                  6 +
                  Math.random() *
                    10
                }px`,
                opacity:
                  0.3 +
                  Math.random() *
                    0.6,
              }}
            >
              ✦
            </span>
          )
        )}
      </div>

      <PageHeader
        icon={Star}
        title="Stargazing"
        subtitle="Private wishes & dreams, whispered to the night."
        accent="#7BA7BC"
      />

      {/* TOGGLE */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() =>
            setSide('him')
          }
          className={`tab-pill ${
            side === 'him'
              ? 'active'
              : ''
          }`}
        >
          🌙{' '}
          {
            COUPLE.him
              .nickname
          }
          &apos;s sky
        </button>

        <button
          onClick={() =>
            setSide('her')
          }
          className={`tab-pill ${
            side === 'her'
              ? 'active'
              : ''
          }`}
        >
          ✨{' '}
          {
            COUPLE.her
              .nickname
          }
          &apos;s sky
        </button>
      </div>

      {/* ADD */}
      {canAdd && (
        <form
          onSubmit={add}
          className="max-w-2xl mx-auto mb-8 flex gap-3"
        >
          <input
            className="input-soft flex-1"
            placeholder="Make a wish…"
            value={text}
            onChange={(
              e
            ) =>
              setText(
                e.target
                  .value
              )
            }
          />

          <button
            type="submit"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus
              size={16}
            />
            Wish
          </button>
        </form>
      )}

      {/* EMPTY */}
      {current.length ===
      0 ? (
        <EmptyState
          icon={Star}
          title={`${owner.nickname}'s sky is clear…`}
          subtitle={
            canAdd
              ? 'Make your first wish.'
              : `${owner.nickname} hasn't wished yet.`
          }
        />
      ) : (
        <div className="max-w-3xl mx-auto space-y-3">
          {current.map(
            (w, i) => (
              <motion.div
                key={w.id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    i *
                    0.04,
                }}
                className="glass-card p-4 flex items-start gap-3 group"
              >
                <Star
                  className="text-blush-400 mt-1 shrink-0"
                  size={18}
                  fill="#FFA8B6"
                />

                <p className="serif text-lg text-mauve-500 flex-1 leading-relaxed">
                  {w.text}
                </p>

                {canAdd && (
                  <button
                    onClick={() =>
                      remove(
                        w.id
                      )
                    }
                    className="text-mauve-300 hover:text-rose-deep opacity-0 group-hover:opacity-100"
                  >
                    <Trash2
                      size={
                        15
                      }
                    />
                  </button>
                )}
              </motion.div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Stargazing;