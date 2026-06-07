import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Film,
  Plus,
  X,
  Upload,
  Trash2,
  Play,
} from 'lucide-react';

import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

import { db } from '../firebase/config.js';

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

import { useAuth } from '../context/AuthContext.jsx';

import {
  uploadToCloudinary,
} from '../services/cloudinaryService.js';

const Edits = () => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState(null);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  const [uploading, setUploading] =
    useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'edits'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (s) =>
        setItems(
          s.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        ),
      () => setItems([])
    );

    return () => unsub();
  }, []);

  const upload = async (e) => {
    e.preventDefault();

    if (!file) return;

    setUploading(true);

    try {
      const result =
        await uploadToCloudinary(
          file,
          'video'
        );

      if (!result.success) {
        throw new Error(
          'Cloudinary upload failed'
        );
      }

      await addDoc(collection(db, 'edits'), {
        url: result.url,
        publicId: result.publicId,
        title:
          title.trim() ||
          'Untitled Edit',
        author: user,
        createdAt:
          serverTimestamp(),
      });

      setFile(null);
      setTitle('');
      setOpen(false);

    } catch (err) {
      alert(
        'Upload failed: ' +
          err.message
      );
    }

    setUploading(false);
  };

  const remove = async (it) => {
    if (
      !confirm(
        'Delete this edit forever?'
      )
    )
      return;

    await deleteDoc(
      doc(db, 'edits', it.id)
    );

    setViewing(null);
  };

  return (
    <>
      <PageHeader
        icon={Film}
        title="Our Edits"
        subtitle="Reels and edits — the highlight reel of us."
        accent="#B27BC0"
      />

      <div className="text-center mb-8">
        <button
          onClick={() => setOpen(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Upload an edit
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No edits yet"
          subtitle="Drop your first reel or edit here."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: i * 0.05,
              }}
              whileHover={{
                scale: 1.03,
              }}
              className="glass-card overflow-hidden group cursor-pointer"
              onClick={() =>
                setViewing(it)
              }
            >
              <div className="relative">
                <video
                  src={it.url}
                  className="w-full h-[400px] object-cover bg-black"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Play
                      className="text-white fill-white"
                      size={30}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <h3 className="serif text-lg text-rose-deep truncate">
                  {it.title}
                </h3>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(it);
                  }}
                  className="text-mauve-300 hover:text-red-500 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999998] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
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
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="title-script text-3xl">
                  New edit
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
                onSubmit={upload}
                className="space-y-4"
              >
                <label className="block">
                  <div className="border-2 border-dashed border-blush-200 rounded-2xl p-6 text-center hover:bg-blush-100/40 cursor-pointer transition-all">
                    <Upload className="mx-auto text-blush-400 mb-2" />

                    <p className="text-sm text-mauve-500">
                      {file
                        ? file.name
                        : 'Choose a video file'}
                    </p>

                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) =>
                        setFile(
                          e.target
                            .files?.[0] ||
                            null
                        )
                      }
                    />
                  </div>
                </label>

                <input
                  className="input-soft"
                  placeholder="Edit title…"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
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
                    className="btn-primary"
                    disabled={
                      uploading || !file
                    }
                  >
                    {uploading
                      ? 'Uploading…'
                      : 'Save 🎬'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN VIEWER */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-[999999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            onClick={() =>
              setViewing(null)
            }
          >
            {/* CLOSE BUTTON */}
            <button
              className="fixed top-24 right-6 z-[1000000] bg-black/70 hover:bg-black text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border border-white/20"
              onClick={() =>
                setViewing(null)
              }
            >
              <X size={26} />
            </button>

            {/* DELETE BUTTON */}
            <button
              className="fixed top-24 left-6 z-[1000000] bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white"
              onClick={() =>
                remove(viewing)
              }
            >
              <Trash2 size={26} />
            </button>

            {/* VIDEO */}
            <motion.div
              initial={{
                scale: 0.9,
              }}
              animate={{
                scale: 1,
              }}
              className="max-w-5xl w-full"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <video
                src={viewing.url}
                controls
                autoPlay
                className="w-full max-h-[80vh] rounded-2xl shadow-2xl bg-black"
              />

              <p className="handwritten text-3xl text-white text-center mt-5">
                {viewing.title}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Edits;