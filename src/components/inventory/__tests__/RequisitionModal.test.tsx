import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { RequisitionModal } from "@/components/inventory/RequisitionModal";
import { useOpsStore } from "@/lib/store";

const ITEM = useOpsStore
  .getInitialState()
  .inventory.find((i) => i.id === "inv-002")!; // seal kit, on hand: 1

function renderModal(onClose = vi.fn()) {
  return render(
    <ToastProvider>
      <RequisitionModal item={ITEM} onClose={onClose} />
    </ToastProvider>
  );
}

describe("RequisitionModal", () => {
  beforeEach(() => {
    useOpsStore.setState(useOpsStore.getInitialState(), true);
  });

  it("shows the item, on-hand count, and a live value estimate", () => {
    renderModal();
    expect(screen.getByText(ITEM.sku)).toBeInTheDocument();
    expect(screen.getByText(/On hand/)).toBeInTheDocument();
    expect(screen.getByText("$148")).toBeInTheDocument();
  });

  it("rejects zero and over-stock quantities with a visible error and disabled submit", async () => {
    const user = userEvent.setup();
    renderModal();
    const qty = screen.getByLabelText(/Quantity/);

    await user.clear(qty);
    await user.type(qty, "0");
    expect(screen.getByText(/Enter a whole number between 1 and 1/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fill Requisition" })).toBeDisabled();

    await user.clear(qty);
    await user.type(qty, "5");
    expect(screen.getByText(/Enter a whole number between 1 and 1/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fill Requisition" })).toBeDisabled();
  });

  it("debits stock and closes on a valid requisition", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(onClose);

    await user.clear(screen.getByLabelText(/Quantity/));
    await user.type(screen.getByLabelText(/Quantity/), "1");
    await user.type(screen.getByLabelText(/Requested by/), "WO-2103 / P. Shah");
    await user.click(screen.getByRole("button", { name: "Fill Requisition" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(
      useOpsStore.getState().inventory.find((i) => i.id === ITEM.id)!.quantity
    ).toBe(0);
    expect(
      useOpsStore.getState().pendingSync[ITEM.id]
    ).toBeTypeOf("number");
  });
});
