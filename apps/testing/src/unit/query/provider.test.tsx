import { useQueryClient } from "@tanstack/react-query";
import { TBEQueryProvider } from "@tbe/query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => <div data-testid="devtools" />,
}));

function QueryClientConsumer() {
  const client = useQueryClient();
  return (
    <div data-testid="consumer">{client ? "has-client" : "no-client"}</div>
  );
}

describe("TBEQueryProvider", () => {
  it("renders children", () => {
    render(
      <TBEQueryProvider devtools={false}>
        <div data-testid="child">Hello</div>
      </TBEQueryProvider>,
    );
    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("provides a QueryClient to children", () => {
    render(
      <TBEQueryProvider devtools={false}>
        <QueryClientConsumer />
      </TBEQueryProvider>,
    );
    expect(screen.getByTestId("consumer")).toHaveTextContent("has-client");
  });

  it("shows devtools when devtools=true", () => {
    render(
      <TBEQueryProvider devtools>
        <div>child</div>
      </TBEQueryProvider>,
    );
    expect(screen.getByTestId("devtools")).toBeInTheDocument();
  });

  it("hides devtools when devtools=false", () => {
    render(
      <TBEQueryProvider devtools={false}>
        <div>child</div>
      </TBEQueryProvider>,
    );
    expect(screen.queryByTestId("devtools")).not.toBeInTheDocument();
  });
});
