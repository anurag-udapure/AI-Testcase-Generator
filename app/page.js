"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [requirement, setRequirement] = useState("");
  const [context, setContext] = useState("");
  const [maxCases, setMaxCases] = useState("10");
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [testType, setTestType] = useState("All");

  async function generate() {
    if (!requirement.trim() || loading) return;
    setLoading(true);
    setError("");
    setTestCases([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirement,
          context,
          maxCases: parseInt(maxCases),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setTestCases(data.testCases);
      setFilter("All");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function exportTxt() {
    const lines = testCases
      .map((tc) =>
        [
          "=".repeat(55),
          `${tc.id} - ${tc.title}`,
          `Category: ${tc.category} | Priority: ${tc.priority} | Type: ${tc.test_type}`,
          `\nScenario:\n  ${tc.scenario}`,
          `\nSteps:\n${tc.steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}`,
          `\nExpected Result:\n  ${tc.expected_result}`,
        ].join("\n")
      )
      .join("\n\n");
    download("test_cases.txt", lines, "text/plain");
  }

  function exportJson() {
    download(
      "test_cases.json",
      JSON.stringify(testCases, null, 2),
      "application/json"
    );
  }

  function exportCsv() {
    const header = "ID,Title,Category,Priority,Type,Scenario,Steps,Expected Result";
    const rows = testCases.map((tc) =>
      [
        tc.id, tc.title, tc.category, tc.priority,
        tc.test_type, tc.scenario,
        tc.steps.join(" -> "),
        tc.expected_result,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    download("test_cases.csv", [header, ...rows].join("\n"), "text/csv");
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  }

  const categories = ["All", ...new Set(testCases.map((tc) => tc.category))];
  const filtered =
    filter === "All" ? testCases : testCases.filter((tc) => tc.category === filter);

  const counts = {
    total: testCases.length,
    high: testCases.filter((t) => t.priority === "High").length,
    negative: testCases.filter((t) => t.test_type === "Negative").length,
    edge: testCases.filter((t) => t.test_type === "Edge Case").length,
  };

  function priorityColor(p) {
    return p === "High" ? "#ff4444" : p === "Medium" ? "#ffaa00" : "#44bb44";
  }

  function categoryColor(c) {
    const map = {
      Functional: "#00c977",
      Security: "#ff6677",
      Boundary: "#e5c800",
      Performance: "#5599ff",
      "UI/UX": "#cc88ff",
    };
    return map[c] || "#00c977";
  }

  function typeColor(t) {
    return t === "Positive" ? "#55dd55" : t === "Negative" ? "#dd5555" : "#ddaa33";
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e6f0", fontFamily: "'IBM Plex Mono', monospace", paddingBottom: 80 }}>

      {/* Header */}
      <header
  style={{
    borderBottom: "1px solid #1e1e2e",
    padding: "22px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0d0d15",
  }}
>
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
      TestCase.AI
    </span>
    <span
      style={{
        background: "#00e5a0",
        color: "#000",
        fontSize: 9,
        fontWeight: 800,
        padding: "3px 8px",
        borderRadius: 4,
      }}
    >
      Beta
    </span>
  </div>

  {/* ✅ Right side button */}
  <Link href="/history">
    <button
      style={{
        background: "#00e5a0",
        color: "#000",
        border: "none",
        padding: "8px 14px",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      History
    </button>
  </Link>
</header>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "52px 24px 0" }}>

        {/* Hero */}
        <h1 style={{ fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 800, lineHeight: 1.1, color: "#fff", marginBottom: 10 }}>
          Generate <span style={{ color: "#00e5a0" }}>test cases</span><br />from requirements.
        </h1>
        <p style={{ fontSize: 13, color: "#6b6880", marginBottom: 40 }}>
          Paste a system requirement and get structured QA test cases in seconds.
        </p>

        {/* Input Card */}
        <div style={{ background: "#111119", border: "1px solid #1e1e2e", borderRadius: 12, padding: 28, marginBottom: 20 }}>

          <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#00e5a0", letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8 }}>
            System Requirement *
          </label>
          <textarea
            style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a", borderRadius: 8, color: "#e8e6f0", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", padding: "12px 14px", minHeight: 100, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            placeholder="e.g. User login system with email and password. System should show error for wrong password..."
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
          />

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#00e5a0", letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8 }}>
              Extra Context (optional)
            </label>
            <input
              style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a", borderRadius: 8, color: "#e8e6f0", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", padding: "12px 14px", outline: "none", boxSizing: "border-box" }}
              placeholder="e.g. This is a banking app used by 50,000 users"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#00e5a0", letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8 }}>
              Number of Test Cases
            </label>
            <select
              style={{ width: "100%", background: "#0a0a0f", border: "1px solid #2a2a3a", borderRadius: 8, color: "#e8e6f0", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", padding: "12px 14px", outline: "none", boxSizing: "border-box" }}
              value={maxCases}
              onChange={(e) => setMaxCases(e.target.value)}
            >
              {[5, 8, 10, 15, 20, 25].map((n) => (
                <option key={n} value={n}>{n} test cases</option>
              ))}
            </select>
          </div>
              <div style={{ marginTop: 18 }}>
  <label style={{ fontSize: 10, color: "#00e5a0" }}>
    Test Case Type
  </label>

  <select
    value={testType}
    onChange={(e) => setTestType(e.target.value)}
    style={{
      width: "100%",
      padding: 10,
      background: "#0a0a0f",
      color: "#fff",
      border: "1px solid #2a2a3a",
      borderRadius: 8,
      marginTop: 6,
    }}
  >
    <option value="All">All</option>
    <option value="Functional">Functional</option>
    <option value="Security">Security</option>
    <option value="Performance">Performance</option>
    <option value="UI/UX">UI/UX</option>
  </select>
</div>
          <button
            onClick={generate}
            disabled={loading || !requirement.trim()}
            style={{ marginTop: 20, width: "100%", background: "#00e5a0", color: "#000", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", padding: 15, cursor: loading || !requirement.trim() ? "not-allowed" : "pointer", opacity: loading || !requirement.trim() ? 0.4 : 1, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {loading ? "Generating..." : "Generate Test Cases"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#1a0a0a", border: "1px solid #ff4455", borderRadius: 8, padding: "14px 18px", color: "#ff6677", fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Results */}
        {testCases.length > 0 && (
          <>
            {/* Stats */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { val: counts.total, label: "Total Cases" },
                { val: counts.high, label: "High Priority" },
                { val: counts.negative, label: "Negative Cases" },
                { val: counts.edge, label: "Edge Cases" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#111119", border: "1px solid #1e1e2e", borderRadius: 8, padding: "14px 18px", flex: 1, minWidth: 110 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: "#6b6880", letterSpacing: 1.4, textTransform: "uppercase", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Export Buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[["TXT", exportTxt], ["JSON", exportJson], ["CSV", exportCsv]].map(([label, fn]) => (
                <button key={label} onClick={fn} style={{ background: "transparent", border: "1px solid #2a2a3a", borderRadius: 7, color: "#888", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", padding: "8px 16px", cursor: "pointer" }}>
                  Download {label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{ background: filter === cat ? "#00e5a0" : "#111119", border: `1px solid ${filter === cat ? "#00e5a0" : "#1e1e2e"}`, borderRadius: 20, color: filter === cat ? "#000" : "#888", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", padding: "5px 13px", cursor: "pointer", fontWeight: filter === cat ? 800 : 400 }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Test Case Cards */}
            {filtered.map((tc) => (
              <div key={tc.id} style={{ background: "#111119", border: "1px solid #1e1e2e", borderRadius: 10, padding: 22, marginBottom: 10 }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#00e5a0", letterSpacing: 1.5, marginBottom: 3 }}>{tc.id}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{tc.title}</div>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {[
                      { label: tc.priority, color: priorityColor(tc.priority) },
                      { label: tc.category, color: categoryColor(tc.category) },
                      { label: tc.test_type, color: typeColor(tc.test_type) },
                    ].map((tag) => (
                      <span key={tag.label} style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, letterSpacing: 1, textTransform: "uppercase", color: tag.color, border: `1px solid ${tag.color}33`, background: `${tag.color}11` }}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: "#1e1e2e", margin: "12px 0" }} />

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#6b6880", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>Scenario</div>
                  <div style={{ fontSize: 13, color: "#aaa8b8", lineHeight: 1.6 }}>{tc.scenario}</div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#6b6880", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>Steps</div>
                  {tc.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#aaa8b8", padding: "3px 0" }}>
                      <span style={{ color: "#00e5a0", fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: 9, color: "#6b6880", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>Expected Result</div>
                  <div style={{ fontSize: 13, color: "#e8e6f0", lineHeight: 1.6, background: "#0a0a0f", padding: 12, borderRadius: 6, border: "1px solid #1e1e2e" }}>{tc.expected_result}</div>
                </div>

              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}