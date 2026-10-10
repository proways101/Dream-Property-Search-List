'use client';

import React from 'react';
import { ScoredProperty } from '@/types';
import { ExternalLink, Heart, School, Clock, ShieldCheck, Home, Calendar, Check, X } from 'lucide-react';

interface ListingCardProps {
  property: ScoredProperty;
  isSelected?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (property: ScoredProperty) => void;
  onSelect?: (property: ScoredProperty) => void;
}

export function ListingCard({
  property,
  isSelected = false,
  isFavorited = false,
  onToggleFavorite,
  onSelect,
}: ListingCardProps) {
  const isDream = property.tier === 'DREAM';

  return (
    <div
      onClick={() => onSelect && onSelect(property)}
      className={`group rounded-2xl bg-white border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-500 shadow-xl'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
      }`}
    >
      {/* Property Photo Header */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {property.photos && property.photos.length > 0 ? (
          <img
            src={property.photos[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-xs">
            No photo available
          </div>
        )}

        {/* Badge: Dream Score Tier */}
        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black text-white shadow-md flex items-center gap-1.5 ${
            isDream
              ? 'bg-emerald-600 ring-2 ring-emerald-400'
              : 'bg-blue-600 ring-2 ring-blue-400'
          }`}
        >
          <span>{isDream ? '★' : '●'}</span>
          <span>{property.dreamScore}% Dream Score</span>
        </div>

        {/* Heart Favorite Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow ${
              isFavorited
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 hover:bg-white text-slate-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Property Type Pill */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-md text-[11px] font-medium">
          {property.propertyType}
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Price & Monthly Estimate */}
          <div className="flex items-baseline justify-between mb-1">
            <div className="text-2xl font-black text-slate-900">
              ${property.price.toLocaleString()}{property.price < 20000 ? '/mo' : ''}
            </div>
            {property.price >= 20000 ? (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                ~${property.estimatedMonthlyPayment.toLocaleString()}/mo
              </div>
            ) : (
              <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                For Rent
              </div>
            )}
          </div>

          <div className="text-sm font-bold text-slate-800 line-clamp-1">
            {property.address}
          </div>
          <div className="text-xs text-slate-500">
            {property.city}, {property.state} {property.zipCode} • MLS# {property.mlsNumber}
          </div>

          {/* Quick Specs */}
          <div className="flex items-center gap-3 text-xs text-slate-700 font-semibold border-y border-slate-100 py-2.5 my-3">
            <span>{property.bedrooms} Beds</span>
            <span className="text-slate-300">•</span>
            <span>{property.bathrooms} Baths</span>
            <span className="text-slate-300">•</span>
            <span>{property.sqft.toLocaleString()} sqft</span>
            {property.lotSizeSqft && property.lotSizeSqft > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span>{(property.lotSizeSqft / 43560).toFixed(2)} acres</span>
              </>
            )}
          </div>

          {/* Dream Score Breakdown Factors */}
          <div className="space-y-1.5 text-xs text-slate-600">
            {property.scoreBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{item.factor}:</span>
                <span className={`font-semibold flex items-center gap-1 ${item.passed ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {item.reason}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* View on Realtor.com Button */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5">
          <a
            href={property.realtorUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
          >
            <span>View Full Details on Realtor.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <span>Also search:</span>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(`realtor.com ${property.address} ${property.city} ${property.state} ${property.zipCode}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Google
            </a>
            <span>•</span>
            <a
              href={`https://www.zillow.com/homes/${encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zipCode}`)}_rb/`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Zillow
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
