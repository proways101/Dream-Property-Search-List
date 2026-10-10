'use client';

import React from 'react';
import { SavedSearchItem, SearchCriteria } from '@/types';
import { Bookmark, Copy, Trash2, ArrowRight, RotateCcw, X, PlusCircle } from 'lucide-react';

interface SavedSearchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSearches: SavedSearchItem[];
  onLoadSearch: (criteria: SearchCriteria) => void;
  onCloneSearch: (item: SavedSearchItem) => void;
  onDeleteSearch: (id: string) => void;
  onStartFromScratch: () => void;
}

export function SavedSearchesModal({
  isOpen,
  onClose,
  savedSearches,
  onLoadSearch,
  onCloneSearch,
  onDeleteSearch,
  onStartFromScratch,
}: SavedSearchesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Saved Dreamlist Criteria</h3>
              <p className="text-xs text-slate-500">Restore prior train stops or clone to test new branches</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto py-4 flex-1 space-y-4">
          {savedSearches.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="font-semibold text-slate-600">No saved searches yet.</p>
              <p className="text-xs mt-1">Complete your questionnaire and click "Save Criteria" to store your journey.</p>
            </div>
          ) : (
            savedSearches.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Saved on {new Date(item.createdAt).toLocaleDateString()} • {item.criteria.city}, {item.criteria.state} ({item.criteria.radiusMiles} mi radius)
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
                    <span>{item.dreamCount} Dream Matches</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span className="bg-white px-2 py-1 rounded-md border border-slate-200 font-semibold">
                    Max Price: ${item.criteria.calculatedMaxPrice.toLocaleString()}
                  </span>
                  <span className="bg-white px-2 py-1 rounded-md border border-slate-200 font-semibold">
                    {item.criteria.bedrooms}+ Beds, {item.criteria.bathrooms}+ Baths
                  </span>
                  <span className="bg-white px-2 py-1 rounded-md border border-slate-200 capitalize font-semibold">
                    Persona: {item.criteria.persona}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => {
                      onLoadSearch(item.criteria);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <span>Load Criteria</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCloneSearch(item)}
                      title="Duplicate this search to create an alternate branch"
                      className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Clone & Modify</span>
                    </button>

                    <button
                      onClick={() => onDeleteSearch(item.id)}
                      title="Delete search"
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Start from Scratch */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onStartFromScratch();
              onClose();
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-bold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Fresh From Scratch</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
