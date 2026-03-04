import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ClusterMap from "./ClusterMap";
import { MAP_TESTID, MAP_CLASS, CUSTOM_CLASS, WRAPPER_TESTID } from "./constants";

describe("ClusterMap", () => {
  it("should render the map container", () => {
    render(<ClusterMap />);
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });

  it("should apply default classes", () => {
    render(<ClusterMap />);
    expect(screen.getByTestId(WRAPPER_TESTID)).toHaveClass(MAP_CLASS);
  });

  it("should merge a custom className", () => {
    render(<ClusterMap className={CUSTOM_CLASS} />);
    const wrapper = screen.getByTestId(WRAPPER_TESTID);
    expect(wrapper).toHaveClass(CUSTOM_CLASS);
    expect(wrapper).toHaveClass(MAP_CLASS);
  });
});
