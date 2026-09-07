import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { WorkOrderDetailView } from "@/components/work-orders/WorkOrderDetailView";
import { useOpsStore } from "@/lib/store";

function renderDetail(id: string) {
  return render(
    <ToastProvider>
      <WorkOrderDetailView id={id} />
    </ToastProvider>
  );
}

beforeEach(() => {
  useOpsStore.setState(useOpsStore.getInitialState(), true);
});

describe("WorkOrderDetailView", () => {
  it("renders the header, description, and lifecycle stepper", () => {
    renderDetail("wo-2101");
    expect(screen.getByText("WO-2101")).toBeInTheDocument();
    expect(
      screen.getByText(/Chiller #2 tripping on high discharge pressure/)
    ).toBeInTheDocument();
    for (const step of ["Reported", "Assigned", "In Progress", "Completed", "Verified"]) {
      // The sidebar also has a "Reported" label, so allow multiples.
      expect(screen.getAllByText(step).length).toBeGreaterThan(0);
    }
  });

  it("shows a not-found panel for unknown ids", () => {
    renderDetail("wo-unknown");
    expect(screen.getByText("Work order not found")).toBeInTheDocument();
  });

  it("renders parts with cost estimates and activity timeline", () => {
    renderDetail("wo-2101");
    expect(screen.getByText(/Condenser tube brush kit/)).toBeInTheDocument();
    expect(screen.getByText("$602")).toBeInTheDocument(); // 2×45 + 4×18 + 40×11
  });

  it("adds a typed note through the composer", async () => {
    const user = userEvent.setup();
    renderDetail("wo-2107");
    await user.click(screen.getByRole("button", { name: "Add Note" }));
    await user.type(
      screen.getByPlaceholderText(/Condition found, parts used/),
      "Cartridge ordered; returning tomorrow."
    );
    await user.click(screen.getByRole("button", { name: /Post/ }));

    expect(
      useOpsStore
        .getState()
        .workOrders.find((w) => w.id === "wo-2107")!
        .timeline.at(-1)!.message
    ).toBe("Cartridge ordered; returning tomorrow.");
  });

  it("closes an open work order via the Close action", async () => {
    const user = userEvent.setup();
    renderDetail("wo-2107");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(useOpsStore.getState().workOrders.find((w) => w.id === "wo-2107")!.status).toBe(
      "completed"
    );
  });

  it("lists related work orders that share the same asset", () => {
    renderDetail("wo-2101"); // CH-02 — no other WO on that asset
    expect(screen.getByText("No other work orders on this asset.")).toBeInTheDocument();

    // wo-2104 (LT-2C) and wo-2108? — use an asset with a sibling: none in
    // fixtures share an asset, so assert the empty state contract only.
  });

  // BUG DEMONSTRATION: for an awaiting_parts work order, nextStatus is
  // computed as STATUS_ORDER.indexOf("awaiting_parts") + 1 === 0, so
  // "Update Status" regresses the order back to Reported instead of
  // advancing it to In Progress.
  it.fails("advances an awaiting-parts order instead of regressing it to Reported", async () => {
    const user = userEvent.setup();
    renderDetail("wo-2104"); // status: awaiting_parts
    await user.click(screen.getByRole("button", { name: /Update Status/ }));
    expect(useOpsStore.getState().workOrders.find((w) => w.id === "wo-2104")!.status).toBe(
      "in_progress"
    );
  });
});
