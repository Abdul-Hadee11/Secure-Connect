import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Heart,
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
  LogOut,
  Menu,
  X,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';

const tabs = [
  { to: '/', label: 'Home', icon: Heart },

  { to: '/library', label: 'Library', icon: BookOpen },

  { to: '/gallery', label: 'Gallery', icon: ImageIcon },

  { to: '/postbox', label: 'Post Box', icon: Mail },

  // 💬 NEW CHAT TAB
  { to: '/chat', label: 'Chat', icon: MessageCircle },

  { to: '/reasons', label: 'Reasons', icon: Sparkles },

  { to: '/edits', label: 'Edits', icon: Film },

  { to: '/map', label: 'Memory Map', icon: Map },

  { to: '/bucket', label: 'Bucket List', icon: ListChecks },

  { to: '/music', label: 'Music Box', icon: Music },

  { to: '/movies', label: 'Movie Nights', icon: Clapperboard },

  { to: '/voice', label: 'Voice Notes', icon: Mic },

  { to: '/quotes', label: 'Quote Wall', icon: MessageCircle },

  { to: '/stars', label: 'Stargazing', icon: Star },
];

const Navbar = () => {
  const { user, logout, COUPLE } =
    useAuth();

  const navigate =
    useNavigate();

  const [open, setOpen] =
    useState(false);

  const handleLogout = () => {
    logout();

    navigate('/login');
  };

  const me =
    user === 'him'
      ? COUPLE.him
      : COUPLE.her;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/50 border-b border-blush-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* LOGO */}
        <NavLink
          to="/"
          className="flex items-center gap-2 shrink-0"
        >
          <Heart
            className="text-blush-500 animate-pulse-heart"
            size={26}
            fill="#F58A9C"
          />

          <span className="title-script text-2xl font-bold">
            H &amp; M
          </span>
        </NavLink>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex flex-1 items-center gap-2 overflow-x-auto px-3">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `tab-pill ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }
            >
              <t.icon size={15} />

              <span>
                {t.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="ml-auto flex items-center gap-3">
          {me && (
            <span className="hidden sm:inline-flex items-center gap-2 text-sm text-mauve-500">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background:
                    me.color,
                }}
              />

              <span className="handwritten text-lg">
                {
                  me.nickname
                }
              </span>
            </span>
          )}

          {/* LOGOUT */}
          <button
            onClick={
              handleLogout
            }
            className="btn-soft hidden sm:inline-flex items-center gap-1.5 !py-1.5 !px-3 text-sm"
          >
            <LogOut
              size={14}
            />

            Sign out
          </button>

          {/* MOBILE MENU */}
          <button
            className="lg:hidden p-2 rounded-full bg-white/70 text-blush-500"
            onClick={() =>
              setOpen(
                (o) => !o
              )
            }
          >
            {open ? (
              <X size={20} />
            ) : (
              <Menu
                size={20}
              />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            className="lg:hidden overflow-hidden bg-white/80 backdrop-blur-md border-t border-blush-100"
          >
            <div className="p-4 grid grid-cols-2 gap-2">
              {tabs.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.to === '/'}
                  onClick={() =>
                    setOpen(false)
                  }
                  className={({ isActive }) =>
                    `tab-pill justify-center ${
                      isActive
                        ? 'active'
                        : ''
                    }`
                  }
                >
                  <t.icon size={15} />

                  <span>
                    {t.label}
                  </span>
                </NavLink>
              ))}

              {/* MOBILE LOGOUT */}
              <button
                onClick={
                  handleLogout
                }
                className="btn-soft col-span-2 justify-center inline-flex items-center gap-1.5 mt-2"
              >
                <LogOut
                  size={14}
                />

                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;