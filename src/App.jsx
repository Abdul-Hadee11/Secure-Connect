import React, {
  useEffect,
  useState,
} from 'react';

import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import Navbar from './components/Navbar.jsx';
import PetalRain from './components/PetalRain.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Library from './pages/Library.jsx';
import Gallery from './pages/Gallery.jsx';
import PostBox from './pages/PostBox.jsx';
import Chat from './pages/Chat.jsx';
import Reasons from './pages/Reasons.jsx';
import Edits from './pages/Edits.jsx';
import MemoryMap from './pages/MemoryMap.jsx';
import BucketList from './pages/BucketList.jsx';
import MusicBox from './pages/MusicBox.jsx';
import MovieNights from './pages/MovieNights.jsx';
import VoiceNotes from './pages/VoiceNotes.jsx';
import QuoteWall from './pages/QuoteWall.jsx';
import Stargazing from './pages/Stargazing.jsx';

import {
  X,
  Mail,
} from 'lucide-react';

import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';

import { db } from './firebase/config.js';

import { useAuth } from './context/AuthContext.jsx';

const Page = ({ children }) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 16,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    exit={{
      opacity: 0,
      y: -10,
    }}
    transition={{
      duration: 0.4,
    }}
    className="max-w-7xl mx-auto px-4 py-10 relative z-10"
  >
    {children}
  </motion.div>
);

const App = () => {
  const { user } =
    useAuth();

  const location =
    useLocation();

  // GLOBAL LETTER POPUP
  const [
    globalLetter,
    setGlobalLetter,
  ] = useState(null);

  const [
    popupShown,
    setPopupShown,
  ] = useState(false);

  // FIRESTORE LISTENER
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'letters'),
      where('to', '==', user),
      where(
        'read',
        '==',
        false
      )
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (
          !snap.empty &&
          !popupShown
        ) {
          const letter = {
            id: snap.docs[0].id,
            ...snap.docs[0].data(),
          };

          setGlobalLetter(
            letter
          );

          setPopupShown(
            true
          );
        }
      }
    );

    return () => unsub();
  }, [user]);

  // CLOSE POPUP
  const closePopup =
    async () => {
      if (!globalLetter)
        return;

      await updateDoc(
        doc(
          db,
          'letters',
          globalLetter.id
        ),
        {
          read: true,
        }
      );

      setGlobalLetter(
        null
      );
    };

  return (
    <div className="min-h-screen relative">
      <PetalRain
        count={
          user ? 16 : 22
        }
      />

      {user && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes
          location={location}
          key={
            location.pathname
          }
        >
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to="/"
                  replace
                />
              ) : (
                <Login />
              )
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Page>
                  <Home />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Page>
                  <Library />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <Page>
                  <Gallery />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/postbox"
            element={
              <ProtectedRoute>
                <Page>
                  <PostBox />
                </Page>
              </ProtectedRoute>
            }
          />

          {/* 💬 CHAT ROUTE */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Page>
                  <Chat />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reasons"
            element={
              <ProtectedRoute>
                <Page>
                  <Reasons />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edits"
            element={
              <ProtectedRoute>
                <Page>
                  <Edits />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <Page>
                  <MemoryMap />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bucket"
            element={
              <ProtectedRoute>
                <Page>
                  <BucketList />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/music"
            element={
              <ProtectedRoute>
                <Page>
                  <MusicBox />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <Page>
                  <MovieNights />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/voice"
            element={
              <ProtectedRoute>
                <Page>
                  <VoiceNotes />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/quotes"
            element={
              <ProtectedRoute>
                <Page>
                  <QuoteWall />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stars"
            element={
              <ProtectedRoute>
                <Page>
                  <Stargazing />
                </Page>
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </AnimatePresence>

      {/* GLOBAL LETTER POPUP */}
      <AnimatePresence>
        {globalLetter && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <motion.div
              initial={{
                scale: 0.9,
                y: 40,
              }}
              animate={{
                scale: 1,
                y: 0,
              }}
              exit={{
                scale: 0.9,
              }}
              className="glass-card max-w-2xl w-full p-8 relative"
            >
              <button
                onClick={
                  closePopup
                }
                className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 p-2 rounded-full"
              >
                <X
                  size={20}
                />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Mail className="text-blush-500" />

                <h2 className="title-script text-4xl">
                  A Letter For
                  You ♡
                </h2>
              </div>

              <h3 className="serif text-3xl text-rose-deep mb-4">
                {
                  globalLetter.title
                }
              </h3>

              <p className="whitespace-pre-wrap text-mauve-500 leading-relaxed">
                {
                  globalLetter.body
                }
              </p>

              <div className="flex justify-end mt-8">
                <button
                  onClick={
                    closePopup
                  }
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center text-sm text-mauve-300 py-6 relative z-10">
        Made with 💕 for
        Mehak — by Abdul
        Hadee
      </footer>
    </div>
  );
};

export default App;