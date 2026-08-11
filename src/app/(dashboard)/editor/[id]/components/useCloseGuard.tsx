"use client";

import { useCallback, useRef, useState, type RefObject } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * 편집 모달을 X/Esc로 닫을 때, 저장하지 않은 변경이 있으면 확인을 먼저 받는다.
 * (실수로 닫아 입력이 사라지는 것을 막아 불안한 사용자를 보호한다.)
 */
export function useCloseGuard(isDirty: boolean, onClose: () => void) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const requestClose = useCallback(() => {
    if (isDirty) setConfirmOpen(true);
    else onClose();
  }, [isDirty, onClose]);
  return { requestClose, confirmOpen, setConfirmOpen };
}

export function DiscardChangesDialog({
  open,
  onOpenChange,
  onConfirm,
  restoreFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  // 취소('계속 편집')로 닫힐 때 포커스를 되돌릴 모달 내부 요소(다시 Esc가 먹도록).
  restoreFocusRef?: RefObject<HTMLElement | null>;
}) {
  const confirmedRef = useRef(false);
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="bg-spotify-dark-surface border-none rounded-lg shadow-spotify text-white"
        onCloseAutoFocus={(event) => {
          // 닫기(폐기)로 닫히면 모달이 언마운트되므로 되돌리지 않는다.
          if (confirmedRef.current) {
            confirmedRef.current = false;
            return;
          }
          if (restoreFocusRef?.current) {
            event.preventDefault();
            restoreFocusRef.current.focus();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[20px] font-bold text-white">
            저장하지 않고 닫을까요?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-spotify-silver text-[15px] font-medium leading-relaxed">
            방금 입력한 변경 내용이 사라져요. 저장하려면 &lsquo;계속 편집&rsquo;을 누른 뒤 저장하고 닫기를 눌러주세요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel className="bg-transparent border border-white/10 text-white rounded-full h-11 font-bold px-6 hover:bg-white/5 transition-colors">
            계속 편집
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              confirmedRef.current = true;
              onConfirm();
            }}
            className="!bg-transparent border border-spotify-negative/40 !text-spotify-negative hover:!bg-spotify-negative/10 rounded-full h-11 font-bold px-6 transition-colors"
          >
            닫기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
