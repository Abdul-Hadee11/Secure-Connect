import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  Send,
  Trash2,
  Heart,
  Mic,
  Image as ImageIcon,
  CheckCheck,
  Reply,
  Smile,
  X,
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
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { useAuth } from '../context/AuthContext.jsx';

const CLOUD_NAME =
  'dv5zneitu';

const IMAGE_PRESET =
  'lowkeyus';

const AUDIO_PRESET =
  'lowkeyus_audio';

const reactions = [
  '❤️',
  '😭',
  '🥹',
  '😘',
  '😡',
  '😂',
];

const Chat = () => {
  const { user, COUPLE } =
    useAuth();

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState('');

  const [typing, setTyping] =
    useState(false);

  const [showHeart, setShowHeart] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [replying, setReplying] =
    useState(null);

  const [
    showReactions,
    setShowReactions,
  ] = useState(null);

  const [wallpaper, setWallpaper] =
    useState(
      localStorage.getItem(
        'chat_wallpaper'
      ) ||
        'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop'
    );

  const bottomRef =
    useRef(null);

  const fileRef =
    useRef(null);

  const wallpaperRef =
    useRef(null);

  const mediaRecorderRef =
    useRef(null);

  const chunksRef =
    useRef([]);

  const [
    recording,
    setRecording,
  ] = useState(false);

  const otherUser =
    user === 'him'
      ? 'her'
      : 'him';

  // LOAD MESSAGES
  useEffect(() => {
    const q = query(
      collection(
        db,
        'chat_messages'
      )
    );

    const unsub =
      onSnapshot(
        q,
        async (
          snap
        ) => {
          const arr =
            snap.docs.map(
              (d) => ({
                id: d.id,
                ...d.data(),
              })
            );

          arr.sort(
            (a, b) => {
              const A =
                a.createdAt
                  ?.seconds ||
                0;

              const B =
                b.createdAt
                  ?.seconds ||
                0;

              return A - B;
            }
          );

          setMessages(arr);

          arr.forEach(
            async (
              m
            ) => {
              if (
                m.sender !==
                  user &&
                !m.seen
              ) {
                await updateDoc(
                  doc(
                    db,
                    'chat_messages',
                    m.id
                  ),
                  {
                    seen:
                      true,
                  }
                );
              }
            }
          );
        }
      );

    return () =>
      unsub();
  }, [user]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior:
          'smooth',
      }
    );
  }, [messages]);

  // TYPING
  useEffect(() => {
    const unsub =
      onSnapshot(
        doc(
          db,
          'typing_status',
          otherUser
        ),
        (
          snap
        ) => {
          setTyping(
            snap.data()
              ?.typing ||
              false
          );
        }
      );

    return () =>
      unsub();
  }, [otherUser]);

  const updateTyping =
    async (v) => {
      await setDoc(
        doc(
          db,
          'typing_status',
          user
        ),
        {
          typing: v,
        }
      );
    };

  // SEND TEXT
  const send =
    async (e) => {
      e.preventDefault();

      if (!text.trim())
        return;

      await addDoc(
        collection(
          db,
          'chat_messages'
        ),
        {
          type: 'text',

          text:
            text.trim(),

          sender:
            user,

          createdAt:
            serverTimestamp(),

          seen: false,

          reaction:
            null,

          replyTo:
            replying
              ? {
                  text:
                    replying.text,
                  sender:
                    replying.sender,
                }
              : null,
        }
      );

      setText('');

      setReplying(
        null
      );

      updateTyping(
        false
      );

      setShowHeart(
        true
      );

      setTimeout(
        () =>
          setShowHeart(
            false
          ),
        1200
      );
    };

  // SEND IMAGE
  const sendImage =
    async (file) => {
      if (!file)
        return;

      setUploading(true);

      try {
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

        await addDoc(
          collection(
            db,
            'chat_messages'
          ),
          {
            type: 'image',

            image:
              uploaded.secure_url,

            sender:
              user,

            createdAt:
              serverTimestamp(),

            seen: false,
          }
        );
      } catch {
        alert(
          'Image upload failed 😭'
        );
      } finally {
        setUploading(
          false
        );
      }
    };

  // WALLPAPER
  const uploadWallpaper =
    async (file) => {
      if (!file)
        return;

      try {
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

        setWallpaper(
          uploaded.secure_url
        );

        localStorage.setItem(
          'chat_wallpaper',
          uploaded.secure_url
        );
      } catch {
        alert(
          'Wallpaper upload failed 😭'
        );
      }
    };

  // VOICE
  const toggleRecording =
    async () => {
      if (
        recording
      ) {
        mediaRecorderRef.current?.stop();

        setRecording(
          false
        );

        return;
      }

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

      mediaRecorderRef.current =
        mr;

      chunksRef.current =
        [];

      mr.ondataavailable =
        (
          e
        ) => {
          chunksRef.current.push(
            e.data
          );
        };

      mr.onstop =
        async () => {
          const blob =
            new Blob(
              chunksRef.current,
              {
                type: 'audio/webm',
              }
            );

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

          await addDoc(
            collection(
              db,
              'chat_messages'
            ),
            {
              type: 'voice',

              voice:
                uploaded.secure_url,

              sender:
                user,

              createdAt:
                serverTimestamp(),

              seen: false,
            }
          );
        };

      mr.start();

      setRecording(
        true
      );
    };

  // DELETE
  const remove =
    async (id) => {
      if (
        confirm(
          'Delete message?'
        )
      ) {
        await deleteDoc(
          doc(
            db,
            'chat_messages',
            id
          )
        );
      }
    };

  // REACT
  const react =
    async (
      id,
      emoji
    ) => {
      await updateDoc(
        doc(
          db,
          'chat_messages',
          id
        ),
        {
          reaction:
            emoji,
        }
      );

      setShowReactions(
        null
      );
    };

  return (
    <div className="relative">
      {/* WALLPAPER */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${wallpaper})`,
        }}
      />

      <PageHeader
        icon={Heart}
        title="Private Chat"
        subtitle="Our little hidden world."
        accent="#F58A9C"
      />

      {/* FLOAT HEART */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{
              opacity: 0,
              y: 0,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              y: -120,
              scale: 1.5,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 1,
            }}
            className="fixed bottom-28 right-16 z-50"
          >
            <Heart
              fill="#F58A9C"
              className="text-blush-400"
              size={36}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT */}
      <div className="glass-card max-w-5xl mx-auto h-[78vh] flex flex-col overflow-hidden">
        {/* TOP */}
        <div className="border-b border-white/20 p-4 flex items-center justify-between bg-white/20 backdrop-blur-md">
          <div>
            <h2 className="serif text-2xl text-rose-deep">
              {otherUser ===
              'him'
                ? COUPLE.him
                    .nickname
                : COUPLE.her
                    .nickname}
            </h2>

            <p className="text-sm text-mauve-400">
              {typing
                ? `${
                    otherUser ===
                    'him'
                      ? COUPLE
                          .him
                          .nickname
                      : COUPLE
                          .her
                          .nickname
                  } is whispering...`
                : 'Online'}
            </p>
          </div>

          {/* WALLPAPER BTN */}
          <div>
            <button
              onClick={() =>
                wallpaperRef.current?.click()
              }
              className="btn-soft text-sm"
            >
              Change Wallpaper
            </button>

            <input
              ref={wallpaperRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                uploadWallpaper(
                  e.target
                    .files?.[0]
                )
              }
            />
          </div>
        </div>

        {/* REPLY */}
        {replying && (
          <div className="bg-white/40 px-4 py-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-mauve-400">
                Replying to
              </p>

              <p className="text-sm text-rose-deep">
                {replying.text}
              </p>
            </div>

            <button
              onClick={() =>
                setReplying(
                  null
                )
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(
            (m) => {
              const mine =
                m.sender ===
                user;

              return (
                <motion.div
                  key={m.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className={`flex ${
                    mine
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`relative group max-w-[80%] rounded-3xl px-5 py-3 ${
                      mine
                        ? 'bg-gradient-to-r from-blush-400 to-rose-deep text-white rounded-br-md'
                        : 'bg-white/70 text-mauve-600 rounded-bl-md'
                    }`}
                  >
                    {/* TEXT */}
                    {m.type ===
                      'text' && (
                      <p>
                        {m.text}
                      </p>
                    )}

                    {/* IMAGE */}
                    {m.type ===
                      'image' && (
                      <img
                        src={
                          m.image
                        }
                        alt=""
                        className="rounded-2xl max-h-72 object-cover"
                      />
                    )}

                    {/* VOICE */}
                    {m.type ===
                      'voice' && (
                      <audio
                        src={
                          m.voice
                        }
                        controls
                        className="w-full"
                      />
                    )}

                    {/* TIME */}
                    <div className="flex items-center gap-1 mt-2 text-[10px] opacity-70">
                      <span>
                        {m.createdAt
                          ?.toDate?.()
                          ?.toLocaleTimeString(
                            [],
                            {
                              hour:
                                '2-digit',
                              minute:
                                '2-digit',
                            }
                          )}
                      </span>

                      {mine && (
                        <span className="flex items-center gap-1">
                          <CheckCheck size={11} />
                          {m.seen
                            ? 'Seen'
                            : 'Sent'}
                        </span>
                      )}
                    </div>

                    {/* REACTION */}
                    {m.reaction && (
                      <div className="absolute -bottom-3 right-2 bg-white rounded-full px-2 shadow text-sm">
                        {
                          m.reaction
                        }
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="absolute -top-2 -right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() =>
                          setReplying(
                            m
                          )
                        }
                        className="bg-white rounded-full p-1 text-rose-deep shadow"
                      >
                        <Reply size={13} />
                      </button>

                      <button
                        onClick={() =>
                          setShowReactions(
                            showReactions ===
                              m.id
                              ? null
                              : m.id
                          )
                        }
                        className="bg-white rounded-full p-1 text-rose-deep shadow"
                      >
                        <Smile size={13} />
                      </button>

                      {mine && (
                        <button
                          onClick={() =>
                            remove(
                              m.id
                            )
                          }
                          className="bg-white rounded-full p-1 text-rose-deep shadow"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* REACTION PICKER */}
                    {showReactions ===
                      m.id && (
                      <div className="absolute -top-12 right-0 bg-white rounded-full shadow px-2 py-1 flex gap-1">
                        {reactions.map(
                          (
                            r
                          ) => (
                            <button
                              key={
                                r
                              }
                              onClick={() =>
                                react(
                                  m.id,
                                  r
                                )
                              }
                              className="hover:scale-125 transition"
                            >
                              {r}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            }
          )}

          <div
            ref={
              bottomRef
            }
          />
        </div>

        {/* INPUT */}
        <form
          onSubmit={send}
          className="border-t border-white/20 p-4 flex items-center gap-3 bg-white/20"
        >
          {/* IMAGE */}
          <button
            type="button"
            onClick={() =>
              fileRef.current?.click()
            }
            className="w-11 h-11 rounded-full bg-white/60 flex items-center justify-center text-rose-deep"
          >
            <ImageIcon size={18} />
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              sendImage(
                e.target
                  .files?.[0]
              )
            }
          />

          {/* TEXT */}
          <input
            className="input-soft flex-1"
            placeholder="Type something sweet..."
            value={text}
            onChange={(e) => {
              setText(
                e.target.value
              );

              updateTyping(
                e.target.value
                  .length > 0
              );
            }}
          />

          {/* MIC */}
          <button
            type="button"
            onClick={
              toggleRecording
            }
            className={`w-11 h-11 rounded-full flex items-center justify-center ${
              recording
                ? 'bg-rose-deep text-white animate-pulse'
                : 'bg-white/60 text-rose-deep'
            }`}
          >
            <Mic size={18} />
          </button>

          {/* SEND */}
          <button
            type="submit"
            disabled={
              uploading
            }
            className="btn-primary inline-flex items-center gap-2"
          >
            <Send size={16} />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;