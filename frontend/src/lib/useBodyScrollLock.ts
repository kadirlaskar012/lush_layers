import { useEffect } from "react";

let activeModalsCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

export function lockBodyScroll() {
  if (typeof document === "undefined") return;
  if (activeModalsCount === 0) {
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    // Prevent layout shift from scrollbar disappearing
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open-scroll-locked");
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  activeModalsCount++;
}

export function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  activeModalsCount = Math.max(0, activeModalsCount - 1);
  if (activeModalsCount === 0) {
    document.body.style.overflow = originalOverflow || "";
    document.body.style.paddingRight = originalPaddingRight || "";
    document.body.classList.remove("modal-open-scroll-locked");
  }
}

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isLocked]);
}
