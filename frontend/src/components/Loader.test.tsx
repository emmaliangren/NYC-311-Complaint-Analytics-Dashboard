import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loader from "./Loader";
import {
  SR_TEXT,
  SPINNER_CLASS,
  SIZE_CASES,
  DEFAULT_SIZE,
  DEFAULT_LABEL,
  DEFAULT_LABEL_ONLY,
} from "./Loader.test.constants";

describe("Loader", () => {
  it("should have an accessible status role", () => {
    render(<Loader />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should include screen-reader-only text", () => {
    render(<Loader />);
    expect(screen.getByText(SR_TEXT)).toBeInTheDocument();
  });

  it("should render the spinner", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector(`.${SPINNER_CLASS}`)).toBeInTheDocument();
  });

  it("should render a label when provided", () => {
    render(<Loader label={DEFAULT_LABEL} />);
    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
  });

  it("should not render a label when omitted", () => {
    render(<Loader />);
    expect(screen.queryByText(DEFAULT_LABEL)).not.toBeInTheDocument();
  });

  it.each(SIZE_CASES)("should apply correct class for $size", ({ size, expected }) => {
    const { container } = render(<Loader size={size} />);
    expect(container.querySelector(`.${SPINNER_CLASS}`)).toHaveClass(expected);
  });

  it("should default to medium", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector(`.${SPINNER_CLASS}`)).toHaveClass(DEFAULT_SIZE);
  });

  it("should show default label when spinner is hidden and no label is provided", () => {
    render(<Loader showSpinner={false} />);
    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
  });

  it("should use custom label over default when spinner is hidden", () => {
    render(<Loader showSpinner={false} label={DEFAULT_LABEL_ONLY} />);
    expect(screen.getByText(DEFAULT_LABEL_ONLY)).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LABEL)).not.toBeInTheDocument();
  });
});
