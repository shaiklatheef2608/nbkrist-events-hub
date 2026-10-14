import React, { useState } from 'react';
import { CreditCard, QrCode, Copy, Check, ExternalLink, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { PaymentSettings } from '../../types';
import { formatDisplayImageUrl } from '../../utils/driveUrlHelper';

interface PaymentBlockViewProps {
  settings: PaymentSettings;
  transactionId: string;
  screenshotUrl: string;
  onTransactionIdChange: (val: string) => void;
  onScreenshotUrlChange: (val: string) => void;
  readOnly?: boolean;
}

export const PaymentBlockView: React.FC<PaymentBlockViewProps> = ({
  settings,
  transactionId,
  screenshotUrl,
  onTransactionIdChange,
  onScreenshotUrlChange,
  readOnly = false
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);

  const displayQrUrl = formatDisplayImageUrl(settings.qrImageUrl);
  const displayScreenshotUrl = formatDisplayImageUrl(screenshotUrl);

  const handleCopyUpi = () => {
    if (settings.upiId && navigator.clipboard) {
      navigator.clipboard.writeText(settings.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-200 rounded-xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#091e42] text-white flex items-center justify-center shadow-xs">
            <CreditCard className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Collegiate Registration Fee
            </h3>
            <p className="text-xs text-slate-500">
              Institutional payment processing via verified UPI
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Total Payable</span>
          <span className="text-2xl font-black text-[#091e42]">
            {settings.currency || '₹'}{settings.amount}
          </span>
        </div>
      </div>

      {/* Instructions */}
      {settings.instructions && (
        <div className="text-xs text-slate-600 bg-white/80 p-3.5 rounded-lg border border-slate-200/80 leading-relaxed">
          {settings.instructions}
        </div>
      )}

      {/* UPI & QR Code section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        {/* Left: UPI details */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
              Official Institutional UPI ID
            </label>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 flex-1 truncate select-all">
                {settings.upiId || 'nbkrist@upi'}
              </span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy UPI'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <span>Payment Step:</span>
            </span>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              Open PhonePe, Google Pay, or Paytm. Scan the QR code or transfer to the UPI ID, then paste your 12-digit UTR/Transaction Reference ID below.
            </p>
          </div>
        </div>

        {/* Right: Payment QR code */}
        <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-center space-y-2">
          {displayQrUrl && !imgError ? (
            <div className="w-40 h-40 rounded-lg overflow-hidden border border-slate-200 p-1 bg-white shadow-2xs">
              <img
                src={displayQrUrl}
                alt="Payment QR Code"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-40 h-40 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center p-3 text-slate-400 space-y-1">
              <QrCode className="w-10 h-10 opacity-40 text-slate-500" />
              <span className="text-[10px] font-mono text-slate-500">Scan via UPI App</span>
            </div>
          )}
          <span className="text-[11px] font-mono font-semibold text-slate-600 flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-blue-700" />
            <span>Scan to Pay {settings.currency || '₹'}{settings.amount}</span>
          </span>
        </div>
      </div>

      {/* Transaction ID & Screenshot inputs */}
      <div className="space-y-4 pt-3 border-t border-blue-100">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            UPI Transaction / UTR ID {settings.transactionIdRequired && <span className="text-red-600">*</span>}
          </label>
          <input
            type="text"
            required={settings.transactionIdRequired}
            disabled={readOnly}
            placeholder="e.g. 428910294821 or UPI Ref ID"
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
            className="w-full text-xs sm:text-sm font-mono bg-white border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Found in your UPI app payment receipt (usually a 12-digit reference number).
          </p>
        </div>

        {settings.paymentScreenshotRequired && (
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Payment Screenshot URL (Public image or Google Drive link)
            </label>
            <input
              type="url"
              disabled={readOnly}
              placeholder="https://imgto.link/... or public Google Drive link"
              value={screenshotUrl}
              onChange={(e) => {
                setScreenshotError(false);
                onScreenshotUrlChange(e.target.value);
              }}
              className="w-full text-xs sm:text-sm font-mono bg-white border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />

            {/* Live Screenshot Preview */}
            {screenshotUrl.trim() && (
              <div className="mt-2.5 p-2 bg-white border border-slate-200 rounded-lg max-w-xs">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                  Screenshot Preview
                </span>
                {!screenshotError && displayScreenshotUrl ? (
                  <div className="aspect-video w-full rounded overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={displayScreenshotUrl}
                      alt="Receipt Preview"
                      referrerPolicy="no-referrer"
                      onError={() => setScreenshotError(true)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-amber-700 bg-amber-50 rounded flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Unable to preview image. Ensure the link is public.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
