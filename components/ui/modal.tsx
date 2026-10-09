"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        {title && (
          <div className="border-b border-[#1b1b1b] px-6 py-4">
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
        <div className="flex justify-end gap-3 border-t border-[#1b1b1b] p-4 bg-[#080808]">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/40 transition-colors hover:text-white hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
