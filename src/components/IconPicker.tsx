import React from 'react';
import * as Icons from 'lucide-react';
import { X } from 'lucide-react';

const LOCATION_ICONS = [
  'Trash2', 'Landfill', 'Recycle', 'MapPin', 'Warehouse',
  'Building2', 'Factory', 'Droplets', 'Leaf', 'TreePine',
  'Flower2', 'Sprout', 'Shield', 'Cctv', 'Fuel',
  'Truck', 'Tractor', 'Siren', 'Hospital', 'School',
];

const CATEGORY_COLORS = [
  { name: 'Merah (TPS)', value: '#DC2626' },
  { name: 'Merah Tua (TPA)', value: '#B91C1C' },
  { name: 'Hijau (Bank Sampah)', value: '#16A34A' },
  { name: 'Hijau Tua', value: '#15803D' },
  { name: 'Biru', value: '#2563EB' },
  { name: 'Kuning', value: '#CA8A04' },
  { name: 'Ungu', value: '#9333EA' },
  { name: 'Oranye', value: '#EA580C' },
  { name: 'Hitam', value: '#1C1917' },
  { name: 'Abu-abu', value: '#78716C' },
];

interface IconPickerProps {
  selectedIcon: string;
  selectedColor: string;
  onSelectIcon: (name: string) => void;
  onSelectColor: (color: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon, selectedColor,
  onSelectIcon, onSelectColor,
}) => {
  return (
    <div className="space-y-4">
      {/* Icon Grid */}
      <div>
        <label className="text-[11px] font-bold text-slate-600 mb-2 block">Pilih Ikon Marker</label>
        <div className="grid grid-cols-8 gap-1.5">
          {LOCATION_ICONS.map(name => {
            const IconComp = (Icons as any)[name];
            if (!IconComp) return null;
            const isSelected = selectedIcon === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onSelectIcon(name)}
                title={name}
                className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <IconComp
                  className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="text-[11px] font-bold text-slate-600 mb-2 block">Warna Marker</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => onSelectColor(c.value)}
              title={c.name}
              className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                selectedColor === c.value
                  ? 'border-slate-800 ring-2 ring-slate-300 scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
            >
              {selectedColor === c.value && (
                <X className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <label className="text-[11px] font-bold text-slate-500 mb-2 block">Preview Marker</label>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: selectedColor }}
          >
            {(() => {
              const IconComp = (Icons as any)[selectedIcon];
              return IconComp ? <IconComp className="w-5 h-5 text-white" /> : null;
            })()}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {selectedIcon}<br />
            <span style={{ color: selectedColor }}>{selectedColor}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
