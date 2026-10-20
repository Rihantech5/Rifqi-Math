import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  caption?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  caption,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <ZoomIn className="w-4 h-4 text-indigo-600" />
            <span>Perbesar Gambar Ilustrasi</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image content */}
        <div className="py-4 flex flex-col items-center justify-center">
          <img
            src={imageUrl}
            alt={caption || 'Ilustrasi Soal'}
            className="max-h-[60vh] max-w-full object-contain rounded-lg border border-slate-100 shadow-xs"
          />
          {caption && (
            <p className="mt-3 text-center text-sm font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80">
              {caption}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
