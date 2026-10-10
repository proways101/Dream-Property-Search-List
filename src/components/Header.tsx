'use client';

import React from 'react';
import { UserProfile, SearchCriteria } from '@/types';
import { Sparkles, Bookmark, User, LogOut, RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  onOpenOAuth: () => void;
  onSignOut: () => void;
  onOpenSavedSearches: () => void;
  savedCount: number;
  onReset: () => void;
  criteria: SearchCriteria;
}

export function Header({
  user,
  onOpenOAuth,
  onSignOut,
  onOpenSavedSearches,
  savedCount,
  onReset,
  criteria,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-900">
                Dream-Property-Search-List
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                v2.0 MLS Match
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              <span className="uppercase font-bold text-blue-600">{criteria.intent}</span> in {criteria.city}, {criteria.state} &bull; Budget Ceiling: <span className="font-semibold text-emerald-600">${criteria.calculatedMaxPrice.toLocaleString()}{criteria.intent === 'rent' ? '/mo' : ''}</span>
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Saved Searches Drawer Trigger */}
          <button
            onClick={onOpenSavedSearches}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition hover:bg-slate-50 relative"
          >
            <Bookmark className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Saved Criteria</span>
            {savedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* Reset / Fresh Journey */}
          <button
            onClick={onReset}
            title="Start fresh questionnaire"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Google Authentication */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">{user.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{user.email}</div>
                </div>
              </div>
              <button
                onClick={onSignOut}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenOAuth}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Google Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
