import React, {
  useEffect,
  useState,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  Mail,
  Plus,
  X,
  Send,
  BookOpen,
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
  updateDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { useAuth } from '../context/AuthContext.jsx';

const PostBox = () => {
  const { user, COUPLE } =
    useAuth();

  const currentUser = user;

  const them =
    currentUser === 'him'
      ? COUPLE.her
      : COUPLE.him;

  const otherKey =
    currentUser === 'him'
      ? 'her'
      : 'him';

  const [received, setReceived] =
    useState([]);

  const [sent, setSent] =
    useState([]);

  const [tab, setTab] =
    useState('received');

  const [open, setOpen] =
    useState(false);

  const [form, setForm] =
    useState({
      title: '',
      body: '',
    });

  // FIRESTORE LISTENERS
  useEffect(() => {
    const q1 = query(
      collection(db, 'letters'),
      where(
        'to',
        '==',
        currentUser
      )
    );

    const u1 = onSnapshot(
      q1,
      (snap) => {
        const arr = snap.docs.map(
          (d) => ({
            id: d.id,
            ...d.data(),
          })
        );

        setReceived(arr);
      },
      () => setReceived([])
    );

    const q2 = query(
      collection(db, 'letters'),
      where(
        'from',
        '==',
        currentUser
      )
    );

    const u2 = onSnapshot(
      q2,
      (snap) => {
        setSent(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      },
      () => setSent([])
    );

    return () => {
      u1();
      u2();
    };
  }, [currentUser]);

  // SEND LETTER
  const send = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.body.trim()
    )
      return;

    await addDoc(
      collection(db, 'letters'),
      {
        title: form.title,
        body: form.body,

        from: currentUser,
        to: otherKey,

        read: false,
        savedToLibrary: false,

        createdAt:
          serverTimestamp(),
      }
    );

    setForm({
      title: '',
      body: '',
    });

    setOpen(false);
  };

  // MARK READ
  const markRead = async (l) => {
    if (!l.read) {
      await updateDoc(
        doc(db, 'letters', l.id),
        {
          read: true,
        }
      );
    }
  };

  // SAVE TO LIBRARY
  const saveToLibrary =
    async (l) => {
      await addDoc(
        collection(db, 'library'),
        {
          title: l.title,

          content: l.body,

          category:
            'Love Letter',

          author: l.from,

          fromLetter: l.id,

          createdAt:
            serverTimestamp(),
        }
      );

      await updateDoc(
        doc(db, 'letters', l.id),
        {
          savedToLibrary: true,
        }
      );

      alert(
        'Tucked safely into the Library 📚💕'
      );
    };

  // DELETE LETTER
  const remove = async (id) => {
    if (
      confirm(
        'Delete this letter forever?'
      )
    ) {
      await deleteDoc(
        doc(db, 'letters', id)
      );
    }
  };

  const list =
    tab === 'received'
      ? received
      : sent;

  return (
    <>
      <PageHeader
        icon={Mail}
        title="Post Box"
        subtitle="Letters wait here, sealed with love."
      />

      {/* TABS */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() =>
            setTab('received')
          }
          className={`tab-pill ${
            tab === 'received'
              ? 'active'
              : ''
          }`}
        >
          📥 Received

          {received.filter(
            (l) => !l.read
          ).length > 0 && (
            <span className="ml-2 bg-white/30 px-2 py-1 rounded-full text-xs">
              {
                received.filter(
                  (l) => !l.read
                ).length
              }
            </span>
          )}
        </button>

        <button
          onClick={() =>
            setTab('sent')
          }
          className={`tab-pill ${
            tab === 'sent'
              ? 'active'
              : ''
          }`}
        >
          📤 Sent
        </button>
      </div>

      {/* WRITE BUTTON */}
      <div className="text-center mb-8">
        <button
          onClick={() =>
            setOpen(true)
          }
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Write a letter to{' '}
          {them?.nickname}
        </button>
      </div>

      {/* LETTERS */}
      {list.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={
            tab === 'received'
              ? 'No letters yet…'
              : 'You haven’t written any letters yet'
          }
          subtitle={
            tab === 'received'
              ? 'When your love writes, it will appear here.'
              : 'Start one now ✍️'
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {list.map((l, i) => (
            <motion.div
              key={l.id}
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
                  i * 0.04,
              }}
              whileHover={{
                scale: 1.02,
              }}
              className={`glass-card p-6 relative overflow-hidden ${
                !l.read &&
                tab ===
                  'received'
                  ? 'border-2 border-blush-300'
                  : ''
              }`}
            >
              {!l.read &&
                tab ===
                  'received' && (
                  <span className="absolute top-4 right-4 bg-blush-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                    NEW 💌
                  </span>
                )}

              <Mail
                className="text-blush-400 mb-3"
                size={24}
              />

              <h3 className="serif text-2xl font-semibold text-rose-deep">
                {l.title}
              </h3>

              <p className="text-sm text-mauve-500 mt-2 line-clamp-4 whitespace-pre-wrap">
                {l.body}
              </p>

              <div className="flex items-center justify-between mt-5">
                <div className="flex gap-2">
                  {tab ===
                    'received' &&
                    !l.read && (
                      <button
                        onClick={() =>
                          markRead(
                            l
                          )
                        }
                        className="btn-soft !py-2 !px-4 text-sm"
                      >
                        Mark Read
                      </button>
                    )}

                  {!l.savedToLibrary && (
                    <button
                      onClick={() =>
                        saveToLibrary(
                          l
                        )
                      }
                      className="btn-soft !py-2 !px-4 text-sm"
                    >
                      <BookOpen
                        size={
                          14
                        }
                      />
                    </button>
                  )}
                </div>

                <button
                  onClick={() =>
                    remove(l.id)
                  }
                  className="text-mauve-300 hover:text-red-500 transition-all"
                >
                  <Trash2
                    size={18}
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* COMPOSE MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999998] flex items-center justify-center p-4"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setOpen(false)
            }
          >
            <motion.div
              className="glass-card max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
              initial={{
                scale: 0.92,
              }}
              animate={{
                scale: 1,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="title-script text-4xl">
                  A letter for{' '}
                  {them?.nickname}
                </h2>

                <button
                  className="bg-black/10 hover:bg-black/20 p-2 rounded-full transition-all"
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  <X />
                </button>
              </div>

              <form
                onSubmit={send}
                className="space-y-5"
              >
                <input
                  className="input-soft"
                  placeholder="Subject of the heart…"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title:
                        e.target
                          .value,
                    })
                  }
                  required
                />

                <textarea
                  className="input-soft min-h-[320px]"
                  placeholder={`Dear ${them?.nickname},\n\n`}
                  value={form.body}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      body:
                        e.target
                          .value,
                    })
                  }
                  required
                />

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="btn-soft"
                    onClick={() =>
                      setOpen(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Send
                      size={16}
                    />
                    Seal & send
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PostBox;