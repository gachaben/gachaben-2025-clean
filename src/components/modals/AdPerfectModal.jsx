import React from 'react';

export default function AdPerfectModal({
  open,
  onClose,
  onConfirm,
  title = 'パーフェクト特典',
  message = '7問パーフェクト！広告視聴で特別ボーナスへ進めます。',
  confirmLabel = '広告を見て特典へ',
  cancelLabel = 'あとで',
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-[92%] max-w-md">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
