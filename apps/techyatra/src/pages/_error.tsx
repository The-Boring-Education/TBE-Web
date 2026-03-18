import type { NextPageContext } from "next";

interface ErrorProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", fontWeight: 700, color: "#1f2937" }}>
        {statusCode || "Error"}
      </h1>
      <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
        {statusCode === 404
          ? "This page could not be found."
          : "An unexpected error occurred."}
      </p>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default ErrorPage;
