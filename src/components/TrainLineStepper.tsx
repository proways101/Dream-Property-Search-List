'use client';

import React from 'react';
import { TRAIN_STOPS, TrainStopDefinition } from '@/lib/branchingEngine';
import { Check, Train, ArrowRight } from 'lucide-react';
import { PersonaType } from '@/types';

interface TrainLineStepperProps {
  currentStopIndex: number;
  visitedStops: number[];
  onSelectStop: (stopIndex: number) => void;
  selectedPersona?: PersonaType;
  intent?: 'buy' | 'rent';
}

export function TrainLineStepper({
  currentStopIndex,
  visitedStops,
  onSelectStop,
  intent,
}: TrainLineStepperProps) {
  return (
    <div className="w-full bg-slate-900 text-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-800">
      {/* Top Header & Branch Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Train className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              Interactive Property Search
            </div>
            <h2 className="text-base md:text-lg font-bold text-white">
              Find My Dream Property
            </h2>
          </div>
        </div>
      </div>

      {/* Train Line Track & Stations */}
      <div className="relative">
        {/* Horizontal Connecting Rail Line (Desktop) */}
        <div className="hidden md:block absolute top-5 left-6 right-6 h-1 bg-slate-800 -z-0">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500"
            style={{
              width: `${(Math.max(...visitedStops, currentStopIndex) / (TRAIN_STOPS.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {TRAIN_STOPS.map((stop, index) => {
            const isCurrent = currentStopIndex === index;
            const isCompleted = visitedStops.includes(index) && !isCurrent;
            const isVisited = visitedStops.includes(index) || isCurrent;

            return (
              <button
                key={stop.id}
                type="button"
                onClick={() => isVisited && onSelectStop(index)}
                disabled={!isVisited}
                className={`group flex flex-col items-center text-center p-2 rounded-xl transition-all duration-200 relative ${
                  isCurrent
                    ? 'bg-blue-600/10 ring-2 ring-blue-500'
                    : isVisited
                    ? 'hover:bg-slate-800 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Station Node Indicator */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md z-10 mb-2 ${
                    isCurrent
                      ? 'bg-blue-500 text-white ring-4 ring-blue-500/30 scale-110 shadow-blue-500/50'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <Train className="w-4 h-4" />
                  ) : (
                    <span>{stop.stepNumber}</span>
                  )}
                </div>

                {/* Stop Label */}
                <span
                  className={`text-xs font-semibold leading-tight ${
                    isCurrent
                      ? 'text-blue-400 font-bold'
                      : isCompleted
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {stop.id === 'affordability_engine' && intent === 'rent' ? 'Rent Budget' : stop.shortLabel}
                </span>

                {stop.isDynamicBranch && (
                  <span className="text-[10px] text-emerald-400 font-mono mt-0.5">
                    *Branch*
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
