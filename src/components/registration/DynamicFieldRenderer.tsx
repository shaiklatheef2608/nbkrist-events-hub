import React, { useState } from 'react';
import { FormQuestion } from '../../types';
import { formatDisplayImageUrl } from '../../utils/driveUrlHelper';
import { Image as ImageIcon, AlertCircle, Star } from 'lucide-react';

interface DynamicFieldRendererProps {
  question: FormQuestion;
  value: any;
  onChange: (val: any) => void;
  error?: string;
  readOnly?: boolean;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  question,
  value,
  onChange,
  error,
  readOnly = false
}) => {
  const [imgError, setImgError] = useState(false);

  // Content Block: Image / Banner
  if (question.type === 'image') {
    const displayUrl = formatDisplayImageUrl(question.imageUrl);
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 select-none">
        {displayUrl && !imgError ? (
          <div className="w-full max-h-96 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
            <img
              src={displayUrl}
              alt={question.altText || question.label || 'Event notice'}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 bg-slate-100 rounded-lg border border-dashed border-slate-300 space-y-1">
            <ImageIcon className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs">
              {question.imageUrl ? 'Unable to display this image. Make sure the Google Drive or image file is publicly accessible.' : 'Image block placeholder'}
            </p>
          </div>
        )}
        {question.caption && (
          <p className="text-xs text-slate-500 italic text-center">
            {question.caption}
          </p>
        )}
        {question.description && (
          <p className="text-xs text-slate-600 leading-relaxed">
            {question.description}
          </p>
        )}
      </div>
    );
  }

  // Layout Block: Section header
  if (question.type === 'section') {
    return (
      <div className="pt-4 pb-2 border-b border-slate-200 space-y-1">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          {question.label}
        </h3>
        {question.description && (
          <p className="text-xs text-slate-500 leading-relaxed">
            {question.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Question Label */}
      <label className="block text-xs sm:text-sm font-semibold text-slate-900">
        {question.label}
        {question.required && <span className="text-red-500 ml-1 font-bold">*</span>}
      </label>

      {/* Description / Help text */}
      {(question.description || question.helpText) && (
        <p className="text-xs text-slate-500 leading-relaxed">
          {question.description || question.helpText}
        </p>
      )}

      {/* Control Input */}
      <div>
        {/* 1. Short Answer */}
        {question.type === 'shortAnswer' && (
          <input
            type="text"
            disabled={readOnly}
            placeholder={question.placeholder || 'Your answer'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-xs sm:text-sm bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all`}
          />
        )}

        {/* 2. Long Answer */}
        {question.type === 'longAnswer' && (
          <textarea
            rows={3}
            disabled={readOnly}
            placeholder={question.placeholder || 'Type detailed response here...'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-xs sm:text-sm bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all`}
          />
        )}

        {/* 3. Email */}
        {question.type === 'email' && (
          <input
            type="email"
            disabled={readOnly}
            placeholder={question.placeholder || 'e.g. name@example.com'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-xs sm:text-sm bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all`}
          />
        )}

        {/* 4. Phone Number */}
        {question.type === 'phone' && (
          <input
            type="tel"
            disabled={readOnly}
            placeholder={question.placeholder || 'e.g. 9876543210'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-xs sm:text-sm bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all`}
          />
        )}

        {/* 5. Number */}
        {question.type === 'number' && (
          <input
            type="number"
            disabled={readOnly}
            placeholder={question.placeholder || '0'}
            value={value ?? ''}
            min={question.validation?.min}
            max={question.validation?.max}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-xs sm:text-sm bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all`}
          />
        )}

        {/* 6. Date */}
        {question.type === 'date' && (
          <input
            type="date"
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-xs sm:text-sm bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all`}
          />
        )}

        {/* 7. Time */}
        {question.type === 'time' && (
          <input
            type="time"
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-xs sm:text-sm bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all`}
          />
        )}

        {/* 8. Date and Time */}
        {question.type === 'dateTime' && (
          <input
            type="datetime-local"
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-xs sm:text-sm bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all`}
          />
        )}

        {/* 9. Dropdown */}
        {question.type === 'dropdown' && (
          <select
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-xs sm:text-sm bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer`}
          >
            <option value="">-- Choose an option --</option>
            {(question.options || []).map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {/* 10. Multiple Choice (Radio) */}
        {question.type === 'multipleChoice' && (
          <div className="space-y-2 pt-1">
            {(question.options || []).map((opt, i) => (
              <label
                key={i}
                className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-50 cursor-pointer text-xs sm:text-sm text-slate-800"
              >
                <input
                  type="radio"
                  name={question.id}
                  disabled={readOnly}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        )}

        {/* 11. Checkboxes (Multi-select) */}
        {question.type === 'checkboxes' && (
          <div className="space-y-2 pt-1">
            {(question.options || []).map((opt, i) => {
              const currentArr: string[] = Array.isArray(value) ? value : [];
              const isChecked = currentArr.includes(opt);
              return (
                <label
                  key={i}
                  className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-50 cursor-pointer text-xs sm:text-sm text-slate-800"
                >
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...currentArr, opt]);
                      } else {
                        onChange(currentArr.filter((item) => item !== opt));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* 12. Yes / No */}
        {question.type === 'yesNo' && (
          <div className="flex items-center gap-3 pt-1">
            {['Yes', 'No'].map((opt) => (
              <label
                key={opt}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border cursor-pointer text-xs sm:text-sm font-semibold transition-all ${
                  value === opt
                    ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  disabled={readOnly}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  className="sr-only"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        )}

        {/* 13. Rating (1 to 5 Stars) */}
        {question.type === 'rating' && (
          <div className="flex items-center gap-2 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={readOnly}
                onClick={() => onChange(star)}
                className={`p-2 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                  (value || 0) >= star ? 'text-amber-500' : 'text-slate-300'
                }`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
            <span className="text-xs font-mono text-slate-500 ml-2">
              {value ? `${value} of 5` : 'Rate 1 to 5'}
            </span>
          </div>
        )}

        {/* 14. Agreement Checkbox */}
        {question.type === 'agreement' && (
          <label className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer text-xs text-slate-700 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
            />
            <span className="leading-relaxed">
              I agree and accept the terms outlined above.
            </span>
          </label>
        )}

        {/* 15. Transaction ID */}
        {question.type === 'transactionId' && (
          <input
            type="text"
            disabled={readOnly}
            placeholder="e.g. 12-digit UPI Reference / UTR ID"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full text-xs sm:text-sm font-mono bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all`}
          />
        )}

        {/* 16. Payment Screenshot URL */}
        {question.type === 'paymentScreenshot' && (
          <div className="space-y-2">
            <input
              type="url"
              disabled={readOnly}
              placeholder="https://imgto.link/... or Google Drive URL"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full text-xs sm:text-sm font-mono bg-white border ${error ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'} rounded-lg p-2.5 sm:p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all`}
            />
            {value && formatDisplayImageUrl(value) && (
              <div className="max-w-xs aspect-video rounded overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={formatDisplayImageUrl(value)}
                  alt="Receipt Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Field Validation Error */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
