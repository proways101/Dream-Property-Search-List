'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ScoredProperty } from '@/types';
import { ExternalLink, Star, ShieldCheck, School, Clock, DollarSign, Heart } from 'lucide-react';

interface PropertyMapProps {
  properties: ScoredProperty[];
  selectedProperty: ScoredProperty | null;
  onSelectProperty: (property: ScoredProperty | null) => void;
  radiusMiles: number;
}

// Client-only map wrapper to prevent SSR issues with Leaflet
function MapComponentInner({
  properties,
  selectedProperty,
  onSelectProperty,
  radiusMiles
}: PropertyMapProps) {
  const [L, setL] = useState<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [hoveredProperty, setHoveredProperty] = useState<ScoredProperty | null>(null);

  useEffect(() => {
    // Dynamic import of leaflet on client side
    import('leaflet').then((leafletModule) => {
      setL(leafletModule.default || leafletModule);
    });
  }, []);

  useEffect(() => {
    if (!L) return;

    // Fix default marker icon assets
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const mapContainer = document.getElementById('leaflet-dream-map');
    if (!mapContainer) return;

    // Calculate centroid of properties or fallback
    let centerLat = 30.2672;
    let centerLng = -97.7431;
    if (properties.length > 0) {
      centerLat = properties.reduce((sum, p) => sum + (p.lat || 0), 0) / properties.length;
      centerLng = properties.reduce((sum, p) => sum + (p.lng || 0), 0) / properties.length;
    }

    // If map already initialized, reuse or re-center
    let map = (mapContainer as any)._leaflet_map;
    if (!map) {
      map = L.map('leaflet-dream-map', {
        center: [centerLat, centerLng],
        zoom: 11,
        zoomControl: true,
      });

      // Free, clean, watermark-free OpenStreetMap basemap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      (mapContainer as any)._leaflet_map = map;
      setMapInstance(map);
    } else {
      map.setView([centerLat, centerLng], map.getZoom() || 11);
    }

    // Clean up old markers
    if ((map as any)._markerLayer) {
      map.removeLayer((map as any)._markerLayer);
    }
    if ((map as any)._radiusCircle) {
      map.removeLayer((map as any)._radiusCircle);
    }

    const markerGroup = L.featureGroup();

    // Draw search radius circle centered at the actual search location
    const circle = L.circle([centerLat, centerLng], {
      color: '#3b82f6',
      fillColor: '#60a5fa',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '6, 6',
      radius: radiusMiles * 1609.34, // miles to meters
    }).addTo(map);
    (map as any)._radiusCircle = circle;

    // Render Markers for properties
    properties.forEach((property) => {
      const isSelected = selectedProperty?.id === property.id;
      const isDream = property.tier === 'DREAM';

      // Custom badge pin showing Dream Score
      const pinHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'}">
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg border-2 text-white ${
            isDream
              ? 'bg-emerald-600 border-white ring-2 ring-emerald-400'
              : 'bg-blue-600 border-white ring-2 ring-blue-400'
          }">
            <span>${isDream ? '★' : '●'}</span>
            <span>${property.dreamScore}%</span>
          </div>
          <div class="w-2 h-2 mx-auto bg-slate-800 rotate-45 -mt-1 shadow"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-dream-marker',
        html: pinHtml,
        iconSize: [64, 30],
        iconAnchor: [32, 28],
      });

      const marker = L.marker([property.lat, property.lng], { icon: customIcon });

      // Click to select
      marker.on('click', () => {
        onSelectProperty(property);
      });

      // Mouseover snapshot trigger
      marker.on('mouseover', () => {
        setHoveredProperty(property);
      });

      markerGroup.addLayer(marker);
    });

    markerGroup.addTo(map);
    (map as any)._markerLayer = markerGroup;

    // Auto fit bounds if properties exist
    if (properties.length > 0) {
      try {
        const bounds = markerGroup.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.15));
        }
      } catch (err) {
        // Fallback
      }
    }
  }, [L, properties, selectedProperty, radiusMiles]);

  return (
    <div className="relative w-full h-full min-h-[550px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div id="leaflet-dream-map" className="w-full h-full z-0 min-h-[550px]" />

      {/* Floating Map Legend */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200 text-xs flex flex-col gap-1.5">
        <div className="font-semibold text-slate-700 flex items-center gap-1.5">
          <span>Map Pin Legend</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-600 font-medium">Dream Match (90%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
          <span className="text-slate-600 font-medium">Good Match (80% - 89%)</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 border-t border-slate-100 pt-1">
          Radius: {radiusMiles} miles
        </div>
      </div>

      {/* Mouseover Property Snapshot Card (Floating Snapshot) */}
      {hoveredProperty && (
        <div 
          className="absolute bottom-6 left-6 z-20 max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
          onMouseLeave={() => setHoveredProperty(null)}
        >
          <div className="relative h-40 w-full bg-slate-100">
            <img
              src={hoveredProperty.photos[0]}
              alt={hoveredProperty.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md bg-emerald-600 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{hoveredProperty.dreamScore}% Dream Score</span>
            </div>
            <button
              onClick={() => setHoveredProperty(null)}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-black text-slate-900">
                ${hoveredProperty.price.toLocaleString()}
              </div>
              <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                ~${hoveredProperty.estimatedMonthlyPayment.toLocaleString()}/mo
              </div>
            </div>

            <div className="text-sm font-semibold text-slate-800 line-clamp-1">
              {hoveredProperty.address}, {hoveredProperty.city}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium border-y border-slate-100 py-1.5">
              <span>{hoveredProperty.bedrooms} Beds</span>
              <span>•</span>
              <span>{hoveredProperty.bathrooms} Baths</span>
              <span>•</span>
              <span>{hoveredProperty.sqft.toLocaleString()} sqft</span>
              <span>•</span>
              <span>{hoveredProperty.propertyType}</span>
            </div>

            {/* Score Factors Snapshot */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-1">
                <School className="w-3 h-3 text-blue-500" />
                <span>Schools: {hoveredProperty.schoolRating}/10</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Commute: {hoveredProperty.commuteTimeMinutes}m</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Safety: {hoveredProperty.safetyScore}/100</span>
              </div>
              <div className="text-slate-400">
                Built {hoveredProperty.yearBuilt}
              </div>
            </div>

            {/* Realtor.com Open In New Window Button */}
            <a
              href={hoveredProperty.realtorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold transition shadow"
            >
              <span>View Full Details on Realtor.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <div className="mt-1.5 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
              <span>Also search:</span>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(`realtor.com ${hoveredProperty.address} ${hoveredProperty.city} ${hoveredProperty.state} ${hoveredProperty.zipCode}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google
              </a>
              <span>•</span>
              <a
                href={`https://www.zillow.com/homes/${encodeURIComponent(`${hoveredProperty.address}, ${hoveredProperty.city}, ${hoveredProperty.state} ${hoveredProperty.zipCode}`)}_rb/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Zillow
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const PropertyMap = dynamic(() => Promise.resolve(MapComponentInner), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[550px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
      Loading Dream Property Map...
    </div>
  ),
});
