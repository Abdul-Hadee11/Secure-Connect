import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  Upload,
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

const Gallery = () => {
  const { user } = useAuth();

  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [viewing, setViewing] = useState(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'gallery'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setPhotos(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      },
      () => setPhotos([])
    );

    return () => unsub();
  }, []);

  const upload = async (e) => {
    e.preventDefault();

    if (!file) return;

    setUploading(true);

    try {
      const result =
        await uploadToCloudinary(file);

      if (!result.success) {
        throw new Error(
          'Cloudinary upload failed'
        );
      }

      const url = result.url;

      await addDoc(collection(db, 'gallery'), {
        url,
        publicId: result.publicId,
        caption: caption.trim(),
        uploader: user,
        createdAt: serverTimestamp(),
      });

      setFile(null);
      setCaption('');
      setOpen(false);

    } catch (err) {
      alert('Upload failed: ' + err.message);
    }

    setUploading(false);
  };

  const remove = async (p) => {
    if (
      !confirm(
        'Delete this photo forever?'
      )
    )
      return;

    await deleteDoc(
      doc(db, 'gallery', p.id)
    );

    setViewing(null);
  };

  return (
    <>
      <PageHeader
        icon={ImageIcon}
        title="Our Gallery"
        subtitle="Frozen sunlit moments, just the two of us."
      />

      <div className="text-center mb-8">
        <button
          onClick={() => setOpen(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Upload a memory
        </button>
      </div>

      {photos.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No frames yet"
          subtitle="Drop your first photo here."
        />
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: i * 0.03,
              }}
              className="break-inside-avoid relative group cursor-pointer"
              onClick={() =>
                setViewing(p)
              }
            >
              <img
                src={p.url}
                alt={
                  p.caption || 'memory'
                }
                className="w-full rounded-2xl shadow-soft hover:shadow-petal transition-shadow"
              />

              {p.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white p-3 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="handwritten text-lg">
                    {p.caption}
                  </p>
                </div>
              )}
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
                  A new memory
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
                        : 'Click to choose a photo'}
                    </p>

                    <input
                      type="file"
                      accept="image/*"
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
                  placeholder="A little caption…"
                  value={caption}
                  onChange={(e) =>
                    setCaption(
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
                      : 'Save 🌷'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN IMAGE VIEWER */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-[999999] flex items-center justify-center p-4"
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

            {/* IMAGE */}
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
              <img
                src={viewing.url}
                className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />

              {viewing.caption && (
                <p className="handwritten text-2xl text-white text-center mt-4">
                  {viewing.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;