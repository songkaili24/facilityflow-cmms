"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F8FAFC" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            padding: 24,
          }}
        >
          <div>
            <h1 style={{ color: "#1E293B", marginBottom: 8 }}>FacilityFlow hit a critical fault</h1>
            <p style={{ color: "#475569", marginBottom: 24 }}>
              The application shell failed to load. Reset the panel to try again.
            </p>
            <button
              onClick={reset}
              style={{
                minHeight: 48,
                padding: "0 24px",
                borderRadius: 8,
                border: "none",
                background: "#F97316",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reset Panel
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
