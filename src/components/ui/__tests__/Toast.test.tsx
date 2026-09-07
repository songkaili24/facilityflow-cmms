import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { ToastProvider, useToast } from "@/components/ui/Toast";

function Trigger() {
  const { toast } = useToast();
  return (
    <button
      type="button"
      onClick={() => toast({ title: "WO-2101 advanced", description: "Synced.", variant: "success" })}
    >
      Go
    </button>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("ToastProvider", () => {
  it("shows a toast on demand and auto-dismisses it", async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Go"));
    expect(screen.getByText("WO-2101 advanced")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4_100); // success toasts dismiss after 4s
    });
    expect(screen.queryByText("WO-2101 advanced")).not.toBeInTheDocument();
  });

  it("dismisses immediately via the close button", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText("Go"));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("WO-2101 advanced")).not.toBeInTheDocument();
  });
});
