import React, { useRef, useEffect, forwardRef } from "react";
import PanelBody from "./PanelBody";
import type { FilterPanelProps } from "./types";
import ToggleButton from "./ToggleButton";

const FilterPanel = forwardRef<HTMLDivElement, FilterPanelProps>(
  (
    {
      children,
      filteredCount,
      viewportCount,
      isExpanded,
      onExpand,
      onCollapse,
      spotlight,
      activeTab,
      onTabChange,
    },
    ref
  ) => {
    const innerRef = useRef<HTMLDivElement>(null);

    const setRefs = (el: HTMLDivElement | null) => {
      (innerRef as React.RefObject<HTMLDivElement | null>).current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const spotlightPopup = document.querySelector("[data-spotlight-popup]");
        const walkthroughEl = document.querySelector("[data-walkthrough]");
        if (
          innerRef.current &&
          !innerRef.current.contains(e.target as Node) &&
          !spotlightPopup?.contains(e.target as Node) &&
          !walkthroughEl?.contains(e.target as Node)
        ) {
          onCollapse();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onCollapse]);

    return (
      <div
        ref={setRefs}
        className={`absolute left-1 top-1 ${spotlight ? "z-[10000]" : "z-[1000]"}`}
      >
        <div data-walkthrough="toggle-button">
          {!isExpanded && <ToggleButton isExpanded={isExpanded} onClick={onExpand} />}
        </div>
        {isExpanded && (
          <PanelBody
            isExpanded={isExpanded}
            activeTab={activeTab}
            onTabChange={onTabChange}
            onHide={onCollapse}
            filteredCount={filteredCount}
            viewportCount={viewportCount}
          >
            {children}
          </PanelBody>
        )}
      </div>
    );
  }
);

export default FilterPanel;
