'use client';

import React, { useState, useEffect } from 'react';
import { SearchCriteria, PersonaType, HouseType } from '@/types';
import { TRAIN_STOPS } from '@/lib/branchingEngine';
import { calculateMaxHomePrice, getInterestRateForCreditScore } from '@/lib/affordability';
import { ALL_US_STATES_AND_TERRITORIES, getCitiesForState, US_CITIES_BY_STATE } from '@/data/usLocations';
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
  CheckCircle2,
  Key,
  Search,
  Loader2,
  Check,
  Building2
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

  // City & Zipcode search states
  const [locationMode, setLocationMode] = useState<'city' | 'zipcode'>('city');
  const [cityInput, setCityInput] = useState<string>(criteria.city || 'Austin');
  const [zipInput, setZipInput] = useState<string>(criteria.zipCode || '');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);
  const [isZipLoading, setIsZipLoading] = useState<boolean>(false);
  const [zipResult, setZipResult] = useState<any | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);

  // Sync cityInput when criteria.city changes
  useEffect(() => {
    if (criteria.city) {
      setCityInput(criteria.city);
    }
  }, [criteria.city]);

  // Helper to update criteria and recompute price ceiling
  const updateField = <K extends keyof SearchCriteria>(key: K, value: SearchCriteria[K]) => {
    const updated = { ...criteria, [key]: value };

    if (key === 'intent') {
      if (value === 'rent') {
        if (updated.maxMonthlyMortgage > 6000) {
          updated.maxMonthlyMortgage = 2500;
        }
        updated.calculatedMaxPrice = updated.maxMonthlyMortgage || 2500;
      } else {
        const { maxPrice } = calculateMaxHomePrice(
          updated.downPayment,
          updated.monthlyIncome,
          updated.maxMonthlyMortgage,
          updated.creditScore
        );
        updated.calculatedMaxPrice = maxPrice;
      }
    } else if (['downPayment', 'monthlyIncome', 'maxMonthlyMortgage', 'creditScore'].includes(key as string)) {
      if (updated.intent === 'rent') {
        updated.calculatedMaxPrice = updated.maxMonthlyMortgage || 2500;
      } else {
        const { maxPrice } = calculateMaxHomePrice(
          updated.downPayment,
          updated.monthlyIncome,
          updated.maxMonthlyMortgage,
          updated.creditScore
        );
        updated.calculatedMaxPrice = maxPrice;
      }
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

  // State selection handler
  const handleStateChange = (newCode: string) => {
    const defaultCities = US_CITIES_BY_STATE[newCode] || [];
    const newCity = defaultCities[0] || 'Metro Center';
    const updated: SearchCriteria = {
      ...criteria,
      state: newCode,
      city: newCity,
      zipCode: '', // reset zip on state change
    };
    setCityInput(newCity);
    setZipInput('');
    setZipResult(null);
    onChangeCriteria(updated);
  };

  // Zipcode API Lookup
  const handleZipLookup = async (zipToSearch: string) => {
    if (zipToSearch.length !== 5) {
      setZipError('Please enter a 5-digit US zipcode');
      return;
    }
    setIsZipLoading(true);
    setZipError(null);
    setZipResult(null);

    try {
      const res = await fetch(`/api/zipcode?zip=${zipToSearch}`);
      const data = await res.json();
      if (res.ok && data.success && data.places && data.places.length > 0) {
        setZipResult(data.places);
        const firstPlace = data.places[0];
        // If state matches or user accepts
        const updated: SearchCriteria = {
          ...criteria,
          state: firstPlace.stateAbbr,
          city: firstPlace.city,
          zipCode: zipToSearch,
        };
        setCityInput(firstPlace.city);
        onChangeCriteria(updated);
      } else {
        setZipError(data.message || `No cities found for zipcode ${zipToSearch}`);
      }
    } catch (e) {
      setZipError('Error contacting zipcode service');
    } finally {
      setIsZipLoading(false);
    }
  };

  // Dynamic city typeahead options strictly within criteria.state
  const filteredCities = getCitiesForState(criteria.state, cityInput);

  // Check 36% gross income warning for mortgage
  const isMortgageAbove36Percent = criteria.maxMonthlyMortgage > criteria.monthlyIncome * 0.36;
  const currentInterestRate = (getInterestRateForCreditScore(criteria.creditScore) * 100).toFixed(2);
  const selectedStateObj = ALL_US_STATES_AND_TERRITORIES.find(s => s.code === criteria.state);

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
          <h2 className="text-xl md:text-2xl font-black">
            {currentStopIndex === 1
              ? (criteria.intent === 'buy' ? 'Stop 2: Which State are you planning to Buy?' : 'Stop 2: Which State are you planning to Rent?')
              : currentStopIndex === 5 && criteria.intent === 'rent'
              ? 'Stop 6: Rental Affordability & Unit Requirements'
              : currentStopIndex === 6 && criteria.intent === 'rent'
              ? 'Stop 7: Rental Amenities & Square Footage'
              : currentStop.title}
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            {currentStopIndex === 1
              ? `Select from all 50 US States and Territories for your ${criteria.intent.toUpperCase()} search.`
              : currentStopIndex === 5 && criteria.intent === 'rent'
              ? 'Fine-tune your rental search with your monthly income, rent budget, bedrooms, and bathrooms.'
              : currentStopIndex === 6 && criteria.intent === 'rent'
              ? 'Refine your minimum square footage, building types, and property preferences.'
              : currentStop.subtitle}
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* ========================================================= */}
        {/* STOP 1: TRANSACTION INTENT (BUY OR RENT RADIO)           */}
        {/* ========================================================= */}
        {currentStopIndex === 0 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-lg mx-auto mb-4">
              <h3 className="text-lg font-bold text-slate-900">Are you planning to Buy or Rent?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your journey and affordability calculations will customize specifically for home purchase or rental lease.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
              {/* Radio Option: BUY */}
              <label
                onClick={() => updateField('intent', 'buy')}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  criteria.intent === 'buy'
                    ? 'border-blue-600 bg-blue-50/70 ring-4 ring-blue-500/10 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl ${criteria.intent === 'buy' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Home className="w-7 h-7" />
                  </div>
                  {/* Radio button circle */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    criteria.intent === 'buy' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}>
                    {criteria.intent === 'buy' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-xl font-black text-slate-900">Buy a Home</div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    I want to purchase a property, build equity, and find homes within my true mortgage budget.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Includes Affordability Ceiling & Tax Calculations</span>
                  </div>
                </div>
              </label>

              {/* Radio Option: RENT */}
              <label
                onClick={() => updateField('intent', 'rent')}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  criteria.intent === 'rent'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-4 ring-emerald-500/10 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-2xl ${criteria.intent === 'rent' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Key className="w-7 h-7" />
                  </div>
                  {/* Radio button circle */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    criteria.intent === 'rent' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                  }`}>
                    {criteria.intent === 'rent' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-xl font-black text-slate-900">Rent a Home</div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    I want to lease an apartment, townhouse, or house with flexible terms and monthly rental budget.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Includes Lease Terms & Monthly Rent Analysis</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STOP 2: STATE SELECTION (ALL 50 STATES & TERRITORIES)     */}
        {/* ========================================================= */}
        {currentStopIndex === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {criteria.intent === 'buy' ? 'Which State are you planning to Buy?' : 'Which State are you planning to Rent?'} (All 50 States & Territories)
                </label>
                <div className="relative">
                  <select
                    value={criteria.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-blue-500 bg-white font-bold text-base text-slate-900 focus:ring-4 focus:ring-blue-100 shadow-sm"
                  >
                    {ALL_US_STATES_AND_TERRITORIES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Selected: <span className="font-bold text-blue-600">{selectedStateObj?.name}</span> ({criteria.state})
                </p>
              </div>

              {/* Popular States Quick-Pick Tiles */}
              <div>
                <div className="text-xs font-bold text-slate-600 uppercase mb-2">Popular Quick Selections:</div>
                <div className="flex flex-wrap gap-2">
                  {['TX', 'CA', 'FL', 'NY', 'WA', 'CO', 'NC', 'GA', 'IL', 'AZ', 'PA', 'OH'].map((code) => {
                    const st = ALL_US_STATES_AND_TERRITORIES.find(s => s.code === code);
                    const isSelected = criteria.state === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleStateChange(code)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{st?.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STOP 3: CITY OR ZIPCODE (WITH TYPEAHEAD & API SEARCH)     */}
        {/* ========================================================= */}
        {currentStopIndex === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Tab Selector between City Typeahead and Zipcode API */}
              <div className="flex items-center justify-center p-1 bg-slate-100 rounded-2xl max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setLocationMode('city')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition ${
                    locationMode === 'city'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🏙️ Search City (within {criteria.state})
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('zipcode')}
                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition ${
                    locationMode === 'zipcode'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📮 Search by Zipcode
                </button>
              </div>

              {/* MODE A: CITY TYPEAHEAD WITHIN STATE */}
              {locationMode === 'city' && (
                <div className="space-y-3 relative">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Which City? (Filtered strictly to {selectedStateObj?.name})
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => {
                          setCityInput(e.target.value);
                          updateField('city', e.target.value);
                          setIsCityDropdownOpen(true);
                        }}
                        onFocus={() => setIsCityDropdownOpen(true)}
                        placeholder={`Type city in ${selectedStateObj?.name}...`}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Typeahead Suggestions Dropdown */}
                  {isCityDropdownOpen && (
                    <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 px-3 py-1">
                        Available Cities in {selectedStateObj?.name} ({criteria.state}):
                      </div>
                      {filteredCities.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCityInput(c);
                            updateField('city', c);
                            setIsCityDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                            criteria.city.toLowerCase() === c.toLowerCase()
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span>{c}, {criteria.state}</span>
                          {criteria.city.toLowerCase() === c.toLowerCase() && (
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MODE B: ZIPCODE SEARCH API */}
              {locationMode === 'zipcode' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Enter 5-Digit US Zipcode
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          maxLength={5}
                          value={zipInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setZipInput(val);
                            if (val.length === 5) {
                              handleZipLookup(val);
                            }
                          }}
                          placeholder="e.g. 78749 or 90210"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleZipLookup(zipInput)}
                        disabled={isZipLoading || zipInput.length !== 5}
                        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
                      >
                        {isZipLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Resolving...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>Lookup</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Zipcode API Lookup Results */}
                  {zipError && (
                    <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
                      {zipError}
                    </div>
                  )}

                  {zipResult && zipResult.length > 0 && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                      <div className="text-xs font-bold text-emerald-900">
                        ✓ Zipcode {zipInput} resolved via Postal Search:
                      </div>
                      {zipResult.map((place: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{place.city}, {place.stateAbbr}</div>
                            <div className="text-[11px] text-slate-500">{place.state}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              updateField('state', place.stateAbbr);
                              updateField('city', place.city);
                              updateField('zipCode', zipInput);
                              setCityInput(place.city);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
                          >
                            Set Location
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEARCH RADIUS SLIDER */}
              <div className="pt-4 border-t border-slate-200">
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

              {/* Active Selection Badge */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                <span>Active Target: <strong>{criteria.city}, {criteria.state}</strong> {criteria.zipCode ? `(${criteria.zipCode})` : ''}</span>
                <span className="font-bold text-blue-700">{criteria.radiusMiles} mi radius</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STOP 4: LIFESTYLE PERSONA FORK                            */}
        {/* ========================================================= */}
        {currentStopIndex === 3 && (
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

        {/* ========================================================= */}
        {/* STOP 5: DYNAMIC PERSONA BRANCH                            */}
        {/* ========================================================= */}
        {currentStopIndex === 4 && (
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
                    placeholder={`e.g. Downtown ${criteria.city} / Tech campus`}
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

        {/* ========================================================= */}
        {/* STOP 6: AFFORDABILITY ENGINE (BUY VS RENT DIVERGENCE)     */}
        {/* ========================================================= */}
        {currentStopIndex === 5 && (
          criteria.intent === 'rent' ? (
            /* RENT-SPECIFIC STOP 6 */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Financial Inputs: Income and Rental Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Gross Monthly Income ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      min={1000}
                      step={250}
                      value={criteria.monthlyIncome}
                      onChange={(e) => updateField('monthlyIncome', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Standard 3x guideline allows up to <strong className="text-emerald-700">${Math.round(criteria.monthlyIncome / 3).toLocaleString()}/mo</strong> for rent.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Max Monthly Rental Budget ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      min={500}
                      max={15000}
                      step={50}
                      value={criteria.maxMonthlyMortgage}
                      onChange={(e) => updateField('maxMonthlyMortgage', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Quick Budget Selection Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[1500, 2000, 2500, 3000, 3500, 4500].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => updateField('maxMonthlyMortgage', b)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                          criteria.maxMonthlyMortgage === b
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        ${b.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {criteria.maxMonthlyMortgage > (criteria.monthlyIncome * 0.40) && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Note: Rental budget exceeds 40% of gross monthly income. Landlords may require a co-signer.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bedrooms Fine-Tuning */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Bedrooms Required
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { val: 0, label: 'Studio' },
                    { val: 1, label: '1 Bed' },
                    { val: 2, label: '2 Beds' },
                    { val: 3, label: '3 Beds' },
                    { val: 4, label: '4 Beds' },
                    { val: 5, label: '5+ Beds' },
                  ].map((item) => {
                    const isSelected = criteria.bedrooms === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => updateField('bedrooms', item.val)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold transition border text-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bathrooms Fine-Tuning */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Bathrooms Required
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { val: 1, label: '1 Bath' },
                    { val: 1.5, label: '1.5 Baths' },
                    { val: 2, label: '2 Baths' },
                    { val: 2.5, label: '2.5 Baths' },
                    { val: 3, label: '3+ Baths' },
                  ].map((item) => {
                    const isSelected = criteria.bathrooms === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => updateField('bathrooms', item.val)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold transition border text-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rental Dwelling Types Fine-Tuning */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Preferred Rental Property Types
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['Condo', 'Townhouse', 'Single Family', 'Multi-Family'] as HouseType[]).map((type) => {
                    const isChecked = criteria.houseTypes.includes(type);
                    const displayLabel = type === 'Condo' ? 'Apartment / Condo' : type;
                    return (
                      <label
                        key={type}
                        className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer font-semibold text-xs transition ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
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
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span>{displayLabel}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Rental Budget Ceiling Box */}
              <div className="p-5 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 rounded-2xl text-white shadow-lg space-y-2.5">
                <div className="text-xs uppercase font-bold tracking-wider text-emerald-300 flex items-center justify-between">
                  <span>Rental Search Ceiling & Requirements</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px]">
                    Live Rental Filter
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="text-3xl font-black text-emerald-400">
                    ${criteria.maxMonthlyMortgage.toLocaleString()} <span className="text-sm font-semibold text-slate-300">/ month</span>
                  </div>
                  <div className="text-xs text-emerald-200 font-medium">
                    Layout: {criteria.bedrooms === 0 ? 'Studio+' : `${criteria.bedrooms}+ Beds`} &bull; {criteria.bathrooms}+ Baths
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  Rental listings with monthly rent higher than <strong className="text-white">${criteria.maxMonthlyMortgage.toLocaleString()}/mo</strong> are automatically excluded from the search results.
                </p>
              </div>
            </div>
          ) : (
            /* BUY-SPECIFIC STOP 6 */
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
                    Max Monthly Mortgage Budget ($)
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
                      <span>Warning: Desired budget exceeds 36% of gross income.</span>
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
                    Includes 2% Property Tax + 0.5% Ins + PMI
                  </div>
                </div>
                <p className="text-xs text-blue-100">
                  Homes priced above this ceiling (such as $1,135,000) are automatically removed by the search engine.
                </p>
              </div>
            </div>
          )
        )}

        {/* ========================================================= */}
        {/* STOP 7: PROPERTY HARD REQUIREMENTS                       */}
        {/* ========================================================= */}
        {currentStopIndex === 6 && (
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
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? 'Studio (0 Beds)' : `${n}+ Bedrooms`}
                    </option>
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

        {/* ========================================================= */}
        {/* STOP 8: SOFT PREFERENCES & WEIGHTAGE                      */}
        {/* ========================================================= */}
        {currentStopIndex === 7 && (
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

        {/* ========================================================= */}
        {/* STOP 9: OFFLINE SEARCH & NOTIFY                           */}
        {/* ========================================================= */}
        {currentStopIndex === 8 && (
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
              <div>• Transaction: <strong className="uppercase">{criteria.intent}</strong></div>
              <div>• Target Area: {criteria.city}, {criteria.state} {criteria.zipCode ? `(${criteria.zipCode})` : ''} ({criteria.radiusMiles} mi radius)</div>
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
