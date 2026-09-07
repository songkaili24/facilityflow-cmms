import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusStepper } from "@/components/work-orders/StatusStepper";

const STEPS = ["Reported", "Assigned", "In Progress", "Completed", "Verified"];

function stepLi(label: string) {
  return screen.getByText(label).closest("li")!;
}

describe("StatusStepper", () => {
  it("renders the five lifecycle steps", () => {
    render(<StatusStepper status="reported" />);
    for (const label of STEPS) expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("marks earlier steps done with a check icon and leaves later ones numbered", () => {
    render(<StatusStepper status="in_progress" />);
    expect(stepLi("Reported").querySelector(".lucide-check")).not.toBeNull();
    expect(stepLi("Assigned").querySelector(".lucide-check")).not.toBeNull();
    expect(stepLi("Completed").querySelector(".lucide-check")).toBeNull();
    expect(stepLi("Verified").querySelector(".lucide-check")).toBeNull();
  });

  it("shows every prior step done and Verified as the reached (current) step", () => {
    render(<StatusStepper status="verified" />);
    for (const label of ["Reported", "Assigned", "In Progress", "Completed"]) {
      expect(stepLi(label).querySelector(".lucide-check")).not.toBeNull();
    }
    expect(stepLi("Verified").querySelector(".lucide-check")).toBeNull();
  });

  it("keeps awaiting_parts on the In Progress step rather than adding a sixth step", () => {
    render(<StatusStepper status="awaiting_parts" />);
    expect(screen.queryByText("Awaiting Parts")).not.toBeInTheDocument();
    expect(stepLi("Completed").querySelector(".lucide-check")).toBeNull();
    expect(stepLi("Verified").querySelector(".lucide-check")).toBeNull();
  });
});
