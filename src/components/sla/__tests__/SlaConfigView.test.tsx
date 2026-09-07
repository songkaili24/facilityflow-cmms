import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { SlaConfigView } from "@/components/sla/SlaConfigView";
import { useOpsStore } from "@/lib/store";

beforeEach(() => {
  useOpsStore.setState(useOpsStore.getInitialState(), true);
});

function renderView() {
  return render(
    <ToastProvider>
      <SlaConfigView />
    </ToastProvider>
  );
}

function row(priority: string, field: string) {
  // Label text includes the unit suffix ("hrs"), so match by prefix regex.
  return screen.getByLabelText(new RegExp(`^${priority} ${field}`)) as HTMLInputElement;
}

describe("SlaConfigView", () => {
  it("renders all four priorities with three target fields each", () => {
    renderView();
    for (const priority of ["Critical", "High", "Medium", "Low"]) {
      expect(row(priority, "Response")).toBeInTheDocument();
      expect(row(priority, "On-site")).toBeInTheDocument();
      expect(row(priority, "Resolution")).toBeInTheDocument();
    }
  });

  it("keeps Save disabled until a field changes", async () => {
    const user = userEvent.setup();
    renderView();
    const save = screen.getByRole("button", { name: "Save policy" });
    expect(save).toBeDisabled();
    await user.clear(row("Critical", "Resolution"));
    await user.type(row("Critical", "Resolution"), "6");
    expect(save).toBeEnabled();
  });

  it("rejects non-positive values", async () => {
    const user = userEvent.setup();
    renderView();
    await user.clear(row("Critical", "Response"));
    await user.type(row("Critical", "Response"), "0");
    expect(screen.getByText("Must be greater than 0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save policy" })).toBeDisabled();
  });

  it("enforces response <= on-site <= resolution", async () => {
    const user = userEvent.setup();
    renderView();
    await user.clear(row("Critical", "Resolution"));
    await user.type(row("Critical", "Resolution"), "1");
    expect(
      screen.getByText("Response ≤ on-site ≤ resolution must hold")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save policy" })).toBeDisabled();
  });

  it("enforces monotonic tiers across priorities", async () => {
    const user = userEvent.setup();
    renderView();
    await user.clear(row("Low", "Resolution"));
    await user.type(row("Low", "Resolution"), "1");
    expect(
      screen.getByText("Lower priorities need ≥ the tighter tier above")
    ).toBeInTheDocument();
  });

  it("saves a valid policy to the store with confirmation", async () => {
    const user = userEvent.setup();
    renderView();
    await user.clear(row("Critical", "Resolution"));
    await user.type(row("Critical", "Resolution"), "6");
    await user.click(screen.getByRole("button", { name: "Save policy" }));

    await waitFor(() =>
      expect(useOpsStore.getState().slaPolicy?.critical.resolutionHours).toBe(6)
    );
    expect(screen.getByText("SLA policy updated")).toBeInTheDocument();
  });
});
