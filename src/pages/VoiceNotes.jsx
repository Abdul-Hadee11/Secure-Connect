import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  motion,
} from 'framer-motion';

import {
  Mic,
  Square,
  Trash2,
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

const CLOUD_NAME =
  'dv5zneitu';

const AUDIO_PRESET =
  'lowkeyus_audio';

const VoiceNotes = () => {
  const { user, COUPLE } =
    useAuth();

  const [notes, setNotes] =
    useState([]);

  const [
    recording,
    setRecording,
  ] = useState(false);

  const [blob, setBlob] =
    useState(null);

  const [title, setTitle] =
    useState('');

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const mediaRef =
    useRef(null);

  const chunksRef =
    useRef([]);

  // LOAD NOTES
  useEffect(() => {
    const q = query(
      collection(
        db,
        'voice_notes'
      ),
      orderBy(
        'createdAt',
        'desc'
      )
    );

    const unsub =
      onSnapshot(
        q,
        (s) =>
          setNotes(
            s.docs.map(
              (d) => ({
                id: d.id,
                ...d.data(),
              })
            )
          ),
        () =>
          setNotes([])
      );

    return () =>
      unsub();
  }, []);

  // START RECORDING
  const start =
    async () => {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            }
          );

        const mr =
          new MediaRecorder(
            stream
          );

        chunksRef.current =
          [];

        mr.ondataavailable =
          (e) =>
            chunksRef.current.push(
              e.data
            );

        mr.onstop = () => {
          const b =
            new Blob(
              chunksRef.current,
              {
                type: 'audio/webm',
              }
            );

          setBlob(b);

          stream
            .getTracks()
            .forEach(
              (t) =>
                t.stop()
            );
        };

        mediaRef.current =
          mr;

        mr.start();

        setRecording(true);
      } catch {
        alert(
          'Microphone permission denied.'
        );
      }
    };

  // STOP RECORDING
  const stop = () => {
    mediaRef.current?.stop();

    setRecording(false);
  };

  // UPLOAD
  const upload =
    async () => {
      if (!blob) return;

      setUploading(true);

      try {
        const data =
          new FormData();

        data.append(
          'file',
          blob
        );

        data.append(
          'upload_preset',
          AUDIO_PRESET
        );

        const res =
          await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
            {
              method:
                'POST',
              body: data,
            }
          );

        const uploaded =
          await res.json();

        console.log(
          uploaded
        );

        if (
          !uploaded.secure_url
        ) {
          throw new Error(
            uploaded.error
              ?.message ||
              'Upload failed'
          );
        }

        await addDoc(
          collection(
            db,
            'voice_notes'
          ),
          {
            url:
              uploaded.secure_url,

            title:
              title.trim() ||
              'Voice note',

            author:
              user,

            createdAt:
              serverTimestamp(),
          }
        );

        setBlob(null);

        setTitle('');

        alert(
          'Voice note saved 💕'
        );
      } catch (e) {
        console.log(e);

        alert(
          e.message ||
            'Upload failed 😭'
        );
      } finally {
        setUploading(
          false
        );
      }
    };

  // DELETE
  const remove =
    async (n) => {
      if (
        !confirm(
          'Delete this voice note?'
        )
      )
        return;

      await deleteDoc(
        doc(
          db,
          'voice_notes',
          n.id
        )
      );
    };

  return (
    <>
      <PageHeader
        icon={Mic}
        title="Voice Notes"
        subtitle="Whispers, saved forever."
        accent="#E76A85"
      />

      {/* RECORDER */}
      <div className="glass-card max-w-2xl mx-auto p-6 mb-8 text-center">
        {!blob ? (
          <button
            onClick={
              recording
                ? stop
                : start
            }
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all ${
              recording
                ? 'bg-rose-deep animate-pulse-heart'
                : 'bg-blush-500'
            } text-white shadow-petal`}
          >
            {recording ? (
              <Square
                size={32}
              />
            ) : (
              <Mic
                size={32}
              />
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <audio
              src={URL.createObjectURL(
                blob
              )}
              controls
              className="w-full"
            />

            <input
              className="input-soft"
              placeholder="Title…"
              value={title}
              onChange={(
                e
              ) =>
                setTitle(
                  e.target
                    .value
                )
              }
            />

            <div className="flex gap-3 justify-center">
              <button
                onClick={() =>
                  setBlob(
                    null
                  )
                }
                className="btn-soft"
              >
                Re-record
              </button>

              <button
                onClick={
                  upload
                }
                disabled={
                  uploading
                }
                className="btn-primary inline-flex items-center gap-2"
              >
                <Upload
                  size={16}
                />

                {uploading
                  ? 'Saving…'
                  : 'Save note'}
              </button>
            </div>
          </div>
        )}

        <p className="handwritten text-xl text-mauve-500 mt-4">
          {recording
            ? 'Listening…'
            : blob
            ? 'Listen back, then save 💕'
            : 'Tap to record a whisper'}
        </p>
      </div>

      {/* EMPTY */}
      {notes.length ===
      0 ? (
        <EmptyState
          icon={Mic}
          title="No whispers yet"
          subtitle="Record your first love note above."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map(
            (n, i) => {
              const a =
                n.author ===
                'him'
                  ? COUPLE.him
                  : COUPLE.her;

              return (
                <motion.div
                  key={n.id}
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
                  className="glass-card p-5 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="serif text-lg text-rose-deep">
                      {
                        n.title
                      }
                    </h3>

                    <button
                      onClick={() =>
                        remove(
                          n
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
                  </div>

                  <audio
                    src={n.url}
                    controls
                    className="w-full"
                  />

                  <p className="text-xs text-mauve-300 mt-2 flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          a?.color,
                      }}
                    />

                    {
                      a?.nickname
                    }
                  </p>
                </motion.div>
              );
            }
          )}
        </div>
      )}
    </>
  );
};

export default VoiceNotes;