import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Area,
} from "recharts";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [topMeds, setTopMeds] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiryRisk, setExpiryRisk] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const [form, setForm] = useState({
    date: "",
    medicine_name: "",
    quantity: "",
    price: "",
    pharmacy_id: "",
  });

  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");

  async function loadData() {
    setApiError("");

    const results = await Promise.allSettled([
      axios.get(`${API}/metrics/total-revenue`),
      axios.get(`${API}/metrics/top-medicines?limit=10`),
      axios.get(`${API}/alerts/low-stock`),
      axios.get(`${API}/alerts/expiry-risk`),
      axios.get(`${API}/trends/monthly-revenue`),
    ]);

    const [rev, top, low, exp, mon] = results;

    if (rev.status === "fulfilled") {
      setTotalRevenue(Number(rev.value.data.total_revenue ?? 0));
    } else {
      setApiError("Revenue endpoint failed. Check backend.");
    }

    if (top.status === "fulfilled") {
      const cleaned = (top.value.data ?? []).map((r) => ({
        ...r,
        total_qty: Number(r.total_qty ?? 0),
      }));
      setTopMeds(cleaned);
    } else {
      setApiError("Top medicines endpoint failed. ");
      setTopMeds([]);
    }

    if (low.status === "fulfilled") setLowStock(low.value.data ?? []);
    else setLowStock([]);

    if (exp.status === "fulfilled") setExpiryRisk(exp.value.data ?? []);
    else setExpiryRisk([]);

    if (mon.status === "fulfilled") {
      const cleanedMonthly = (mon.value.data ?? []).map((r) => ({
        ...r,
        revenue: Number(r.revenue ?? 0),
      }));
      setMonthly(cleanedMonthly);
    } else {
      setMonthly([]);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(`${API}/sales`, {
        date: form.date,
        medicine_name: form.medicine_name.trim(),
        quantity: Number(form.quantity),
        price: Number(form.price),
        pharmacy_id: form.pharmacy_id.trim(),
      });

      setMessage(" Sale added successfully!");
      setForm({
        date: "",
        medicine_name: "",
        quantity: "",
        price: "",
        pharmacy_id: "",
      });

      await loadData();
    } catch (err) {
      console.error(err);
      setMessage(" Error adding sale .");
    }
  }

  const todayLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(new Date());
    }
  }, []);

  /* ---------- LIVE ANALYTICS (Backend-based) ---------- */
  const lowStockCount = lowStock?.length ?? 0;
  const expiryRiskCount = expiryRisk?.length ?? 0;

  const latestMonthRevenue = useMemo(() => {
    if (!monthly || monthly.length === 0) return 0;
    return Number(monthly[monthly.length - 1]?.revenue ?? 0);
  }, [monthly]);

  const revenueGrowth = useMemo(() => {
    if (!monthly || monthly.length < 2) return 0;
    const last = Number(monthly[monthly.length - 1]?.revenue ?? 0);
    const prev = Number(monthly[monthly.length - 2]?.revenue ?? 0);
    if (prev <= 0) return 0;
    return ((last - prev) / prev) * 100;
  }, [monthly]);

  // Inventory “health score” derived from alerts you already have
  const inventoryStatus = useMemo(() => {
    const penalty = lowStockCount * 4 + expiryRiskCount * 6; // expiry heavier
    const score = Math.max(0, Math.min(100, 100 - penalty));
    return score;
  }, [lowStockCount, expiryRiskCount]);

  const monthlyArea = useMemo(() => {
    return (monthly ?? []).map((m) => ({
      ...m,
      value: Number(m.revenue ?? 0),
    }));
  }, [monthly]);

  return (
    <div style={styles.page}>
      {/* Responsive layout fixes */}
      <style>{`
        .shell{
          display:grid;
          grid-template-columns: 1fr 360px;
          gap:28px;
          align-items:start;
          padding:18px;
          max-width:1400px;
          margin:0 auto;
        }
        .main{ min-width:0; }
        .sidebar{
          height:fit-content;
          position:sticky;
          top:18px;
        }
        .grid2{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:20px;
          margin-top:16px;
        }
        .formGrid{
          display:grid;
          grid-template-columns:repeat(2, minmax(0,1fr));
          gap:20px 32px;
        }
        
        /* Premium responsive form layout */
        .col-span-2 { grid-column: span 2; }
        
        .formInput {
          width: 100%;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          outline: none;
          font-weight: 500;
          font-size: 13px;
          color: #0f172a;
          box-shadow: inset 0 1px 2px rgba(15,23,42,0.03);
          transition: all 0.2s ease;
        }
        .formInput:focus {
          border-color: #0f766e;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
        }

        @media (max-width: 1100px){
          .shell{ grid-template-columns:1fr; }
          .sidebar{ position:relative; top:auto; }
          .grid2{ grid-template-columns:1fr; }
          .formGrid{ grid-template-columns:1fr; gap:14px; }
          .col-span-2 { grid-column: span 1; }
        }
      `}</style>

      {/* Background layer (blurred) */}
      <div style={styles.bgWrap}>
        <div style={styles.bgImage} />
        <div style={styles.bgOverlay} />
      </div>

      <div className="shell">
        {/* Main */}
        <main className="main" style={styles.main}>
          {/* Top header */}
          <div style={styles.topbar}>
            <div style={styles.brand}>
              <div style={styles.logoBox}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 13h3l2-6 3 12 2-6h6"
                    stroke="#0F766E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div style={styles.title}>Healthcare Analytics</div>
                <div style={styles.subtitle}>
                  Overview & Performance Dashboard
                </div>
              </div>
            </div>

            <div style={styles.datePill}>
              <span style={styles.dateIcon}>📅</span>
              <span>{todayLabel}</span>
            </div>
          </div>

          {apiError && (
            <div style={styles.alert}>
              <b>⚠</b> <span>{apiError}</span>
            </div>
          )}

          {/* Add Sale Card */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconSoft}>＋</div>
              <div style={styles.cardHeaderText}>Add New Sale</div>
            </div>

            <form onSubmit={handleSubmit} className="formGrid">
              <div className="col-span-2">
                <Field label="Medicine Name">
                  <input
                    placeholder="e.g., Amoxicillin"
                    value={form.medicine_name}
                    onChange={(e) =>
                      setForm({ ...form, medicine_name: e.target.value })
                    }
                    required
                    className="formInput"
                  />
                </Field>
              </div>

              <div>
                <Field label="Date">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="formInput"
                  />
                </Field>
              </div>

              <div>
                <Field label="Pharmacy ID">
                  <input
                    placeholder="e.g., P004"
                    value={form.pharmacy_id}
                    onChange={(e) =>
                      setForm({ ...form, pharmacy_id: e.target.value })
                    }
                    required
                    className="formInput"
                  />
                </Field>
              </div>

              <div>
                <Field label="Quantity">
                  <input
                    type="number"
                    placeholder="0"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    required
                    className="formInput"
                  />
                </Field>
              </div>

              <div>
                <Field label="Price ($)">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="formInput"
                  />
                </Field>
              </div>

              <div className="col-span-2" style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <button type="submit" style={{ ...styles.primaryBtn, width: "auto", minWidth: 160 }}>
                  <span style={{ fontSize: 16, marginRight: 6 }}>＋</span> Add Sale
                </button>
              </div>
            </form>

            {message && <div style={styles.formMsg}>{message}</div>}
          </section>

          {/* Total Revenue */}
          <section style={styles.revenueCard}>
            <div style={styles.revenueLeft}>
              <div style={styles.revIcon}>💲</div>
              <div>
                <div style={styles.revLabel}>Total Revenue</div>
                <div style={styles.revValue}>
                  $
                  {Number(totalRevenue).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div style={styles.revHint}>Updated just now</div>
              </div>
            </div>

            <div style={styles.revBadge}>
              <span style={{ marginRight: 6 }}>📈</span>{" "}
              {revenueGrowth >= 0 ? "+" : ""}
              {revenueGrowth.toFixed(1)}%
            </div>
          </section>

          {/* Charts row */}
          <section className="grid2">
            <div style={styles.chartCard}>
              <div style={styles.chartTitleRow}>
                <div style={styles.smallIconBox}>📊</div>
                <div style={styles.chartTitle}>Top Medicines</div>
              </div>

              {topMeds.length === 0 ? (
                <div style={styles.empty}>
                  No data for top medicines. Check:
                  <div style={styles.mono}>
                    {API}/metrics/top-medicines?limit=10
                  </div>
                </div>
              ) : (
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topMeds} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="medicine_name"
                        type="category"
                        width={110}
                        tick={{ fill: "#475569", fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="total_qty" fill="#14b8a6" radius={[10, 10, 10, 10]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div style={styles.chartCard}>
              <div style={styles.chartTitleRow}>
                <div style={styles.smallIconBox}>📈</div>
                <div style={styles.chartTitle}>Monthly Revenue</div>
              </div>

              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyArea} margin={{ left: 10, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip />
                    <defs>
                      <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="none" fill="url(#revFill)" />
                    <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Tables */}
          <section className="grid2">
            <div style={styles.tableCard}>
              <div style={styles.tableTitle}>⚠ Low Stock</div>
              <MiniTable data={lowStock} field="stock" />
            </div>
            <div style={styles.tableCard}>
              <div style={styles.tableTitle}>⏳ Expiry Risk</div>
              <MiniTable data={expiryRisk} field="expiry_date" />
            </div>
          </section>

          <div style={styles.footerNote}>
           @All rights reserved
          </div>
        </main>

        {/* Right Sidebar (Backend-based Live Analytics) */}
        <aside className="sidebar" style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarPulse}>〰</div>
            <div>
              <div style={styles.sidebarTitle}>Live Analytics</div>
              <div style={styles.sidebarSub}>System monitoring</div>
            </div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.sideIcon}>💰</div>
            <div style={styles.sideLabel}>Latest Month Revenue</div>
            <div style={styles.sideValue}>
              ${latestMonthRevenue.toLocaleString()}
            </div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.sideIcon}>📈</div>
            <div style={styles.sideLabel}>Revenue Growth (MoM)</div>
            <div style={styles.sideValue}>
              {revenueGrowth >= 0 ? "+" : ""}
              {revenueGrowth.toFixed(1)}%
            </div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.sideIcon}>⚠️</div>
            <div style={styles.sideLabel}>Low Stock Alerts</div>
            <div style={styles.sideValue}>{lowStockCount}</div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.sideIcon}>⏳</div>
            <div style={styles.sideLabel}>Expiry Risk Alerts</div>
            <div style={styles.sideValue}>{expiryRiskCount}</div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.sideIcon}>📦</div>
            <div style={styles.sideLabel}>Inventory Status</div>
            <div style={styles.sideValue}>{inventoryStatus}%</div>
          </div>

          <div style={styles.sidebarHint}>
            Inventory Status is calculated from your alert endpoints.
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={styles.label}>{label}</div>
      {children}
    </div>
  );
}

function MiniTable({ data, field }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.thLeft}>Medicine</th>
            <th style={styles.thRight}>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td style={styles.tdLeft}>{r.medicine_name}</td>
              <td style={styles.tdRight}>{r[field]}</td>
            </tr>
          ))}
          {!data.length && (
            <tr>
              <td colSpan={2} style={styles.noData}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Styles ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    color: "#0f172a",
    position: "relative",
  },

  bgWrap: { position: "fixed", inset: 0, zIndex: 0 },
  bgImage: {
    position: "absolute",
    inset: 0,
    backgroundImage: "url(/medical-bg.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(1px)",
    transform: "scale(1.4)",
  },
  bgOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(240,250,255,0.85), rgba(235,255,246,0.80))",
  },

  main: {
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(15,23,42,0.06)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
    backdropFilter: "blur(4px)",
    minHeight: "calc(100vh - 36px)",
  },

  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "4px 4px 12px 4px",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(20,184,166,0.10)",
    border: "1px solid rgba(20,184,166,0.14)",
  },
  title: { fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: "#0f172a" },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 2, fontWeight: 500 },

  datePill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(15,23,42,0.06)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    fontWeight: 500,
    fontSize: 12,
    color: "#334155",
    whiteSpace: "nowrap",
  },
  dateIcon: {
    width: 24,
    height: 24,
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
    background: "rgba(37,99,235,0.08)",
  },

  alert: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    background: "rgba(254, 226, 226, 0.80)",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    color: "#991b1b",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    fontWeight: 600,
    fontSize: 13,
  },

  card: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.06)",
    padding: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  cardIconSoft: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.12)",
    fontWeight: 700,
    color: "#0f766e",
    fontSize: 16,
  },
  cardHeaderText: { fontSize: 16, fontWeight: 600, color: "#0f172a" },

  label: { fontSize: 12, fontWeight: 500, color: "#475569" },
  input: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(148,163,184,0.40)",
    background: "rgba(255,255,255,0.95)",
    outline: "none",
    fontWeight: 500,
    fontSize: 13,
    color: "#0f172a",
  },
  formButtonWrap: { display: "flex", alignItems: "flex-end" },
  primaryBtn: {
    width: "100%",
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    color: "white",
    background: "#0F8F7A",
    boxShadow: "0 4px 12px rgba(15, 143, 122, 0.15)",
    transition: "all 0.2s ease",
  },
  formMsg: { marginTop: 10, fontWeight: 600, fontSize: 12, color: "#0f766e" },

  revenueCard: {
    marginTop: 14,
    background: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.06)",
    padding: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  revenueLeft: { display: "flex", alignItems: "center", gap: 12 },
  revIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(37,99,235,0.08)",
    border: "1px solid rgba(37,99,235,0.12)",
    fontSize: 18,
  },
  revLabel: { fontWeight: 500, fontSize: 13, color: "#475569" },
  revValue: { fontWeight: 700, fontSize: 28, color: "#0f172a", letterSpacing: "-0.5px", marginTop: 2 },
  revHint: { color: "#64748b", fontWeight: 500, fontSize: 11, marginTop: 4 },
  revBadge: {
    padding: "6px 12px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 12,
    color: "#0f766e",
    background: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.12)",
    whiteSpace: "nowrap",
  },

  chartCard: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.06)",
    padding: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  chartTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  smallIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.12)",
    fontSize: 14,
  },
  chartTitle: { fontSize: 15, fontWeight: 600, color: "#0f172a" },
  empty: { color: "#64748b", fontWeight: 500, fontSize: 12, padding: 8 },
  mono: {
    marginTop: 6,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
    fontSize: 11,
    color: "#0f172a",
  },

  tableCard: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.06)",
    padding: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  tableTitle: { fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 8 },
  table: { width: "100%", borderCollapse: "collapse" },
  thLeft: {
    textAlign: "left",
    fontSize: 11,
    color: "#64748b",
    padding: "8px 6px",
    borderBottom: "1px solid rgba(148,163,184,0.20)",
    fontWeight: 600,
  },
  thRight: {
    textAlign: "right",
    fontSize: 11,
    color: "#64748b",
    padding: "8px 6px",
    borderBottom: "1px solid rgba(148,163,184,0.20)",
    fontWeight: 600,
  },
  tdLeft: {
    padding: "8px 6px",
    borderBottom: "1px solid rgba(148,163,184,0.10)",
    fontWeight: 500,
    fontSize: 13,
  },
  tdRight: {
    padding: "8px 6px",
    borderBottom: "1px solid rgba(148,163,184,0.10)",
    textAlign: "right",
    fontWeight: 600,
    fontSize: 13,
    color: "#0f172a",
  },
  noData: { padding: 10, color: "#64748b", fontWeight: 500, fontSize: 12, textAlign: "center" },

  footerNote: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 11,
    fontWeight: 500,
  },

  sidebar: {
    borderRadius: 16,
    padding: 16,
    border: "1px solid rgba(148,163,184,0.12)",
    background:
      "radial-gradient(1200px 500px at 20% 0%, rgba(16,184,166,0.10), transparent 50%), linear-gradient(180deg, rgba(15,23,42,0.95), rgba(15,23,42,0.90))",
    color: "white",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    backdropFilter: "blur(6px)",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sidebarPulse: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(16,185,129,0.10)",
    border: "1px solid rgba(16,185,129,0.18)",
    color: "#34d399",
    fontWeight: 700,
    fontSize: 14,
  },
  sidebarTitle: { fontSize: 18, fontWeight: 700, color: "white" },
  sidebarSub: {
    color: "rgba(226,232,240,0.65)",
    fontWeight: 500,
    fontSize: 12,
    marginTop: 2,
  },

  sideCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    background: "rgba(30, 41, 59, 0.60)",
    border: "1px solid rgba(148,163,184,0.12)",
  },
  sideIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(148,163,184,0.08)",
    border: "1px solid rgba(148,163,184,0.12)",
    marginBottom: 8,
    fontSize: 14,
  },
  sideLabel: { color: "rgba(226,232,240,0.65)", fontWeight: 500, fontSize: 12 },
  sideValue: { fontSize: 20, fontWeight: 700, marginTop: 4, color: "white" },
  sidebarHint: {
    marginTop: 12,
    color: "rgba(226,232,240,0.55)",
    fontWeight: 500,
    fontSize: 11,
  },
};;