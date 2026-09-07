import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { NewWorkOrderModal } from "@/components/work-orders/NewWorkOrderModal";
import { useOpsStore } from "@/lib/store";
import { DEFAULT_SLA_HOURS } from "@/lib/sla";

function renderModal(onClose = vi.fn()) {
  return render(
    <ToastProvider>
      <NewWorkOrderModal open onClose={onClose} />
    </ToastProvider>
  );
}

function submitButton() {
  return screen.getByRole("button", { name: "Create Work Order" }) as HTMLButtonElement;
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Title/), "Lobby door closer replacement");
  await user.selectOptions(screen.getByLabelText("Category"), "General");
  await user.type(
    screen.getByLabelText(/Description/),
    "Hydraulic closer leaking; the entry door slams shut."
  );
  await user.selectOptions(screen.getByLabelText("Building"), "Building A");
  await user.selectOptions(screen.getByLabelText("Floor"), "1");
}

describe("NewWorkOrderModal", () => {
  beforeEach(() => {
    useOpsStore.setState(useOpsStore.getInitialState(), true);
  });

  it("disables submit until required fields are valid", async () => {
    const user = userEvent.setup();
    renderModal();
    expect(submitButton()).toBeDisabled();
    await fillValidForm(user);
    expect(submitButton()).toBeEnabled();
  });

  it("rejects titles shorter than 8 characters and enforces the 80-char cap", async () => {
    const user = userEvent.setup();
    renderModal();
    const title = screen.getByLabelText(/Title/);
    await user.type(title, "Short");
    expect(screen.getByText(/Title must be 8–80 characters/)).toBeInTheDocument();

    await user.clear(title);
    await user.type(title, "X".repeat(80));
    expect(title).toHaveValue("X".repeat(80));
    // Typing beyond the cap is clamped rather than rejected
    await user.type(title, "X");
    expect((title as HTMLInputElement).value).toHaveLength(80);
  });

  it("requires at least 30 characters of description", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText(/Title/), "Lobby door closer replacement");
    await user.type(screen.getByLabelText(/Description/), "Too short.");
    expect(screen.getByText(/Describe the issue in at least 30 characters/)).toBeInTheDocument();
  });

  it("requires a location selection before submit", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText(/Title/), "Lobby door closer replacement");
    await user.type(
      screen.getByLabelText(/Description/),
      "Hydraulic closer leaking; the entry door slams shut."
    );
    // No building/floor chosen yet
    expect(submitButton()).toBeDisabled();
  });

  it("requires a photo when priority is critical", async () => {
    const user = userEvent.setup();
    renderModal();
    await fillValidForm(user);

    await user.click(screen.getByText("critical", { exact: false }).closest("button")!);
    expect(screen.getByText(/Critical priority requires at least one photo/)).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(["x"], "scene.png", { type: "image/png" })] },
    });
    expect(screen.getByText(/requirement met/)).toBeInTheDocument();
    expect(submitButton()).toBeEnabled();
  });

  it("creates the work order, stamps pendingSync, and closes on submit", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(onClose);
    await fillValidForm(user);
    await user.click(submitButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const state = useOpsStore.getState();
    const created = state.workOrders.find((w) => w.title === "Lobby door closer replacement");
    expect(created).toBeDefined();
    expect(created!.status).toBe("reported");
    expect(state.pendingSync[created!.id]).toBeTypeOf("number");
    expect(screen.getByText(new RegExp(created!.number))).toBeInTheDocument();
  });

  it("auto-assigns a technician whose specialties cover the category", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText(/Title/), "Lobby door closer replacement");
    await user.type(
      screen.getByLabelText(/Description/),
      "Hydraulic closer leaking; the entry door slams shut."
    );
    await user.selectOptions(screen.getByLabelText("Category"), "Plumbing");
    await user.selectOptions(screen.getByLabelText("Building"), "Building A");
    await user.selectOptions(screen.getByLabelText("Floor"), "1");
    await user.click(submitButton());

    await waitFor(() => {
      const created = useOpsStore
        .getState()
        .workOrders.find((w) => w.title === "Lobby door closer replacement");
      expect(created!.assigneeId).toBe("tech-shah"); // plumbing trade
    });
  });

  // BUG DEMONSTRATION: the /sla-config page saves a policy into the store,
  // but the intake modal still computes due dates from the built-in defaults,
  // so admin-configured SLA targets never affect new work orders.
  it.fails("computes the due date from the saved SLA policy", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-08T12:00:00Z"));
    try {
      const custom = {
        ...DEFAULT_SLA_HOURS,
        critical: 2, // admin tightened critical resolution from 8h to 2h
      };
      const existing = useOpsStore.getState().slaPolicy;
      useOpsStore.setState({
        slaPolicy: {
          critical: {
            responseHours: existing?.critical.responseHours ?? 0.5,
            arrivalHours: existing?.critical.arrivalHours ?? 4,
            resolutionHours: 2,
          },
          high: {
            responseHours: existing?.high.responseHours ?? 1,
            arrivalHours: existing?.high.arrivalHours ?? 8,
            resolutionHours: existing?.high.resolutionHours ?? 24,
          },
          medium: {
            responseHours: existing?.medium.responseHours ?? 4,
            arrivalHours: existing?.medium.arrivalHours ?? 24,
            resolutionHours: existing?.medium.resolutionHours ?? 72,
          },
          low: {
            responseHours: existing?.low.responseHours ?? 8,
            arrivalHours: existing?.low.arrivalHours ?? 72,
            resolutionHours: existing?.low.resolutionHours ?? 168,
          },
        },
      });

      renderModal();

      fireEvent.click(screen.getByRole("radio", { name: /Critical/ }));
      const due = screen.getByLabelText(/Due date/) as HTMLInputElement;

      const expected = new Date(new Date("2026-09-08T12:00:00Z").getTime() + 2 * 3_600_000);
      const pad = (n: number) => String(n).padStart(2, "0");
      const expectedLocal = `${expected.getFullYear()}-${pad(expected.getMonth() + 1)}-${pad(
        expected.getDate()
      )}T${pad(expected.getHours())}:${pad(expected.getMinutes())}`;
      expect(due.value).toBe(expectedLocal);
      expect(DEFAULT_SLA_HOURS.critical).not.toBe(2); // guard: this differs from the default
    } finally {
      vi.useRealTimers();
    }
  });
});
