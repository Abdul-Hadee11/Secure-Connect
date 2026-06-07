import React, {
  useEffect,
  useState,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  Sparkles,
  Plus,
  X,
  Heart,
  Trash2,
} from 'lucide-react';

import PageHeader from '../components/PageHeader.jsx';

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

const Reasons = () => {
  const { user, COUPLE } =
    useAuth();

  const currentUser =
    user;

  const [side, setSide] =
    useState(currentUser);

  const [hisReasons, setHisReasons] =
    useState([]);

  const [herReasons, setHerReasons] =
    useState([]);

  const [open, setOpen] =
    useState(false);

  const [text, setText] =
    useState('');

  // FIRESTORE LISTENER
  useEffect(() => {
    const q = query(
      collection(
        db,
        'reasons'
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
            'ALL REASONS:',
            arr
          );

          // FILTER IN FRONTEND
          const him =
            arr.filter(
              (r) =>
                r.author ===
                'him'
            );

          const her =
            arr.filter(
              (r) =>
                r.author ===
                'her'
            );

          setHisReasons(
            him.reverse()
          );

          setHerReasons(
            her.reverse()
          );
        },
        (err) => {
          console.log(
            'FIREBASE ERROR:',
            err
          );
        }
      );

    return () =>
      unsub();
  }, []);

  // ADD
  const add = async (
    e
  ) => {
    e.preventDefault();

    if (!text.trim())
      return;

    await addDoc(
      collection(
        db,
        'reasons'
      ),
      {
        text: text.trim(),

        author:
          currentUser,

        createdAt:
          serverTimestamp(),
      }
    );

    setText('');
    setOpen(false);
  };

  // DELETE
  const remove = async (
    id
  ) => {
    if (
      confirm(
        'Remove this reason?'
      )
    ) {
      await deleteDoc(
        doc(
          db,
          'reasons',
          id
        )
      );
    }
  };

  const current =
    side === 'him'
      ? hisReasons
      : herReasons;

  const author =
    side === 'him'
      ? COUPLE.him
      : COUPLE.her;

  const subject =
    side === 'him'
      ? COUPLE.her
      : COUPLE.him;

  const canAdd =
    currentUser === side;

  return (
    <>
      <PageHeader
        icon={Sparkles}
        title="Reasons We Love Each Other"
        subtitle="A growing list of all the little (and big) things."
        accent="#C97DA7"
      />

      {/* TOGGLE */}
      <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
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
          💙 Why{' '}
          {
            COUPLE.him
              .nickname
          }{' '}
          loves{' '}
          {
            COUPLE.her
              .nickname
          }
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
          💕 Why{' '}
          {
            COUPLE.her
              .nickname
          }{' '}
          loves{' '}
          {
            COUPLE.him
              .nickname
          }
        </button>
      </div>

      {/* ADD BUTTON */}
      {canAdd && (
        <div className="text-center mb-8">
          <button
            onClick={() =>
              setOpen(true)
            }
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Add a reason
          </button>
        </div>
      )}

      {/* EMPTY */}
      {current.length ===
      0 ? (
        <p className="text-center handwritten text-2xl text-mauve-300 py-8">
          {canAdd
            ? 'Start your list…'
            : `${author.nickname} hasn't written any reasons yet.`}
        </p>
      ) : (
        <div className="max-w-3xl mx-auto space-y-3">
          {current.map(
            (r, i) => (
              <motion.div
                key={r.id}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay:
                    i *
                    0.03,
                }}
                className="glass-card p-4 flex items-start gap-3 group"
              >
                <Heart
                  className="text-blush-400 mt-1 shrink-0"
                  size={18}
                  fill="#FFA8B6"
                />

                <div className="flex-1">
                  <p className="serif text-lg text-mauve-500 leading-relaxed">
                    {r.text}
                  </p>

                  <p className="text-xs text-mauve-300 mt-1">
                    #
                    {current.length -
                      i}
                  </p>
                </div>

                {canAdd && (
                  <button
                    onClick={() =>
                      remove(
                        r.id
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

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
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
              className="glass-card max-w-md w-full p-8"
              initial={{
                scale: 0.92,
              }}
              animate={{
                scale: 1,
              }}
              onClick={(
                e
              ) =>
                e.stopPropagation()
              }
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="title-script text-3xl">
                  Why I love{' '}
                  {
                    subject.nickname
                  }
                  …
                </h2>

                <button
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                >
                  <X />
                </button>
              </div>

              <form
                onSubmit={add}
                className="space-y-4"
              >
                <textarea
                  className="input-soft"
                  rows={4}
                  placeholder={`Because ${subject.nickname}…`}
                  value={text}
                  onChange={(
                    e
                  ) =>
                    setText(
                      e.target
                        .value
                    )
                  }
                  required
                />

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="btn-soft"
                    onClick={() =>
                      setOpen(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Add 💕
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

export default Reasons;