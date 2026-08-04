import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialogAccessibility<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void,
  initialFocusRef: RefObject<T | null>,
) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    initialFocusRef.current?.focus();

    return () => triggerRef.current?.focus();
  }, [initialFocusRef, isOpen]);

  // 배경 비활성화: 다이얼로그 조상 체인 밖의 형제 요소를 inert 처리해 스크린리더가 뒤로 새지 않게 한다.
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const hidden: HTMLElement[] = [];
    let node: HTMLElement | null = dialog;
    while (node && node !== document.body && node.parentElement) {
      for (const sib of Array.from(node.parentElement.children)) {
        // 토스트 컨테이너는 inert 대상에서 제외 — 모달 열림 중에도 알림이 읽히고 조작 가능해야 한다.
        const isPersistent =
          sib.hasAttribute("data-sonner-toaster") || sib.hasAttribute("data-a11y-persist");
        if (sib !== node && sib instanceof HTMLElement && !sib.hasAttribute("inert") && !isPersistent) {
          sib.setAttribute("inert", "");
          sib.setAttribute("aria-hidden", "true");
          hidden.push(sib);
        }
      }
      node = node.parentElement;
    }
    return () => {
      for (const el of hidden) {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
    };
  }, [isOpen]);

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return { dialogRef, handleDialogKeyDown };
}
