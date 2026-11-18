"use client";

import { useEffect, useRef } from "react";
import Icon from "./Icon";

export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <button
          className="icon-btn dialog-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
        <span className="eyebrow">Progress settings</span>
        <h2 id="confirm-title" className="h2">
          {title}
        </h2>
        <p id="confirm-description" className="muted">
          {description}
        </p>
        <div className="dialog-actions">
          <button className="btn" autoFocus onClick={onClose}>
            Keep practicing
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
