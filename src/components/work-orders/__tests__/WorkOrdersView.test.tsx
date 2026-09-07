import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { WorkOrdersView } from "@/components/work-orders/WorkOrdersView";
import { useOpsStore } from "@/lib/store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/workorders",
  useSearchParams: () => new URLSearchParams(),
}));

function renderView() {
  return render(
    <ToastProvider>
      <WorkOrdersView />
    </ToastProvider>
  );
}

beforeEach(() => {
  useOpsStore.setState(useOpsStore.getInitialState(), true);
});

describe("WorkOrdersView", () => {
  it("renders kanban columns (desktop) and card list (mobile) with seeded orders", async () => {
    renderView();
    await screen.findAllByText("WO-2101");
    for (const column of ["New", "Assigned", "In Progress", "Awaiting Parts", "Completed"]) {
      // Desktop kanban renders inside a hidden lg:block container; assert via
      // DOM query since CSS visibility is not applied in jsdom.
      const columnEl = document.querySelector(`[aria-label="${column} column"]`);
      expect(columnEl).not.toBeNull();
    }
    expect(screen.getAllByText("WO-2112").length).toBeGreaterThan(0);
  });

  it("narrows results when searching by work order number", async () => {
    const user = userEvent.setup();
    renderView();
    await screen.findAllByText("WO-2112");
    await user.type(
      screen.getByLabelText("Search work orders by ID, title, or location"),
      "WO-2101"
    );
    expect(screen.getAllByText("WO-2101").length).toBeGreaterThan(0);
    expect(screen.queryByText("WO-2112")).not.toBeInTheDocument();
  });

  it("searches location text (zone names)", async () => {
    const user = userEvent.setup();
    renderView();
    await screen.findAllByText("WO-2101");
    await user.type(
      screen.getByLabelText("Search work orders by ID, title, or location"),
      "Zone 3 — South"
    );
    expect(screen.queryByText("WO-2101")).not.toBeInTheDocument();
    expect(screen.getAllByText(/WO-21(04|06|09)/).length).toBeGreaterThan(0);
  });

  it("filters by category and shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderView();
    await screen.findAllByText("WO-2101");

    await user.selectOptions(screen.getByLabelText("Category"), "Plumbing");
    expect(screen.queryByText("WO-2101")).not.toBeInTheDocument(); // HVAC
    expect(screen.getAllByText("WO-2107").length).toBeGreaterThan(0); // Plumbing

    await user.type(
      screen.getByLabelText("Search work orders by ID, title, or location"),
      "zzz-no-match"
    );
    expect(screen.getByText("No work orders match the current search and filters.")).toBeInTheDocument();
  });

  it("moves a card to the assigned column via the drop handler", async () => {
    renderView();
    await screen.findAllByText("WO-2101");
    const columnEl = document.querySelector('[aria-label="Assigned column"]')!;
    fireEvent.drop(columnEl, {
      dataTransfer: { getData: () => "wo-2106" },
    });
    expect(useOpsStore.getState().workOrders.find((w) => w.id === "wo-2106")!.status).toBe(
      "assigned"
    );
  });
});
