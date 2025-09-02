
import React, { useEffect, useRef } from 'react';

interface UseModalAccessibilityProps {
  isOpen: boolean;
  onClose: () => void;
  modalRef: React.RefObject<HTMLElement>;
  initialFocusRef?: React.RefObject<HTMLElement>;
  triggerRef?: React.RefObject<HTMLElement>; // Added optional triggerRef
}

export const useModalAccessibility = ({
  isOpen,
  onClose,
  modalRef,
  initialFocusRef,
  // triggerRef is now a declared prop, but not explicitly used in logic below
  // as previousActiveElement.current already handles returning focus.
}: UseModalAccessibilityProps) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Set initial focus
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose, modalRef, initialFocusRef]);
};
