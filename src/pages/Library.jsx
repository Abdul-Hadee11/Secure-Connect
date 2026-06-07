import React, {
  useEffect,
  useState,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  BookOpen,
  Plus,
  Trash2,
  X,
  Calendar,
  Search,
  ExternalLink,
  Download,
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

const categories = [
  'Love Letter',
  'Diary',
  'Journal',
  'Story',
  'Poem',
  'Story Book',
  'PDF',
  'Memory Book',
  'Other',
];

const CLOUD_NAME =
  'dv5zneitu';

const IMAGE_PRESET =
  'lowkeyus';

const PDF_PRESET =
  'lowkeyus_pdf';

const Library = () => {
  const { user, COUPLE } =
    useAuth();

  const [items, setItems] =
    useState([]);

  const [open, setOpen] =
    useState(false);

  const [reading, setReading] =
    useState(null);

  const [filter, setFilter] =
    useState('All');

  const [search, setSearch] =
    useState('');

  const [uploading, setUploading] =
    useState(false);

  const [form, setForm] =
    useState({
      title: '',
      category:
        'Love Letter',
      content: '',
      pdfUrl: '',
      coverUrl: '',
    });

  useEffect(() => {
    const q = query(
      collection(
        db,
        'library'
      ),
      orderBy(
        'createdAt',
        'desc'
      )
    );

    const unsub =
      onSnapshot(
        q,
        (snap) => {
          setItems(
            snap.docs.map(
              (d) => ({
                id: d.id,
                ...d.data(),
              })
            )
          );
        },
        () => setItems([])
      );

    return () => unsub();
  }, []);

  // IMAGE UPLOAD
  const uploadImage =
    async (file) => {
      try {
        setUploading(
          true
        );

        const data =
          new FormData();

        data.append(
          'file',
          file
        );

        data.append(
          'upload_preset',
          IMAGE_PRESET
        );

        const res =
          await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
              method:
                'POST',
              body: data,
            }
          );

        const uploaded =
          await res.json();

        setForm(
          (prev) => ({
            ...prev,
            coverUrl:
              uploaded.secure_url,
          })
        );

        alert(
          'Cover uploaded ✨'
        );
      } catch {
        alert(
          'Upload failed 😭'
        );
      } finally {
        setUploading(
          false
        );
      }
    };

  // PDF UPLOAD
  const uploadPDF =
    async (file) => {
      try {
        setUploading(
          true
        );

        const data =
          new FormData();

        data.append(
          'file',
          file
        );

        data.append(
          'upload_preset',
          PDF_PRESET
        );

        const res =
          await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
            {
              method:
                'POST',
              body: data,
            }
          );

        const uploaded =
          await res.json();

        setForm(
          (prev) => ({
            ...prev,
            pdfUrl:
              uploaded.secure_url,
          })
        );

        alert(
          'PDF uploaded 📚'
        );
      } catch {
        alert(
          'PDF upload failed 😭'
        );
      } finally {
        setUploading(
          false
        );
      }
    };

  // SAVE
  const save = async (
    e
  ) => {
    e.preventDefault();

    if (
      !form.title.trim()
    )
      return;

    await addDoc(
      collection(
        db,
        'library'
      ),
      {
        ...form,
        author: user,
        createdAt:
          serverTimestamp(),
      }
    );

    setForm({
      title: '',
      category:
        'Love Letter',
      content: '',
      pdfUrl: '',
      coverUrl: '',
    });

    setOpen(false);
  };

  // DELETE
  const remove = async (
    id
  ) => {
    if (
      confirm(
        'Tuck this away forever? 🌸'
      )
    ) {
      await deleteDoc(
        doc(
          db,
          'library',
          id
        )
      );
    }
  };

  // FILTER
  const filtered =
    items.filter((i) => {
      const categoryMatch =
        filter === 'All'
          ? true
          : i.category ===
            filter;

      const searchMatch =
        i.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        i.content
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        categoryMatch &&
        searchMatch
      );
    });

  return (
    <>
      <PageHeader
        icon={BookOpen}
        title="Our Library"
        subtitle="Every word we've ever written, kept safe between these pages."
      />

      {/* FILTERS */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {[
          'All',
          ...categories,
        ].map((c) => (
          <button
            key={c}
            onClick={() =>
              setFilter(
                c
              )
            }
            className={`tab-pill ${
              filter === c
                ? 'active'
                : ''
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="max-w-md mx-auto mb-8 relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-mauve-300"
          size={18}
        />

        <input
          type="text"
          placeholder="Search memories..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target
                .value
            )
          }
          className="input-soft pl-11"
        />
      </div>

      {/* ADD BUTTON */}
      <div className="text-center mb-8">
        <button
          onClick={() =>
            setOpen(true)
          }
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Add to library
        </button>
      </div>

      {/* EMPTY */}
      {filtered.length ===
      0 ? (
        <EmptyState
          icon={BookOpen}
          title="The shelves are waiting…"
          subtitle="Write your first letter, diary entry, or little poem."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(
            (it, i) => {
              const author =
                it.author ===
                'him'
                  ? COUPLE.him
                  : COUPLE.her;

              return (
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
                    delay:
                      i *
                      0.04,
                  }}
                  className="glass-card p-6 cursor-pointer hover:-translate-y-1 transition-transform"
                  onClick={() =>
                    setReading(
                      it
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs tab-pill !py-1 !px-3">
                      {
                        it.category
                      }
                    </span>

                    <button
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation();

                        remove(
                          it.id
                        );
                      }}
                      className="text-mauve-300 hover:text-rose-deep"
                    >
                      <Trash2
                        size={
                          15
                        }
                      />
                    </button>
                  </div>

                  {it.coverUrl && (
                    <img
                      src={
                        it.coverUrl
                      }
                      alt=""
                      className="w-full h-52 object-cover rounded-2xl mb-4"
                    />
                  )}

                  <h3 className="serif text-2xl font-semibold text-rose-deep mb-2">
                    {it.title}
                  </h3>

                  <p className="text-sm text-mauve-500 line-clamp-4 whitespace-pre-wrap">
                    {it.content}
                  </p>

                  <div className="flex items-center justify-between mt-4 text-xs text-mauve-300">
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          background:
                            author?.color,
                        }}
                      />

                      {
                        author?.nickname
                      }
                    </span>

                    {it.createdAt
                      ?.toDate && (
                      <span className="flex items-center gap-1">
                        <Calendar
                          size={
                            11
                          }
                        />

                        {it.createdAt
                          .toDate()
                          .toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {it.pdfUrl && (
                    <div className="flex gap-2 mt-4">
                      <a
                        href={
                          it.pdfUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="btn-soft !py-2 !px-3"
                        onClick={(
                          e
                        ) =>
                          e.stopPropagation()
                        }
                      >
                        <ExternalLink
                          size={
                            14
                          }
                        />
                      </a>

                      <a
                        href={
                          it.pdfUrl
                        }
                        download
                        className="btn-soft !py-2 !px-3"
                        onClick={(
                          e
                        ) =>
                          e.stopPropagation()
                        }
                      >
                        <Download
                          size={
                            14
                          }
                        />
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            }
          )}
        </div>
      )}

      {/* ADD MODAL */}
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
              className="glass-card max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
              initial={{
                scale: 0.92,
                y: 20,
              }}
              animate={{
                scale: 1,
                y: 0,
              }}
              exit={{
                scale: 0.92,
              }}
              onClick={(
                e
              ) =>
                e.stopPropagation()
              }
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="title-script text-3xl">
                  A new page
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
                onSubmit={save}
                className="space-y-4"
              >
                <input
                  className="input-soft"
                  placeholder="Title…"
                  value={
                    form.title
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      title:
                        e
                          .target
                          .value,
                    })
                  }
                  required
                />

                <select
                  className="input-soft"
                  value={
                    form.category
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      category:
                        e
                          .target
                          .value,
                    })
                  }
                >
                  {categories.map(
                    (
                      c
                    ) => (
                      <option
                        key={
                          c
                        }
                      >
                        {c}
                      </option>
                    )
                  )}
                </select>

                {/* COVER */}
                <div>
                  <label className="text-sm text-mauve-400">
                    Upload
                    Cover
                    Image
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    className="input-soft mt-2"
                    onChange={(
                      e
                    ) =>
                      uploadImage(
                        e
                          .target
                          .files[0]
                      )
                    }
                  />
                </div>

                {/* PDF */}
                <div>
                  <label className="text-sm text-mauve-400">
                    Upload
                    PDF /
                    Storybook
                  </label>

                  <input
                    type="file"
                    accept=".pdf"
                    className="input-soft mt-2"
                    onChange={(
                      e
                    ) =>
                      uploadPDF(
                        e
                          .target
                          .files[0]
                      )
                    }
                  />
                </div>

                <textarea
                  className="input-soft"
                  rows={10}
                  placeholder="Pour your heart out…"
                  value={
                    form.content
                  }
                  onChange={(
                    e
                  ) =>
                    setForm({
                      ...form,
                      content:
                        e
                          .target
                          .value,
                    })
                  }
                />

                {uploading && (
                  <p className="text-sm text-blush-500">
                    Uploading...
                  </p>
                )}

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
                    Save 🌷
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* READING MODAL */}
      <AnimatePresence>
        {reading && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
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
              setReading(
                null
              )
            }
          >
            <motion.div
              className="glass-card max-w-2xl w-full p-8 md:p-10 max-h-[90vh] overflow-y-auto"
              initial={{
                scale: 0.92,
              }}
              animate={{
                scale: 1,
              }}
              exit={{
                scale: 0.92,
              }}
              onClick={(
                e
              ) =>
                e.stopPropagation()
              }
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs tab-pill !py-1 !px-3">
                  {
                    reading.category
                  }
                </span>

                <button
                  onClick={() =>
                    setReading(
                      null
                    )
                  }
                >
                  <X />
                </button>
              </div>

              {reading.coverUrl && (
                <img
                  src={
                    reading.coverUrl
                  }
                  alt=""
                  className="w-full h-72 object-cover rounded-3xl mb-6"
                />
              )}

              <h2 className="title-script text-4xl mb-4">
                {
                  reading.title
                }
              </h2>

              <p className="serif text-lg whitespace-pre-wrap leading-relaxed text-mauve-500">
                {
                  reading.content
                }
              </p>

              {reading.pdfUrl && (
                <div className="flex gap-3 mt-6">
                  <a
                    href={
                      reading.pdfUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <ExternalLink
                      size={
                        16
                      }
                    />
                    Open PDF
                  </a>

                  <a
                    href={
                      reading.pdfUrl
                    }
                    download
                    className="btn-soft inline-flex items-center gap-2"
                  >
                    <Download
                      size={
                        16
                      }
                    />
                    Download
                  </a>
                </div>
              )}

              <p className="handwritten text-xl text-rose-deep mt-6 text-right">
                —
                {(reading.author ===
                'him'
                  ? COUPLE.him
                  : COUPLE.her)
                  ?.nickname}{' '}
                💕
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Library;