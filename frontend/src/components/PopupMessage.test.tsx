import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PopupMessage from "./PopupMessage";
import {
  TEST_MESSAGE,
  OPACITY_STYLE,
  INVISIBLE_DISABLE_EVENTS,
  VARIANT_STYLES,
  TIMER_DURATION,
} from "./PopupMessage.test.constants";

describe("PopupMessage", () => {
  const defaultProps = {
    message: TEST_MESSAGE,
    visible: true,
    onClose: vi.fn(),
  };

  it("should render the message text", () => {
    render(<PopupMessage {...defaultProps} />);
    expect(screen.getByText(TEST_MESSAGE)).toBeInTheDocument();
  });

  it("should have visible classes when visible is true", () => {
    render(<PopupMessage {...defaultProps} />);
    const popup = screen.getByRole("alert");
    expect(popup).toHaveClass(OPACITY_STYLE.VISIBLE);
    expect(popup).not.toHaveClass(INVISIBLE_DISABLE_EVENTS);
  });

  it("sould have hidden classes when visible is false", () => {
    render(<PopupMessage {...defaultProps} visible={false} />);
    const popup = screen.getByRole("alert");
    expect(popup).toHaveClass(OPACITY_STYLE.NOT_VISIBLE);
    expect(popup).toHaveClass(INVISIBLE_DISABLE_EVENTS);
  });

  it("should call onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<PopupMessage {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  describe("variant styles", () => {
    it("should apply info variant style by default", () => {
      render(<PopupMessage {...defaultProps} />);
      expect(screen.getByRole("alert")).toHaveClass(VARIANT_STYLES.INFO);
    });

    it("should apply other variant styles", () => {
      render(<PopupMessage {...defaultProps} variant="error" />);
      expect(screen.getByRole("alert")).toHaveClass(VARIANT_STYLES.ERROR);
    });
  });

  describe("auto dismiss timer", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should call onClose after the specified duration", () => {
      const onClose = vi.fn();
      render(<PopupMessage {...defaultProps} onClose={onClose} duration={TIMER_DURATION} />);

      expect(onClose).not.toHaveBeenCalled();
      vi.advanceTimersByTime(TIMER_DURATION);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("should not auto-dismiss when duration is not set", () => {
      const onClose = vi.fn();
      render(<PopupMessage {...defaultProps} onClose={onClose} />);

      vi.advanceTimersByTime(TIMER_DURATION);
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not auto-dismiss when not visible", () => {
      const onClose = vi.fn();
      render(
        <PopupMessage
          {...defaultProps}
          visible={false}
          onClose={onClose}
          duration={TIMER_DURATION}
        />
      );

      vi.advanceTimersByTime(TIMER_DURATION);
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
