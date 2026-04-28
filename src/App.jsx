import React, { useState } from "react";
import {
  checkConnection, setRate, sendMessage, readMessage,
  getMessage, listInbox, getRate, getEarnings
} from "../lib/stellar.js";

const toOutput = (value) => {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
};

const truncAddr = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : null;

export default function App() {
  const [form, setForm] = useState({
    id: "msg1",
    sender: "",
    recipient: "",
    content: "Hello there!",
    paymentAmount: "100",
    rate: "50",
  });
  const [output, setOutput] = useState("");
  const [outputStatus, setOutputStatus] = useState("idle");
  const [walletAddr, setWalletAddr] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [view, setView] = useState("landing"); // "landing" | "app"

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const runAction = async (actionName, action) => {
    setBusy(true);
    setLoadingAction(actionName);
    setOutputStatus("idle");
    try {
      const result = await action();
      setOutput(toOutput(result ?? "Done"));
      setOutputStatus("success");
    } catch (err) {
      setOutput(err?.message || String(err));
      setOutputStatus("error");
    } finally {
      setBusy(false);
      setLoadingAction(null);
    }
  };

  const onConnect = () =>
    runAction("connect", async () => {
      const user = await checkConnection();
      if (user) {
        const addr = user.publicKey;
        setWalletAddr(addr);
        setWalletConnected(true);
        setForm((p) => ({ ...p, sender: addr, recipient: p.recipient || addr }));
        return `Connected: ${addr}`;
      }
      setWalletAddr("");
      setWalletConnected(false);
      return "Wallet not connected";
    });

  const isLoading = (name) => loadingAction === name;

  const tabs = ["Set rate", "Send message", "Inbox"];

  const faqs = [
    ["Do I need XLM to use this?", "Yes — small amounts of XLM cover Stellar network fees. Payments between users are tracked in i128 units inside the smart contract."],
    ["What wallet do I need?", "Install the Freighter browser extension, create or import a Stellar account, and switch to Testnet mode before connecting."],
    ["What if I set my rate to zero?", "Anyone can message you for free. Zero is the default — call Set Rate to require payment from senders."],
    ["Are messages stored on-chain?", "Yes. Content, sender, recipient, payment, read status, and timestamp are all in Soroban contract instance storage on Stellar testnet."],
  ];

  if (view === "landing") {
    return (
      <div style={s.page}>
        {/* Nav */}
        <nav style={s.nav}>
          <div style={s.navBrand}>
            <div style={s.navDot} />
            <span style={s.navName}>Pay-to-Message</span>
          </div>
          <div style={s.navLinks}>
            <a href="#how" style={s.navLink}>How it works</a>
            <a href="#faq" style={s.navLink}>FAQ</a>
            <button style={s.navCta} onClick={() => setView("app")}>Launch app →</button>
          </div>
        </nav>

        {/* Hero */}
        <section style={s.hero}>
          <div style={s.heroInner}>
            <div style={s.heroBadge}>
              <span style={s.heroBadgeDot} />
              Live on Stellar Testnet
            </div>
            <h1 style={s.h1}>
              Monetize your inbox.<br />
              <span style={s.h1Accent}>Block the noise.</span>
            </h1>
            <p style={s.heroSub}>
              Set a price to receive messages. Senders pay, you earn.
              Built on Stellar Soroban smart contracts — fully non-custodial.
            </p>
            <div style={s.heroActions}>
              <button style={s.btnPrimary} onClick={() => setView("app")}>Launch app</button>
              <a href="#how" style={s.btnGhost}>How it works</a>
            </div>
          </div>
          <div style={s.heroVisual}>
            <div style={s.msgCard}>
              <div style={s.msgMeta}>
                <div style={s.msgAvatar}>SR</div>
                <div>
                  <div style={s.msgSender}>GSEND...1234</div>
                  <div style={s.msgTime}>just now</div>
                </div>
                <div style={s.msgBadge}>+100</div>
              </div>
              <div style={s.msgBubble}>"Hey! I'd love to discuss a collaboration opportunity with you."</div>
            </div>
            <div style={{ ...s.msgCard, ...s.msgCard2 }}>
              <div style={s.msgMeta}>
                <div style={{ ...s.msgAvatar, background: "#e0f2fe", color: "#0369a1" }}>AM</div>
                <div>
                  <div style={s.msgSender}>GALPH...5678</div>
                  <div style={s.msgTime}>2 min ago</div>
                </div>
                <div style={{ ...s.msgBadge, background: "#fef9c3", color: "#854d0e" }}>+250</div>
              </div>
              <div style={s.msgBubble}>"Important: your audit report is ready for review."</div>
            </div>
            <div style={s.earningsChip}>
              <span style={s.earningsLabel}>Total earned</span>
              <span style={s.earningsNum}>350</span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div style={s.stats}>
          {[
            ["0.01s", "Avg settlement"],
            ["i128", "Payment precision"],
            ["100%", "Non-custodial"],
          ].map(([num, label]) => (
            <div key={label} style={s.statCard}>
              <div style={s.statNum}>{num}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <section id="how" style={s.section}>
          <div style={s.sectionLabel}>How it works</div>
          <div style={s.steps}>
            {[
              ["1", "Set your rate", "Choose a minimum payment for anyone messaging you. Zero means free, any positive value filters low-intent senders."],
              ["2", "Receive paid messages", "Senders attach a payment meeting your rate. Messages below it are rejected on-chain before they reach you."],
              ["3", "Earn and respond", "Earnings accumulate in your contract storage. Read messages at your pace — spam can't afford you."],
            ].map(([n, title, desc]) => (
              <div key={n} style={s.stepCard}>
                <div style={s.stepNum}>{n}</div>
                <h3 style={s.stepTitle}>{title}</h3>
                <p style={s.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={s.section}>
          <div style={s.sectionLabel}>Common questions</div>
          <div style={s.faqList}>
            {faqs.map(([q, a], i) => (
              <div key={i} style={s.faqItem} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div style={s.faqQ}>
                  <span>{q}</span>
                  <span style={{ ...s.faqArrow, transform: openFaq === i ? "rotate(180deg)" : "none" }}>⌄</span>
                </div>
                {openFaq === i && <div style={s.faqA}>{a}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={s.footer}>
          <div>
            <div style={s.footerBrand}>Pay-to-Message</div>
            <div style={s.footerSub}>Stellar Soroban · Project 34</div>
          </div>
          <div style={s.footerLinks}>
            <a href="https://stellar.org/developers" style={s.footerLink} target="_blank" rel="noreferrer">Stellar docs</a>
            <a href="https://developers.stellar.org/docs/smart-contracts" style={s.footerLink} target="_blank" rel="noreferrer">Soroban</a>
            <a href="https://freighter.app" style={s.footerLink} target="_blank" rel="noreferrer">Freighter</a>
          </div>
        </footer>
      </div>
    );
  }

  // ── App view ─────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <button style={s.backBtn} onClick={() => setView("landing")}>← Back</button>
        <div style={s.navBrand}>
          <div style={s.navDot} />
          <span style={s.navName}>Pay-to-Message</span>
        </div>
        <div style={s.walletBar}>
          <span style={{ ...s.wDot, background: walletConnected ? "#22c55e" : "#ef4444" }} />
          <span style={s.walletText}>
            {walletConnected ? truncAddr(walletAddr) : "Not connected"}
          </span>
          <button
            style={walletConnected ? { ...s.connectBtn, ...s.connectBtnActive } : s.connectBtn}
            onClick={onConnect}
            disabled={busy}
          >
            {isLoading("connect") ? "Connecting…" : walletConnected ? "Reconnect" : "Connect wallet"}
          </button>
        </div>
      </nav>

      <div style={s.appShell}>
        {/* Tabs */}
        <div style={s.tabBar}>
          {tabs.map((t, i) => (
            <button
              key={t}
              style={{ ...s.tabBtn, ...(activeTab === i ? s.tabBtnActive : {}) }}
              onClick={() => setActiveTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab 0 — Set Rate */}
        {activeTab === 0 && (
          <div style={s.card}>
            <div style={s.cardHead}><span style={s.cardIcon}>⚙</span><h2 style={s.cardTitle}>Message rate</h2></div>
            <div style={s.cardBody}>
              <div style={s.fieldRow}>
                <Field label="Recipient address" hint="Wallet receiving paid messages">
                  <input style={s.input} name="recipient" value={form.recipient} onChange={setField} placeholder="G..." />
                </Field>
                <Field label="Rate per message" hint="Minimum payment (i128)">
                  <input style={s.input} name="rate" type="number" value={form.rate} onChange={setField} />
                </Field>
              </div>
              <div style={s.btnRow}>
                <Btn loading={isLoading("setRate")} disabled={busy} onClick={() => runAction("setRate", () => setRate(form.recipient.trim(), form.rate.trim()))}>
                  Set rate
                </Btn>
                <Btn variant="ghost" loading={isLoading("getRate")} disabled={busy} onClick={() => runAction("getRate", () => getRate(form.recipient.trim()))}>
                  Get current rate
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1 — Send Message */}
        {activeTab === 1 && (
          <div style={s.card}>
            <div style={s.cardHead}><span style={s.cardIcon}>✉</span><h2 style={s.cardTitle}>Compose message</h2></div>
            <div style={s.cardBody}>
              <div style={s.fieldRow}>
                <Field label="Message ID" hint="Unique identifier">
                  <input style={s.input} name="id" value={form.id} onChange={setField} />
                </Field>
                <Field label="Payment amount" hint="Must meet recipient's rate">
                  <input style={s.input} name="paymentAmount" type="number" value={form.paymentAmount} onChange={setField} />
                </Field>
              </div>
              <div style={s.fieldRow}>
                <Field label="Sender" hint="Auto-filled from wallet">
                  <input style={s.input} name="sender" value={form.sender} onChange={setField} placeholder="G..." />
                </Field>
                <Field label="Recipient">
                  <input style={s.input} name="recipient" value={form.recipient} onChange={setField} placeholder="G..." />
                </Field>
              </div>
              <div style={s.composer}>
                <textarea
                  style={s.composerText}
                  name="content"
                  rows={2}
                  value={form.content}
                  onChange={setField}
                  placeholder="Type your message…"
                />
                <button
                  style={{ ...s.sendBtn, opacity: busy ? 0.5 : 1 }}
                  disabled={busy}
                  onClick={() => runAction("sendMessage", () => sendMessage({
                    id: form.id.trim(),
                    sender: form.sender.trim(),
                    recipient: form.recipient.trim(),
                    content: form.content.trim(),
                    paymentAmount: form.paymentAmount.trim(),
                  }))}
                >
                  {isLoading("sendMessage") ? "…" : "➤"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 — Inbox */}
        {activeTab === 2 && (
          <div style={s.card}>
            <div style={s.cardHead}><span style={s.cardIcon}>📥</span><h2 style={s.cardTitle}>Inbox &amp; earnings</h2></div>
            <div style={s.cardBody}>
              <div style={s.fieldRow}>
                <Field label="Message ID">
                  <input style={s.input} name="id" value={form.id} onChange={setField} />
                </Field>
                <Field label="Recipient address">
                  <input style={s.input} name="recipient" value={form.recipient} onChange={setField} placeholder="G..." />
                </Field>
              </div>
              <div style={s.btnRow}>
                <Btn loading={isLoading("readMessage")} disabled={busy} onClick={() => runAction("readMessage", () => readMessage(form.id.trim(), form.recipient.trim()))}>Mark as read</Btn>
                <Btn variant="outline" loading={isLoading("getMessage")} disabled={busy} onClick={() => runAction("getMessage", () => getMessage(form.id.trim()))}>Get message</Btn>
                <Btn variant="outline" loading={isLoading("listInbox")} disabled={busy} onClick={() => runAction("listInbox", () => listInbox(form.recipient.trim()))}>List inbox</Btn>
                <Btn variant="ghost" loading={isLoading("getEarnings")} disabled={busy} onClick={() => runAction("getEarnings", () => getEarnings(form.recipient.trim()))}>View earnings</Btn>
              </div>
            </div>
          </div>
        )}

        {/* Output */}
        <div style={{ ...s.outputCard, ...(outputStatus === "success" ? s.outputOk : outputStatus === "error" ? s.outputErr : {}) }}>
          <div style={s.outputLabel}>Output</div>
          {output
            ? <pre style={s.outputPre}>{output}</pre>
            : <span style={s.outputEmpty}>Connect your wallet and perform an action to see results.</span>
          }
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={s.fieldLabel}>{label}</label>
      {children}
      {hint && <span style={s.fieldHint}>{hint}</span>}
    </div>
  );
}

function Btn({ children, onClick, disabled, loading, variant = "primary" }) {
  const base = { ...s.btn };
  if (variant === "outline") Object.assign(base, s.btnOutline);
  if (variant === "ghost") Object.assign(base, s.btnGhostApp);
  if (disabled) base.opacity = 0.5;
  return (
    <button style={base} onClick={onClick} disabled={disabled}>
      {loading ? "…" : children}
    </button>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const s = {
  page: { maxWidth: 960, margin: "0 auto", padding: "0 1rem 3rem", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#111" },

  // Nav
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 0", borderBottom: "1px solid #e5e7eb", marginBottom: "2rem", gap: 12, flexWrap: "wrap" },
  navBrand: { display: "flex", alignItems: "center", gap: 8 },
  navDot: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" },
  navName: { fontWeight: 600, fontSize: 15 },
  navLinks: { display: "flex", alignItems: "center", gap: 20 },
  navLink: { fontSize: 14, color: "#6b7280", textDecoration: "none" },
  navCta: { padding: "7px 16px", borderRadius: 8, background: "#111", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  backBtn: { padding: "7px 14px", borderRadius: 8, background: "transparent", border: "1px solid #e5e7eb", fontSize: 13, cursor: "pointer", color: "#374151" },

  // Hero
  hero: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center", marginBottom: "3rem" },
  heroInner: { display: "flex", flexDirection: "column", gap: 16 },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", width: "fit-content" },
  heroBadgeDot: { width: 6, height: 6, borderRadius: "50%", background: "#22c55e" },
  h1: { fontSize: 42, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em" },
  h1Accent: { color: "#15803d" },
  heroSub: { fontSize: 16, color: "#4b5563", lineHeight: 1.7, maxWidth: 460 },
  heroActions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 },
  btnPrimary: { padding: "11px 22px", borderRadius: 8, background: "#111", color: "#fff", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  btnGhost: { padding: "11px 22px", borderRadius: 8, background: "transparent", color: "#374151", border: "1px solid #d1d5db", fontSize: 14, fontWeight: 500, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center" },

  // Hero visual
  heroVisual: { position: "relative", display: "flex", flexDirection: "column", gap: 12 },
  msgCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 10 },
  msgCard2: { marginLeft: 24 },
  msgMeta: { display: "flex", alignItems: "center", gap: 10 },
  msgAvatar: { width: 34, height: 34, borderRadius: "50%", background: "#dcfce7", color: "#15803d", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  msgSender: { fontSize: 12, fontWeight: 600, color: "#111" },
  msgTime: { fontSize: 11, color: "#9ca3af" },
  msgBadge: { marginLeft: "auto", padding: "3px 10px", borderRadius: 20, background: "#f0fdf4", color: "#15803d", fontSize: 12, fontWeight: 600 },
  msgBubble: { fontSize: 13, color: "#374151", lineHeight: 1.5, fontStyle: "italic" },
  earningsChip: { alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 10, background: "#111", color: "#fff", borderRadius: 10, padding: "10px 16px" },
  earningsLabel: { fontSize: 12, color: "#9ca3af" },
  earningsNum: { fontSize: 20, fontWeight: 700 },

  // Stats
  stats: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "3rem" },
  statCard: { background: "#f9fafb", borderRadius: 10, padding: "1rem 1.25rem", border: "1px solid #e5e7eb" },
  statNum: { fontSize: 26, fontWeight: 700, color: "#111" },
  statLabel: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  // Sections
  section: { marginBottom: "3rem" },
  sectionLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 16 },

  // Steps
  steps: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 },
  stepCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem" },
  stepNum: { width: 28, height: 28, borderRadius: "50%", background: "#f0fdf4", color: "#15803d", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  stepTitle: { fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 6 },
  stepDesc: { fontSize: 13, color: "#6b7280", lineHeight: 1.6 },

  // FAQ
  faqList: { display: "flex", flexDirection: "column", gap: 8 },
  faqItem: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", cursor: "pointer" },
  faqQ: { fontSize: 14, fontWeight: 500, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#111" },
  faqArrow: { color: "#6b7280", transition: "transform 0.2s", fontSize: 16 },
  faqA: { fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginTop: 10 },

  // Footer
  footer: { borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  footerBrand: { fontSize: 14, fontWeight: 600, color: "#111" },
  footerSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  footerLinks: { display: "flex", gap: 16 },
  footerLink: { fontSize: 13, color: "#6b7280", textDecoration: "none" },

  // App shell
  appShell: { display: "flex", flexDirection: "column", gap: "1rem" },

  // Wallet bar
  walletBar: { display: "flex", alignItems: "center", gap: 8 },
  wDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  walletText: { fontSize: 13, color: "#374151" },
  connectBtn: { padding: "6px 14px", borderRadius: 8, background: "#fff", border: "1px solid #d1d5db", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#374151" },
  connectBtnActive: { background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" },

  // Tabs
  tabBar: { display: "flex", borderBottom: "1px solid #e5e7eb" },
  tabBtn: { padding: "0.65rem 1.25rem", fontSize: 14, fontWeight: 500, cursor: "pointer", border: "none", borderBottom: "2px solid transparent", background: "transparent", color: "#6b7280", transition: "color 0.15s", borderRadius: 0 },
  tabBtnActive: { color: "#111", borderBottomColor: "#111" },

  // Card
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" },
  cardHead: { padding: "0.9rem 1.25rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 8, background: "#fafafa" },
  cardIcon: { fontSize: 16 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#111" },
  cardBody: { padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" },

  // Fields
  fieldRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fieldLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280" },
  fieldHint: { fontSize: 11, color: "#9ca3af" },
  input: { padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 14, color: "#111", fontFamily: "inherit", width: "100%", outline: "none" },

  // Composer
  composer: { display: "flex", gap: 8, alignItems: "flex-end" },
  composerText: { flex: 1, borderRadius: 20, padding: "10px 14px", border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 14, color: "#111", fontFamily: "inherit", resize: "none", outline: "none" },
  sendBtn: { width: 44, height: 44, borderRadius: "50%", background: "#111", color: "#fff", border: "none", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  // Buttons
  btn: { padding: "8px 16px", borderRadius: 8, background: "#111", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  btnOutline: { background: "#fff", color: "#374151", border: "1px solid #d1d5db" },
  btnGhostApp: { background: "transparent", color: "#6b7280", border: "none" },
  btnRow: { display: "flex", gap: 8, flexWrap: "wrap" },

  // Output
  outputCard: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem", minHeight: 90, borderLeft: "3px solid #e5e7eb" },
  outputOk: { borderLeftColor: "#22c55e" },
  outputErr: { borderLeftColor: "#ef4444" },
  outputLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: 8 },
  outputPre: { margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "monospace", fontSize: 13, color: "#111", lineHeight: 1.6 },
  outputEmpty: { fontSize: 13, color: "#9ca3af", fontStyle: "italic" },
};