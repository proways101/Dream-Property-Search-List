'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SearchCriteria, ScoredProperty, UserProfile, SavedSearchItem } from '@/types';
import { DEFAULT_SEARCH_CRITERIA, updateCriteriaAffordability, TRAIN_STOPS } from '@/lib/branchingEngine';
import { MOCK_MLS_LISTINGS } from '@/data/mockListings';
import { filterAndScoreProperties } from '@/lib/scoringEngine';
import { Header } from '@/components/Header';
import { TrainLineStepper } from '@/components/TrainLineStepper';
import { QuestionnaireModal } from '@/components/QuestionnaireModal';
import { PropertyMap } from '@/components/PropertyMap';
import { ListingCard } from '@/components/ListingCard';
import { OAuthModal } from '@/components/OAuthModal';
import { SavedSearchesModal } from '@/components/SavedSearchesModal';
import { 
  Sparkles, 
  Map, 
  LayoutGrid, 
  Columns, 
  Filter, 
  Bookmark, 
  Copy, 
  RotateCcw, 
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';

export default function HomePage() {
  const [criteria, setCriteria] = useState<SearchCriteria>(DEFAULT_SEARCH_CRITERIA);
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);
  const [visitedStops, setVisitedStops] = useState<number[]>([0]);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<ScoredProperty | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'grid'>('split');
  const [minScoreThreshold, setMinScoreThreshold] = useState<number>(80); // 80% default threshold from user prompt
  const [isOAuthOpen, setIsOAuthOpen] = useState<boolean>(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('dream_user');
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedSearches = localStorage.getItem('dream_saved_searches');
      if (storedSearches) setSavedSearches(JSON.parse(storedSearches));

      const storedFavs = localStorage.getItem('dream_favorites');
      if (storedFavs) setFavoriteIds(JSON.parse(storedFavs));
    } catch (e) {
      console.error('Storage error', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter & Score MLS Listings based on criteria memory
  const scoredResults = useMemo(() => {
    return filterAndScoreProperties(MOCK_MLS_LISTINGS, criteria, minScoreThreshold);
  }, [criteria, minScoreThreshold]);

  // Handle Search Execution
  const handleExecuteSearch = () => {
    setIsQuestionnaireOpen(false);
    showToast(`Found ${scoredResults.length} properties meeting ≥${minScoreThreshold}% Dream Score!`);
  };

  // Save Criteria workflow (enforces Gmail OAuth as requested by user)
  const handleSaveCriteria = () => {
    if (!user) {
      setIsOAuthOpen(true);
      return;
    }

    const newSaved: SavedSearchItem = {
      id: 'search-' + Date.now(),
      name: `${criteria.city}, ${criteria.state} (${criteria.intent.toUpperCase()}) • $${criteria.calculatedMaxPrice.toLocaleString()} Cap`,
      createdAt: new Date().toISOString(),
      userEmail: user.email,
      criteria: { ...criteria },
      matchedCount: scoredResults.length,
      dreamCount: scoredResults.filter(p => p.dreamScore >= 90).length,
    };

    const updated = [newSaved, ...savedSearches];
    setSavedSearches(updated);
    localStorage.setItem('dream_saved_searches', JSON.stringify(updated));
    showToast(`Saved "${newSaved.name}" to your Dreamlist!`);
  };

  // Load Criteria from Saved Search
  const handleLoadCriteria = (loaded: SearchCriteria) => {
    setCriteria(loaded);
    setCurrentStopIndex(0);
    setVisitedStops([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    setIsQuestionnaireOpen(false);
    showToast(`Loaded "${loaded.city}, ${loaded.state}" search criteria!`);
  };

  // Clone Criteria workflow (as requested by user to branch out from prior search)
  const handleCloneCriteria = (item: SavedSearchItem) => {
    const cloned: SearchCriteria = {
      ...item.criteria,
      name: `Clone of ${item.name}`,
    };
    setCriteria(cloned);
    setCurrentStopIndex(3); // Jump straight to Persona fork (Stop 4) to create a new branch!
    setVisitedStops([0, 1, 2, 3]);
    setIsQuestionnaireOpen(true);
    setIsSavedModalOpen(false);
    showToast(`Cloned criteria! Choose a new branch or modify parameters.`);
  };

  // Delete Saved Search
  const handleDeleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('dream_saved_searches', JSON.stringify(updated));
    showToast('Search criteria removed.');
  };

  // Start from scratch reset
  const handleStartFromScratch = () => {
    setCriteria(DEFAULT_SEARCH_CRITERIA);
    setCurrentStopIndex(0);
    setVisitedStops([0]);
    setIsQuestionnaireOpen(true);
    showToast('Reset to original starting point.');
  };

  // Toggle favorite
  const handleToggleFavorite = (property: ScoredProperty) => {
    let updated: string[];
    if (favoriteIds.includes(property.id)) {
      updated = favoriteIds.filter(id => id !== property.id);
      showToast(`Removed from favorites.`);
    } else {
      updated = [...favoriteIds, property.id];
      showToast(`Saved ${property.address} to favorites!`);
    }
    setFavoriteIds(updated);
    localStorage.setItem('dream_favorites', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        user={user}
        onOpenOAuth={() => setIsOAuthOpen(true)}
        onSignOut={() => {
          setUser(null);
          localStorage.removeItem('dream_user');
          showToast('Signed out of Google OAuth');
        }}
        onOpenSavedSearches={() => setIsSavedModalOpen(true)}
        savedCount={savedSearches.length}
        onReset={handleStartFromScratch}
        criteria={criteria}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Train Line Stepper Navigation (Always accessible at top) */}
        <TrainLineStepper
          currentStopIndex={currentStopIndex}
          visitedStops={visitedStops}
          onSelectStop={(index) => {
            setCurrentStopIndex(index);
            setIsQuestionnaireOpen(true);
          }}
          selectedPersona={criteria.persona}
        />

        {/* Dynamic Questionnaire Drawer / Modal */}
        {isQuestionnaireOpen ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                <span>Answering Branching Questionnaire (Stop {currentStopIndex + 1} of {TRAIN_STOPS.length})</span>
              </div>
              <button
                onClick={() => setIsQuestionnaireOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
              >
                Skip to Results Preview
              </button>
            </div>

            <QuestionnaireModal
              criteria={criteria}
              onChangeCriteria={setCriteria}
              currentStopIndex={currentStopIndex}
              setCurrentStopIndex={setCurrentStopIndex}
              visitedStops={visitedStops}
              setVisitedStops={setVisitedStops}
              onExecuteSearch={handleExecuteSearch}
              onSaveCriteria={handleSaveCriteria}
              isLoggedIn={!!user}
            />
          </div>
        ) : (
          /* Results View with Interactive Map, Cards, and Controls */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Control Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsQuestionnaireOpen(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-blue-200"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Modify Train Stops & Criteria</span>
                </button>

                <button
                  onClick={handleSaveCriteria}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save This Search Criteria</span>
                </button>

                <div className="h-5 w-[1px] bg-slate-200 hidden md:block" />

                <div className="text-xs text-slate-600 font-medium">
                  Matches: <span className="font-black text-slate-900">{scoredResults.length} homes</span> &bull; 
                  Ceiling: <span className="font-bold text-emerald-600">${criteria.calculatedMaxPrice.toLocaleString()}</span> &bull; 
                  Radius: <span className="font-bold">{criteria.radiusMiles} mi</span>
                </div>
              </div>

              {/* View Switches & Threshold */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                  <span>Match Filter:</span>
                  <select
                    value={minScoreThreshold}
                    onChange={(e) => setMinScoreThreshold(Number(e.target.value))}
                    className="bg-transparent font-bold text-blue-600 cursor-pointer focus:outline-none"
                  >
                    <option value={90}>≥ 90% (Dream Only)</option>
                    <option value={80}>≥ 80% (Dream & Good)</option>
                    <option value={70}>≥ 70% (All Passing)</option>
                  </select>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      viewMode === 'split' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Split Map and List"
                  >
                    <Columns className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      viewMode === 'map' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Full Map View"
                  >
                    <Map className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Visual Layout */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Map */}
                <div className="lg:col-span-7 h-[650px] sticky top-24">
                  <PropertyMap
                    properties={scoredResults}
                    selectedProperty={selectedProperty}
                    onSelectProperty={setSelectedProperty}
                    radiusMiles={criteria.radiusMiles}
                  />
                </div>

                {/* Right: Property Cards List */}
                <div className="lg:col-span-5 space-y-4 max-h-[650px] overflow-y-auto pr-1">
                  {scoredResults.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                      <p className="font-bold">No properties meet the 80%+ threshold.</p>
                      <p className="text-xs mt-1">Try expanding your search radius or adjusting budget parameters.</p>
                    </div>
                  ) : (
                    scoredResults.map((property) => (
                      <ListingCard
                        key={property.id}
                        property={property}
                        isSelected={selectedProperty?.id === property.id}
                        isFavorited={favoriteIds.includes(property.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onSelect={setSelectedProperty}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {viewMode === 'map' && (
              <div className="w-full h-[750px]">
                <PropertyMap
                  properties={scoredResults}
                  selectedProperty={selectedProperty}
                  onSelectProperty={setSelectedProperty}
                  radiusMiles={criteria.radiusMiles}
                />
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scoredResults.map((property) => (
                  <ListingCard
                    key={property.id}
                    property={property}
                    isSelected={selectedProperty?.id === property.id}
                    isFavorited={favoriteIds.includes(property.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={setSelectedProperty}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Google OAuth Modal */}
      <OAuthModal
        isOpen={isOAuthOpen}
        onClose={() => setIsOAuthOpen(false)}
        onSuccess={(profile) => {
          setUser(profile);
          localStorage.setItem('dream_user', JSON.stringify(profile));
          showToast(`Welcome, ${profile.name}! Signed in via Google.`);
          handleSaveCriteria();
        }}
      />

      {/* Saved Searches Drawer */}
      <SavedSearchesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedSearches={savedSearches}
        onLoadSearch={handleLoadCriteria}
        onCloneSearch={handleCloneCriteria}
        onDeleteSearch={handleDeleteSearch}
        onStartFromScratch={handleStartFromScratch}
      />
    </div>
  );
}
