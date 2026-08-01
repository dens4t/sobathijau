import React from 'react';
import type { GeoCategory, GeoLocation } from '../types';
import { EnvironmentalMap } from './EnvironmentalMap';

interface MapViewProps {
  locations: GeoLocation[];
  categories: GeoCategory[];
}

export const MapView: React.FC<MapViewProps> = ({ locations, categories }) => {
  return (
    <div className="bg-white border p-4 md:p-6 rounded-2xl shadow-sm">
      <h3 className="text-base md:text-lg font-black tracking-tight text-[#1B4332] mb-1">Peta Sebaran Lingkungan</h3>
      <p className="text-xs text-slate-500 mb-4">
        Visualisasi titik-titik pengelolaan lingkungan di Kota Pontianak. Klik marker untuk detail lokasi.
      </p>
      <EnvironmentalMap
        locations={locations}
        categories={categories}
        height="520px"
      />
    </div>
  );
};
