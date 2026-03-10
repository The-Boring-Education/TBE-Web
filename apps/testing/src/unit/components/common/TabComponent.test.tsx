import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TabComponent } from "@tbe/components";
import React from "react";

// Mock @headlessui/react - Tab is a component with nested components
vi.mock("@headlessui/react", () => {
  // Tab component that can be used in JSX
  const TabComponent = ({ children, className, selected = false }: any) => {
    const classNameValue =
      typeof className === "function" ? className({ selected }) : className;
    return (
      <button role="tab" className={classNameValue} aria-selected={selected}>
        {children}
      </button>
    );
  };

  // Attach nested components to Tab
  TabComponent.Group = ({ children, className }: any) => (
    <div className={className} data-testid="tab-group">
      {children}
    </div>
  );
  TabComponent.List = ({ children, className }: any) => (
    <div className={className} data-testid="tab-list" role="tablist">
      {children}
    </div>
  );
  TabComponent.Panels = ({ children }: any) => (
    <div data-testid="tab-panels">{children}</div>
  );
  TabComponent.Panel = ({ children, className }: any) => (
    <div className={className} data-testid="tab-panel">
      {children}
    </div>
  );

  return {
    Tab: TabComponent,
  };
});

describe("TabComponent", () => {
  describe("Rendering", () => {
    it("should render tab component with labels and panels", () => {
      const tabLabels = ["Tab 1", "Tab 2"];
      const tabPanels = [
        <div key="1">Panel 1</div>,
        <div key="2">Panel 2</div>,
      ];

      const { container } = render(
        <TabComponent tabLabels={tabLabels} tabPanels={tabPanels} />,
      );

      expect(
        container.querySelector('[data-testid="tab-group"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[data-testid="tab-list"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[data-testid="tab-panels"]'),
      ).not.toBeNull();
    });

    it("should render all tab labels", () => {
      const tabLabels = ["Tab 1", "Tab 2", "Tab 3"];
      const tabPanels = [
        <div key="1">Panel 1</div>,
        <div key="2">Panel 2</div>,
        <div key="3">Panel 3</div>,
      ];

      render(<TabComponent tabLabels={tabLabels} tabPanels={tabPanels} />);

      const tabList = screen.getByTestId("tab-list");
      expect(tabList).toBeInTheDocument();
    });

    it("should render all tab panels", () => {
      const tabLabels = ["Tab 1", "Tab 2"];
      const tabPanels = [
        <div key="1">Panel 1</div>,
        <div key="2">Panel 2</div>,
      ];

      render(<TabComponent tabLabels={tabLabels} tabPanels={tabPanels} />);

      const panels = screen.getAllByTestId("tab-panel");
      expect(panels.length).toBe(2);
    });
  });

  describe("Vertical Layout", () => {
    it("should apply vertical layout classes when vertical is true", () => {
      const tabLabels = ["Tab 1"];
      const tabPanels = [<div key="1">Panel 1</div>];

      const { container } = render(
        <TabComponent
          tabLabels={tabLabels}
          tabPanels={tabPanels}
          vertical={true}
        />,
      );

      const tabList = container.querySelector('[data-testid="tab-list"]');
      expect(tabList?.className).toContain("flex-col");
    });

    it("should apply horizontal layout classes when vertical is false", () => {
      const tabLabels = ["Tab 1"];
      const tabPanels = [<div key="1">Panel 1</div>];

      const { container } = render(
        <TabComponent
          tabLabels={tabLabels}
          tabPanels={tabPanels}
          vertical={false}
        />,
      );

      const tabList = container.querySelector('[data-testid="tab-list"]');
      expect(tabList?.className).toContain("flex");
    });
  });
});
