import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { useDialogAccessibility } from "./useDialogAccessibility";

function DialogHarness() {
  const [isOpen, setIsOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { dialogRef, handleDialogKeyDown } = useDialogAccessibility(
    isOpen,
    () => setIsOpen(false),
    titleRef,
  );

  return <>
    <button onClick={() => setIsOpen(true)}>열기</button>
    {isOpen && <div ref={dialogRef} role="dialog" aria-modal="true" onKeyDown={handleDialogKeyDown}>
      <h2 ref={titleRef} tabIndex={-1}>제목</h2>
      <button>첫 번째</button>
      <button>마지막</button>
    </div>}
  </>;
}

describe("useDialogAccessibility", () => {
  it("moves focus into the dialog, traps Tab, closes on Escape, and restores the trigger", async () => {
    render(<DialogHarness />);
    const trigger = screen.getByRole("button", { name: "열기" });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("heading", { name: "제목" })));

    const last = screen.getByRole("button", { name: "마지막" });
    last.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "첫 번째" }));

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });
});
