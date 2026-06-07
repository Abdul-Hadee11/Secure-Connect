import React, {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

import {
  BookOpen,
  Image as ImageIcon,
  Mail,
  Sparkles,
  Film,
  Map,
  ListChecks,
  Music,
  Clapperboard,
  Mic,
  MessageCircle,
  Star,
  Heart,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';

import { db } from '../firebase/config.js';

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';

const cards = [
  {
    to: '/library',
    label: 'Library',
    icon: BookOpen,
    desc: 'Our written treasures',
    color: '#F58A9C',
  },

  {
    to: '/gallery',
    label: 'Gallery',
    icon: ImageIcon,
    desc: 'Frozen sunlit moments',
    color: '#E9A8B6',
  },

  {
    to: '/postbox',
    label: 'Post Box',
    icon: Mail,
    desc: 'Letters for you, my love',
    color: '#D48AA8',
  },

  // 💬 CHAT CARD
  {
    to: '/chat',
    label: 'Chat',
    icon: MessageCircle,
    desc: 'Our private space',
    color: '#F07C98',
  },

  {
    to: '/reasons',
    label: 'Reasons',
    icon: Sparkles,
    desc: 'Why I love you',
    color: '#C97DA7',
  },

  {
    to: '/edits',
    label: 'Edits',
    icon: Film,
    desc: 'Reels of us',
    color: '#B27BC0',
  },

  {
    to: '/map',
    label: 'Memory Map',
    icon: Map,
    desc: 'Places that hold us',
    color: '#9C8EC7',
  },

  {
    to: '/bucket',
    label: 'Bucket List',
    icon: ListChecks,
    desc: 'Dreams we chase',
    color: '#8E6586',
  },

  {
    to: '/music',
    label: 'Music Box',
    icon: Music,
    desc: 'Our songs',
    color: '#C9A9C0',
  },

  {
    to: '/movies',
    label: 'Movie Nights',
    icon: Clapperboard,
    desc: 'Cuddle-and-watch list',
    color: '#D9869A',
  },

  {
    to: '/voice',
    label: 'Voice Notes',
    icon: Mic,
    desc: 'Whispers, saved',
    color: '#E76A85',
  },

  {
    to: '/quotes',
    label: 'Quote Wall',
    icon: MessageCircle,
    desc: 'Words we said',
    color: '#A8506C',
  },

  {
    to: '/stars',
    label: 'Stargazing',
    icon: Star,
    desc: 'Wishes we made',
    color: '#7BA7BC',
  },
];

const Home = () => {
  const { user, COUPLE } =
    useAuth();

  const me =
    user === 'him'
      ? COUPLE.him
      : COUPLE.her;

  const them =
    user === 'him'
      ? COUPLE.her
      : COUPLE.him;

  const [
    unreadLetters,
    setUnreadLetters,
  ] = useState(0);

  const [
    daysTogether,
    setDaysTogether,
  ] = useState(0);

  useEffect(() => {
    const start =
      new Date(
        COUPLE.anniversary
      );

    const diff =
      Math.floor(
        (Date.now() -
          start.getTime()) /
          86400000
      );

    setDaysTogether(
      Math.max(
        0,
        diff
      )
    );
  }, [COUPLE.anniversary]);

  useEffect(() => {
    try {
      const q = query(
        collection(
          db,
          'letters'
        ),

        where(
          'to',
          '==',
          user
        ),

        where(
          'read',
          '==',
          false
        ),

        orderBy(
          'createdAt',
          'desc'
        ),

        limit(20)
      );

      const unsub =
        onSnapshot(
          q,
          (snap) =>
            setUnreadLetters(
              snap.size
            ),

          () =>
            setUnreadLetters(
              0
            )
        );

      return () =>
        unsub();
    } catch (e) {
      // offline-safe
    }
  }, [user]);

  return (
    <>
      {/* HERO */}
      <motion.section
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="text-center mb-12"
      >
        <p className="handwritten text-2xl text-mauve-500">
          welcome back,
          my
        </p>

        <h1 className="title-script text-6xl md:text-7xl">
          {
            me?.nickname
          }{' '}
          💕
        </h1>

        <p className="handwritten text-xl text-mauve-500 mt-2">
          We&apos;ve
          been weaving
          this story for{' '}
          <span className="serif text-rose-deep font-bold text-2xl">
            {
              daysTogether
            }
          </span>{' '}
          beautiful
          days.
        </p>
      </motion.section>

      {/* LETTER ALERT */}
      {unreadLetters >
        0 && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="glass-card max-w-2xl mx-auto p-6 mb-10 text-center border-2 border-blush-300"
        >
          <Mail
            className="mx-auto text-blush-500 mb-2 animate-pulse-heart"
            size={32}
          />

          <h2 className="serif text-2xl text-rose-deep">
            A Letter for
            you ✉️
          </h2>

          <p className="handwritten text-xl text-mauve-500 mt-1">
            {
              them?.nickname
            }{' '}
            left{' '}
            {
              unreadLetters
            }{' '}
            unread
            letter
            {unreadLetters >
            1
              ? 's'
              : ''}{' '}
            in your Post
            Box.
          </p>

          <Link
            to="/postbox"
            className="btn-primary inline-block mt-4"
          >
            Open it now
            →
          </Link>
        </motion.div>
      )}

      {/* CARDS */}
      <div className="flex flex-wrap justify-center gap-5">
        {cards.map(
          (c, i) => (
            <motion.div
              key={c.to}
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
              className="w-full sm:w-[48%] md:w-[31%] lg:w-[23%]"
            >
              <Link
                to={c.to}
                className="glass-card p-6 block hover:shadow-petal transition-all hover:-translate-y-1 group h-full"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{
                    background: `${c.color}22`,
                    color:
                      c.color,
                  }}
                >
                  <c.icon
                    size={
                      24
                    }
                  />
                </div>

                <h3 className="serif text-2xl font-semibold text-rose-deep">
                  {c.label}
                </h3>

                <p className="text-sm text-mauve-500 mt-1">
                  {c.desc}
                </p>
              </Link>
            </motion.div>
          )
        )}
      </div>

      {/* FOOT NOTE */}
      <div className="text-center mt-12 text-mauve-300 handwritten text-2xl">
        <Heart
          size={18}
          className="inline text-blush-400"
          fill="#F58A9C"
        />{' '}
        always yours{' '}
        <Heart
          size={18}
          className="inline text-blush-400"
          fill="#F58A9C"
        />
      </div>
    </>
  );
};

export default Home;