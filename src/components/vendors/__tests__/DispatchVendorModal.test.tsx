import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { DispatchVendorModal } from "@/components/vendors/VendorViews";
import { useOpsStore } from "@/lib/store";
import { VENDORS } from "@/lib/fixtures";

const METRO = VENDORS.find((v) => v.id === "ven-metro")!;

const emailInput = () =>
  screen.getByLabelText(/^Dispatch confirmation email/) as HTMLInputElement;

function renderModal(onClose = vi.fn()) {
  return render(
    <ToastProvider>
      <DispatchVendorModal vendor={METRO} onClose={onClose} />
    </ToastProvider>
  );
}

beforeEach(() => {
  useOpsStore.setState(useOpsStore.getInitialState(), true);
});

describe("DispatchVendorModal", () => {
  it("requires selecting a work order before dispatch and reveals the acknowledgment panel", async () => {
    const user = userEvent.setup();
    renderModal();
    expect(screen.getByRole("button", { name: "Dispatch" })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText(/Work order/), "wo-2106");
    // Panel with email + acknowledgment appears; dispatch stays disabled
    // until the SLA acknowledgment is checked.
    expect(emailInput()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dispatch" })).toBeDisabled();
  });

  it("requires a format-valid confirmation email", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.selectOptions(screen.getByLabelText(/Work order/), "wo-2106");

    const email = emailInput();
    await user.clear(email);
    await user.type(email, "not-an-email");
    expect(screen.getByText(/Enter a valid contact email/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dispatch" })).toBeDisabled();
  });

  it("requires the SLA acknowledgment checkbox", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.selectOptions(screen.getByLabelText(/Work order/), "wo-2106");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Dispatch" })).toBeDisabled();

    await user.clear(emailInput());
    await user.type(emailInput(), "ops@meridianfac.example");
    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("button", { name: "Dispatch" })).toBeEnabled();
  });

  it("dispatches the vendor to the selected work order with SLA noted in the toast", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(onClose);

    await user.selectOptions(screen.getByLabelText(/Work order/), "wo-2106");
    await user.clear(emailInput());
    await user.type(emailInput(), "ops@meridianfac.example");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Dispatch" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const wo = useOpsStore.getState().workOrders.find((w) => w.id === "wo-2106")!;
    expect(wo.vendorId).toBe("ven-metro");
    expect(wo.status).toBe("assigned");
    expect(screen.getByText(/Response SLA acknowledged/)).toBeInTheDocument();
  });
});
