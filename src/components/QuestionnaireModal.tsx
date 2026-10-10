'use client';

import React, { useState } from 'react';
import { SearchCriteria, PersonaType, HouseType } from '@/types';
import { TRAIN_STOPS } from '@/lib/branchingEngine';
import { calculateMaxHomePrice, getInterestRateForCreditScore } from '@/lib/affordability';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  Home, 
  Sliders, 
  Bell, 
  Users, 
  Briefcase, 
  TrendingUp, 
  HeartHandshake, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface QuestionnaireModalProps {
  criteria: SearchCriteria;
  onChangeCriteria: (criteria: SearchCriteria) => void;
  currentStopIndex: number;
  setCurrentStopIndex: (index: number) => void;
  visitedStops: number[];
  setVisitedStops: React.Dispatch<React.SetStateAction<number[]>>;
  onExecuteSearch: () => void;
  onSaveCriteria: () => void;
  isLoggedIn: boolean;
}

export function QuestionnaireModal({
  criteria,
  onChangeCriteria,
  currentStopIndex,
  setCurrentStopIndex,
  visitedStops,
  setVisitedStops,
  onExecuteSearch,
  onSaveCriteria,
  isLoggedIn
}: QuestionnaireModalProps) {
  const currentStop = TRAIN_STOPS[currentStopIndex];

  // Helper to update criteria and recompute price ceiling
  const updateField = <K extends keyof SearchCriteria>(key: K, value: SearchCriteria[K]) => {
    const updated = { ...criteria, [key]: value };
    // If financial fields change, recalculate price ceiling
    if (['downPayment', 'monthlyIncome', 'maxMonthlyMortgage', 'creditScore'].includes(key as string)) {
      const { maxPrice } = calculateMaxHomePrice(
        updated.downPayment,
        updated.monthlyIncome,
        updated.maxMonthlyMortgage,
        updated.creditScore
      );
      updated.calculatedMaxPrice = maxPrice;
    }
    onChangeCriteria(updated);
  };

  const handleNext = () => {
    if (!visitedStops.includes(currentStopIndex)) {
      setVisitedStops(prev => [...prev, currentStopIndex]);
    }
    if (currentStopIndex < TRAIN_STOPS.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1);
    } else {
      onExecuteSearch();
    }
  };

  const handlePrev = () => {
    if (currentStopIndex > 0) {
      setCurrentStopIndex(currentStopIndex - 1);
    }
  };

  // Check 36% gross income warning for mortgage
  const isMortgageAbove36Percent = criteria.maxMonthlyMortgage > criteria.monthlyIncome * 0.36;
  const currentInterestRate = (getInterestRateForCreditScore(criteria.creditScore) * 100).toFixed(2);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Train Stop Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white flex items-center justify-between">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-blue-400 mb-1 flex items-center gap-2">
            <span>Train Station {currentStopIndex + 1} of {TRAIN_STOPS.length}</span>
            {currentStop.isDynamicBranch && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Dynamic Branch Junction
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black">{currentStop.title}</h2>
          <p className="text-sm text-slate-300 mt-1">{currentStop.subtitle}</p>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* STOP 1: LOCATION */}
        {currentStopIndex === 0 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  State (Hard Filter)
                </label>
                <select
                  value={criteria.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TX">TX — Texas</option>
                  <option value="CA">CA — California</option>
                  <option value="FL">FL — Florida</option>
                  <option value="NY">NY — New York</option>
                  <option value="WA">WA — Washington</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  City (Required)
                </label>
                <input
                  type="text"
                  value={criteria.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="e.g. Austin"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Zip Code (Optional Override)
                </label>
                <input
                  type="text"
                  value={criteria.zipCode}
                  onChange={(e) => updateField('zipCode', e.target.value)}
                  placeholder="e.g. 78749"
                  maxLength={5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Search Radius: <span className="text-blue-600 font-black">{criteria.radiusMiles} Miles</span>
                </label>
                <span className="text-xs text-slate-400">Allowed: 1 – 100 mi</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={criteria.radiusMiles}
                onChange={(e) => updateField('radiusMiles', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}

        {/* STOP 2: LIFESTYLE PERSONA FORK */}
        {currentStopIndex === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <p className="text-sm text-slate-600 font-medium">
              Select your persona. The algorithm will fork the subsequent train stop to ask specialized questions tailored exclusively to your scenario:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'family',
                  title: 'Growing Family',
                  icon: Users,
                  desc: 'Focus on top-rated school zones, fenced backyards, safe neighborhood parks.',
                },
                {
                  id: 'relocating',
                  title: 'Relocating Professional',
                  icon: Briefcase,
                  desc: 'Priority on commute corridors, tech hubs, expressways, and home offices.',
                },
                {
                  id: 'first_time',
                  title: 'First-Time Buyer',
                  icon: Sparkles,
                  desc: 'Priority on strict affordability, grants, move-in readiness, low HOA.',
                },
                {
                  id: 'investor',
                  title: 'Real Estate Investor',
                  icon: TrendingUp,
                  desc: 'Targeting rental demand, cashflow yield, multi-family or low HOA fees.',
                },
                {
                  id: 'retiree',
                  title: 'Retiree / Downsizing',
                  icon: HeartHandshake,
                  desc: 'Priority on single-story layouts, low maintenance, serene neighborhoods.',
                },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = criteria.persona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateField('persona', p.id as PersonaType)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-4 ring-blue-500/10 shadow-lg'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="font-bold text-slate-900 text-base">{p.title}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STOP 3: DYNAMIC PERSONA BRANCH */}
        {currentStopIndex === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {criteria.persona === 'family' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  🌿 Family Branch Activated: Fine-tuning child-friendly criteria
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={criteria.familyPriorities?.mustHaveYard ?? true}
                      onChange={(e) => updateField('familyPriorities', { ...criteria.familyPriorities!, mustHaveYard: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-800">Must Have Private Yard / Lawn</div>
                      <div className="text-xs text-slate-500">Essential for children outdoor play and pets</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={criteria.familyPriorities?.quietStreet ?? true}
                      onChange={(e) => updateField('familyPriorities', { ...criteria.familyPriorities!, quietStreet: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-800">Cul-de-sac or Low-Traffic Street Preferred</div>
                      <div className="text-xs text-slate-500">Minimizes through-traffic for safety</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {criteria.persona === 'relocating' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-blue-800 text-xs font-semibold">
                  🚗 Commuter Branch Activated: Work address & traffic corridor routing
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Workplace Destination Address
                  </label>
                  <input
                    type="text"
                    value={criteria.commutePriorities?.workAddress || criteria.workAddress}
                    onChange={(e) => {
                      updateField('workAddress', e.target.value);
                      updateField('commutePriorities', { ...criteria.commutePriorities!, workAddress: e.target.value });
                    }}
                    placeholder="e.g. 500 W 2nd St, Austin, TX (or employer campus)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Max Tolerable Commute: <span className="text-blue-600 font-black">{criteria.maxCommuteMinutes} min</span>
                    </label>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={90}
                    step={5}
                    value={criteria.maxCommuteMinutes}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField('maxCommuteMinutes', val);
                      updateField('commutePriorities', { ...criteria.commutePriorities!, maxCommuteMinutes: val });
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            )}

            {criteria.persona === 'retiree' && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-purple-800 text-xs font-semibold">
                  🏡 Retiree Branch: Accessibility & low maintenance
                </div>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criteria.retireePriorities?.singleStoryOnly ?? true}
                    onChange={(e) => updateField('retireePriorities', { ...criteria.retireePriorities!, singleStoryOnly: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-800">Single-Story Floor Plan Only (Zero Stairs)</div>
                    <div className="text-xs text-slate-500">Crucial for aging-in-place convenience</div>
                  </div>
                </label>
              </div>
            )}

            {criteria.persona === 'first_time' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs font-semibold">
                  🔑 First-Time Homebuyer Branch: Move-in readiness and predictable costs
                </div>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={criteria.firstTimePriorities?.moveInReady ?? true}
                    onChange={(e) => updateField('firstTimePriorities', { ...criteria.firstTimePriorities!, moveInReady: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-800">Move-in Ready (No major renovation budget needed)</div>
                    <div className="text-xs text-slate-500">Filters for turnkey homes with updated mechanicals</div>
                  </div>
                </label>
              </div>
            )}

            {criteria.persona === 'investor' && (
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-teal-800 text-xs font-semibold">
                  📊 Investor Branch: Yield, HOA flexibility & cashflow
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Primary Investment Objective
                  </label>
                  <select
                    value={criteria.investorPriorities?.strategy ?? 'cashflow'}
                    onChange={(e) => updateField('investorPriorities', { ...criteria.investorPriorities!, strategy: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="cashflow">High Cash-on-Cash Return / Strong Rental Demand</option>
                    <option value="appreciation">Long-term Capital Appreciation / High Growth Corridor</option>
                    <option value="turnkey">Turnkey Low-maintenance Rental</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STOP 4: AFFORDABILITY ENGINE (Exact Specification) */}
        {currentStopIndex === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Down Payment ($) (Specification default: $50,000)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={criteria.downPayment}
                    onChange={(e) => updateField('downPayment', Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Gross Monthly Income ($) (Default: $8,000)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={criteria.monthlyIncome}
                    onChange={(e) => updateField('monthlyIncome', Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Max Monthly Mortgage Budget ($) (Default: $3,000)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={criteria.maxMonthlyMortgage}
                    onChange={(e) => updateField('maxMonthlyMortgage', Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-800"
                  />
                </div>
                {isMortgageAbove36Percent && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Warning: Desired mortgage exceeds 36% of gross income ($2,880).</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Credit Score: <span className="text-blue-600 font-black">{criteria.creditScore}</span>
                  </label>
                  <span className="text-xs font-medium text-emerald-600">Rate: {currentInterestRate}% APR</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={850}
                  value={criteria.creditScore}
                  onChange={(e) => updateField('creditScore', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>300 (Challenged)</span>
                  <span>720 (Default)</span>
                  <span>850 (Exceptional)</span>
                </div>
              </div>
            </div>

            {/* Calculated Affordability Ceiling Box */}
            <div className="p-5 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl text-white shadow-lg space-y-2">
              <div className="text-xs uppercase font-bold tracking-wider text-blue-300">
                Specification Price Ceiling Guarantee
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-3xl font-black text-emerald-400">
                  ${criteria.calculatedMaxPrice.toLocaleString()}
                </div>
                <div className="text-xs text-slate-300">
                  Includes 2% TX Property Tax + 0.5% Ins + PMI
                </div>
              </div>
              <p className="text-xs text-blue-100">
                Homes priced above this ceiling (such as $1,135,000) are automatically removed by the search engine.
              </p>
            </div>
          </div>
        )}

        {/* STOP 5: PROPERTY HARD REQUIREMENTS */}
        {currentStopIndex === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Min Bedrooms (0–10)
                </label>
                <select
                  value={criteria.bedrooms}
                  onChange={(e) => updateField('bedrooms', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}+ Bedrooms</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Min Bathrooms (0–10)
                </label>
                <select
                  value={criteria.bathrooms}
                  onChange={(e) => updateField('bathrooms', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold"
                >
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((n) => (
                    <option key={n} value={n}>{n}+ Baths</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Min Sq Ft (0–10,000)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={criteria.minSqFt}
                  onChange={(e) => updateField('minSqFt', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                House Types (Hard Filter)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['Single Family', 'Townhouse', 'Condo', 'Multi-Family'] as HouseType[]).map((type) => {
                  const isChecked = criteria.houseTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer font-semibold text-xs transition ${
                        isChecked ? 'bg-blue-50 border-blue-600 text-blue-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...criteria.houseTypes, type]
                            : criteria.houseTypes.filter((t) => t !== type);
                          updateField('houseTypes', newTypes);
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Max Home Age: <span className="text-blue-600 font-black">{criteria.maxHomeAge} years</span>
                </label>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                value={criteria.maxHomeAge}
                onChange={(e) => updateField('maxHomeAge', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}

        {/* STOP 6: SOFT PREFERENCES & WEIGHTAGE */}
        {currentStopIndex === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <p className="text-xs text-slate-500 font-medium">
              Soft preferences won't eliminate homes from results; they lower or raise the Dream Score. Customize weightages below:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase">Min School Rating (1-10)</span>
                  <span className="text-xs font-black text-blue-600">{criteria.minSchoolRating} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={criteria.minSchoolRating}
                  onChange={(e) => updateField('minSchoolRating', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between items-center text-xs text-slate-600 pt-1 border-t border-slate-200">
                  <span>Weightage:</span>
                  <span className="font-bold text-blue-600">{criteria.weights.schools}%</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase">Min Safety Score (0-100)</span>
                  <span className="text-xs font-black text-emerald-600">{criteria.minSafetyScore} / 100</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={criteria.minSafetyScore}
                  onChange={(e) => updateField('minSafetyScore', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between items-center text-xs text-slate-600 pt-1 border-t border-slate-200">
                  <span>Weightage:</span>
                  <span className="font-bold text-emerald-600">{criteria.weights.safety}%</span>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={criteria.nearbyRecreation}
                onChange={(e) => updateField('nearbyRecreation', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <div className="text-sm font-bold text-slate-800">Nearby Recreation Required</div>
                <div className="text-xs text-slate-500">Parks, hike and bike greenbelts within 2 miles</div>
              </div>
            </label>
          </div>
        )}

        {/* STOP 7: OFFLINE SEARCH & NOTIFY */}
        {currentStopIndex === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.offlineSearchNotify}
                  onChange={(e) => updateField('offlineSearchNotify', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded mt-0.5"
                />
                <div>
                  <div className="text-sm font-bold text-indigo-950">
                    Offline Search and Notify (Specification Feature)
                  </div>
                  <div className="text-xs text-indigo-700 leading-relaxed mt-1">
                    Automated background batch runner will evaluate newly published MLS properties daily against your saved criteria. If a match achieves 90% or higher Dream Score, an instant email alert is dispatched.
                  </div>
                </div>
              </label>

              {criteria.offlineSearchNotify && (
                <div className="pt-3 border-t border-indigo-200">
                  <label className="block text-xs font-bold text-indigo-950 uppercase mb-2">
                    Notification Email Address
                  </label>
                  <input
                    type="email"
                    value={criteria.userEmail}
                    onChange={(e) => updateField('userEmail', e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-indigo-300 font-medium text-slate-900 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Quick Summary of Search */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800">Search Parameter Summary:</div>
              <div>• Destination: {criteria.city}, {criteria.state} ({criteria.radiusMiles} mi radius)</div>
              <div>• Max Budget Ceiling: <span className="font-bold text-emerald-600">${criteria.calculatedMaxPrice.toLocaleString()}</span></div>
              <div>• Criteria Minimums: {criteria.bedrooms} Beds, {criteria.bathrooms} Baths, {criteria.minSqFt} sqft</div>
              <div>• Minimum Score Threshold: 80% Dream Match</div>
            </div>
          </div>
        )}

        {/* Action Controls & Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStopIndex === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              currentStopIndex === 0
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Stop</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSaveCriteria}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <span>Save Criteria</span>
            </button>

            {currentStopIndex < TRAIN_STOPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
              >
                <span>Next Stop</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onExecuteSearch}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg transition animate-pulse"
              >
                <Sparkles className="w-4 h-4" />
                <span>Find My Dream Home</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
