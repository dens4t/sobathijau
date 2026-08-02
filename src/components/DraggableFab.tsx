import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export interface FabPos {
  left: number;
  top: number;
}

interface DraggableFabProps {
  storageKey: string;
  defaultPos: () => FabPos;
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const DraggableFab: React.FC<DraggableFabProps> = ({ storageKey, defaultPos, children, id, className }) => {
  const [pos, setPos] = useState<FabPos | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ sx: number; sy: number; lx: number; ly: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  const clamp = (p: FabPos): FabPos => ({
    left: Math.max(4, Math.min(window.innerWidth - 68, p.left)),
    top: Math.max(4, Math.min(window.innerHeight - 68, p.top)),
  });

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw === 'hidden') {
      setPos(null);
      return;
    }
    if (raw) {
      try {
        const p = JSON.parse(raw) as FabPos;
        if (typeof p.left === 'number' && typeof p.top === 'number') {
          setPos(clamp(p));
          return;
        }
      } catch {
        /* abaikan */
      }
    }
    setPos(clamp(defaultPos()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-fab-close]')) return;
    drag.current = { sx: e.clientX, sy: e.clientY, lx: pos!.left, ly: pos!.top, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) d.moved = true;
    if (d.moved) setPos(clamp({ left: d.lx + dx, top: d.ly + dy }));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d) {
      if (d.moved) {
        const p = clamp({ left: d.lx + e.clientX - d.sx, top: d.ly + e.clientY - d.sy });
        setPos(p);
        localStorage.setItem(storageKey, JSON.stringify(p));
        justDragged.current = true;
      }
      drag.current = null;
    }
    setDragging(false);
  };

  if (pos === null) return null;

  return (
    <div
      id={id}
      className={`fixed z-50 font-sans select-none ${className || ''}`}
      style={{
        left: pos.left,
        top: pos.top,
        touchAction: 'none',
        transform: dragging ? 'scale(1.06)' : undefined,
        transition: dragging ? 'none' : 'transform .15s',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(e) => {
        if (justDragged.current) {
          justDragged.current = false;
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <button
        data-fab-close
        onClick={() => {
          localStorage.setItem(storageKey, 'hidden');
          setPos(null);
        }}
        className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md border border-white"
        aria-label="Sembunyikan tombol ini"
        title="Sembunyikan"
      >
        <X className="w-3 h-3" />
      </button>
      {children}
    </div>
  );
};
