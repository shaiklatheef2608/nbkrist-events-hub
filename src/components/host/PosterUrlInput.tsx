import React, { useState } from 'react';
import { Image as ImageIcon, Link as LinkIcon, AlertCircle, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { formatDisplayImageUrl } from '../../utils/driveUrlHelper';

interface PosterUrlInputProps {
  value: string;
  onChange: (url: string) => void;
}

export const PosterUrlInput: React.FC<PosterUrlInputProps> = ({ value, onChange }) => {
  const [imgError, setImgError] = useState(false);

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const hasValidUrl = isValidUrl(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImgError(false);
    onChange(e.target.value);
  };

  const handleClear = () => {
    setImgError(false);
    onChange('');
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <LinkIcon className="w-4 h-4" />
        </div>
        <input
          type="url"
          name="posterUrl"
          id="posterUrl"
          required
          placeholder="https://i.postimg.cc/... or public Google Drive link"
          value={value}
          onChange={handleInputChange}
          className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 transition-all placeholder:font-sans placeholder:text-slate-400"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Clear URL"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-700">Poster Upload & Link Instructions *</p>
          <span className="text-[10px] text-amber-600 font-mono font-medium">Compulsory</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Upload your poster image to a free image hosting platform or paste a public Google Drive link:
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <a
            href="https://postimages.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded text-blue-700 hover:text-blue-900 hover:border-blue-400 font-medium transition-colors text-[11px] shadow-2xs"
          >
            <span>Postimages.org (Direct link, no signup)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://imgbb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:text-slate-900 hover:border-slate-400 font-medium transition-colors text-[11px] shadow-2xs"
          >
            <span>ImgBB</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 pt-1">
          <li>Upload your poster on <strong>Postimages</strong> or <strong>ImgBB</strong>, copy the direct image URL, and paste it above.</li>
          <li>Or share a <strong>Google Drive</strong> image link set to <em>"Anyone with the link can view"</em>.</li>
        </ul>
      </div>

      {/* URL Validation State & Live Preview */}
      {value.trim() && (
        <div className="space-y-2">
          {!hasValidUrl ? (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Please enter a valid URL beginning with <code>https://</code> or <code>http://</code>.</span>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] uppercase text-slate-500 font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                  <span>Poster Image Preview</span>
                </span>
                {!imgError ? (
                  <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Link
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Unable to load image
                  </span>
                )}
              </div>

              <div className="w-full max-w-sm aspect-16/9 rounded-md overflow-hidden bg-slate-900 border border-slate-200 relative flex items-center justify-center">
                {imgError ? (
                  <div className="p-4 text-center text-slate-400 space-y-1">
                    <ImageIcon className="w-6 h-6 mx-auto opacity-50" />
                    <p className="text-xs">Image failed to load from this URL</p>
                    <p className="text-[10px] text-slate-500">Check link permissions or CORS settings</p>
                  </div>
                ) : (
                  <img
                    src={formatDisplayImageUrl(value)}
                    alt="Event Poster Preview"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
