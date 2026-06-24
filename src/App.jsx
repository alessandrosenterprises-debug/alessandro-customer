import { useState, useEffect } from "react";

const BUSINESSES = [
  { id: "soft-loans", name: "Alessandro Soft Loans", icon: "💰", color: "#1a3a5c", tagline: "Fast, flexible financing for your goals", services: ["Personal Loan","Business Loan","Micro Loan","Loan Consultation","Refinancing"], description: "Quick approvals, low interest, trusted financing solutions." },
  { id: "mobile-money", name: "Alessandro Mobile Money", icon: "📱", color: "#0d6e4f", tagline: "Send, receive and save with ease", services: ["Money Transfer","Airtime & Data","Bill Payments","Savings Account","Cash Withdrawal"], description: "Secure mobile financial services available 24/7." },
  { id: "barbershop", name: "Alessandro Classic Barbershop", icon: "✂️", color: "#7c3a2a", tagline: "Precision cuts, classic style", services: ["Classic Haircut","Fade & Taper","Hot Towel Shave","Beard Trim","Hair Treatment","Dreadlocks"], description: "Premium grooming by master barbers." },
  { id: "fashion", name: "Alessandro Elite Fashion", icon: "👔", color: "#4a1a6e", tagline: "Dress for the life you deserve", services: ["Style Consultation","Custom Tailoring","Wardrobe Package","Alterations","Formal Wear Hire"], description: "Bespoke fashion and elite styling services." },
  { id: "tech", name: "Alessandro Tech Solutions", icon: "💻", color: "#1a3a6e", tagline: "Technology that works for you", services: ["Website Development","App Development","IT Support","Network Setup","Software Solutions","Cybersecurity"], description: "Cutting-edge digital solutions for modern businesses." },
];

const STORAGE_KEY = "alessandro_data";
const GOLD = "#c9a84c";
const DARK = "#0e1a2b";
const CONTACT_EMAIL = "alessandrosenterprises@gmail.com";
const CONTACT_PHONE = "0768148043";

async function loadData() {
  try {
    const result = await window.storage.get(STORAGE_KEY, true);
    return result ? JSON.parse(result.value) : { customers: [], bookings: [], messages: [], emails: [], requests: [], services: [] };
  } catch { return { customers: [], bookings: [], messages: [], emails: [], requests: [], services: [] }; }
}

async function saveData(data) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(data), true); } catch (e) { console.error(e); }
}

export default function CustomerApp() {
  const [screen, setScreen] = useState("splash");
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", name: "", phone: "", isRegister: false });
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("home");
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [bookingForm, setBookingForm] = useState({ service: "", date: "", time: "", notes: "" });
  const [msgForm, setMsgForm] = useState({ subject: "", message: "" });
  const [emailForm, setEmailForm] = useState({ subject: "", body: "", business: "soft-loans" });
  const [requestForm, setRequestForm] = useState({ type: "", details: "", business: "soft-loans", priority: "medium" });
  const [notif, setNotif] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [msgSubTab, setMsgSubTab] = useState("messages");
  const [profilePic, setProfilePic] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });

  const handleProfilePic = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!editForm.name.trim()) { notify("Name cannot be empty", "#991b1b"); return; }
    const updated = { ...data, customers: data.customers.map(c => c.id === user.id ? { ...c, name: editForm.name, phone: editForm.phone } : c) };
    await saveData(updated); setData(updated);
    setUser(u => ({ ...u, name: editForm.name, phone: editForm.phone }));
    setEditingProfile(false); notify("Profile updated! ✓");
  };

  useEffect(() => {
    loadData().then(setData);
    const t = setTimeout(() => setScreen("login"), 2400);
    return () => clearTimeout(t);
  }, []);

  const notify = (msg, color = "#065f46") => { setNotif({ msg, color }); setTimeout(() => setNotif(null), 3200); };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) { notify("Please fill all fields", "#991b1b"); return; }
    const currentData = await loadData();
    if (loginForm.isRegister) {
      if (!loginForm.name || !loginForm.phone) { notify("All fields required", "#991b1b"); return; }
      if (currentData.customers.find(c => c.email === loginForm.email)) { notify("Email already registered", "#991b1b"); return; }
      const newCustomer = { id: Date.now(), name: loginForm.name, email: loginForm.email, phone: loginForm.phone, business: "soft-loans", joined: new Date().toISOString().split("T")[0], status: "active" };
      const updated = { ...currentData, customers: [...currentData.customers, newCustomer] };
      await saveData(updated); setData(updated); setUser(newCustomer); setScreen("app");
      notify(`Welcome, ${newCustomer.name}! 🎉`);
    } else {
      const found = currentData.customers.find(c => c.email === loginForm.email);
      if (found) { setUser(found); setData(currentData); setScreen("app"); notify(`Welcome back, ${found.name}!`); }
      else notify("Account not found. Please register.", "#92400e");
    }
  };

  const submitBooking = async () => {
    if (!bookingForm.service || !bookingForm.date || !bookingForm.time) { notify("Please fill all booking fields", "#991b1b"); return; }
    const booking = { id: Date.now(), customerId: user.id, customerName: user.name, business: selectedBiz?.id || "soft-loans", service: bookingForm.service, date: bookingForm.date, time: bookingForm.time, status: "pending", notes: bookingForm.notes || "" };
    const updated = { ...data, bookings: [...data.bookings, booking] };
    await saveData(updated); setData(updated);
    setBookingForm({ service: "", date: "", time: "", notes: "" }); setModalType(null);
    notify("Booking submitted! ✓ We'll confirm shortly.");
  };

  const submitMessage = async () => {
    if (!msgForm.subject || !msgForm.message) { notify("Please fill all fields", "#991b1b"); return; }
    const msg = { id: Date.now(), from: user.name, email: user.email, business: selectedBiz?.id || "soft-loans", subject: msgForm.subject, message: msgForm.message, date: new Date().toISOString().split("T")[0], read: false };
    const updated = { ...data, messages: [...(data.messages || []), msg] };
    await saveData(updated); setData(updated);
    setMsgForm({ subject: "", message: "" }); setModalType(null);
    notify("Message sent! ✓");
  };

  const submitEmail = async () => {
    if (!emailForm.subject || !emailForm.body) { notify("Please fill all fields", "#991b1b"); return; }
    const email = { id: Date.now(), from: user.email, fromName: user.name, business: emailForm.business, subject: emailForm.subject, body: emailForm.body, date: new Date().toISOString().split("T")[0], read: false, attachments: [] };
    const updated = { ...data, emails: [...(data.emails || []), email] };
    await saveData(updated); setData(updated);
    setEmailForm({ subject: "", body: "", business: "soft-loans" }); setModalType(null);
    notify("Email sent! ✓");
  };

  const submitRequest = async () => {
    if (!requestForm.type || !requestForm.details) { notify("Please fill all fields", "#991b1b"); return; }
    const req = { id: Date.now(), customerId: user.id, customerName: user.name, email: user.email, business: requestForm.business, type: requestForm.type, details: requestForm.details, date: new Date().toISOString().split("T")[0], status: "pending", priority: requestForm.priority };
    const updated = { ...data, requests: [...(data.requests || []), req] };
    await saveData(updated); setData(updated);
    setRequestForm({ type: "", details: "", business: "soft-loans", priority: "medium" }); setModalType(null);
    notify("Request submitted! ✓ We'll respond shortly.");
  };

  const myBookings = data && user ? (data.bookings || []).filter(b => b.customerId === user.id) : [];
  const myMessages = data && user ? (data.messages || []).filter(m => m.email === user.email) : [];
  const myEmails = data && user ? (data.emails || []).filter(e => e.from === user.email) : [];
  const myRequests = data && user ? (data.requests || []).filter(r => r.email === user.email) : [];

  const badgeBg = (s) => ({ confirmed:"#d1fae5", pending:"#fef3c7", cancelled:"#fee2e2", completed:"#e0e7ff", "in-progress":"#fef3c7", resolved:"#d1fae5", "under-review":"#dbeafe" }[s] || "#e5e7eb");
  const badgeClr = (s) => ({ confirmed:"#065f46", pending:"#92400e", cancelled:"#991b1b", completed:"#3730a3", "in-progress":"#b45309", resolved:"#065f46", "under-review":"#1e40af" }[s] || "#374151");

  const inputStyle = { width: "100%", padding: "11px 14px", border: "1px solid #e5eaf2", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" };
  const selStyle = { ...inputStyle, color: DARK };

  if (screen === "splash") return (
    <div style={{ background: `linear-gradient(160deg,${DARK} 0%,#1a3a5c 100%)`, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ fontSize: 60, marginBottom: 20 }}>🏢</div>
      <div style={{ color: GOLD, fontSize: 13, letterSpacing: 6, textTransform: "uppercase", marginBottom: 4 }}>Alessandro</div>
      <div style={{ color: "#fff", fontSize: 26, fontWeight: 700 }}>Enterprises</div>
      <div style={{ color: "#5a7fa8", fontSize: 11, marginTop: 6, letterSpacing: 3 }}>YOUR TRUSTED PARTNER</div>
      <div style={{ marginTop: 44, display: "flex", gap: 8 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i===1 ? GOLD : "#2a4060" }} />)}
      </div>
    </div>
  );

  if (screen === "login") return (
    <div style={{ background: `linear-gradient(160deg,${DARK} 0%,#132033 60%,#1a3a5c 100%)`, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Segoe UI', sans-serif" }}>
      {notif && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: notif.color, color: "#fff", padding: "12px 24px", borderRadius: 12, zIndex: 999, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px #0006", whiteSpace: "nowrap" }}>{notif.msg}</div>}
      <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", borderRadius: 24, padding: "36px 30px", width: "100%", maxWidth: 380, border: "1px solid rgba(201,168,76,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>🏢</div>
          <div style={{ color: GOLD, fontSize: 11, letterSpacing: 4, textTransform: "uppercase" }}>Alessandro</div>
          <div style={{ color: "#fff", fontSize: 22, fontFamily: "Georgia, serif", fontWeight: 700 }}>Enterprises</div>
          <div style={{ color: "#7a9cc0", fontSize: 12, marginTop: 6 }}>{loginForm.isRegister ? "Create your account" : "Welcome back"}</div>
        </div>
        <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 4, marginBottom: 22 }}>
          {["Login","Register"].map((l,i) => (
            <button key={l} onClick={() => setLoginForm(f => ({ ...f, isRegister: i===1 }))} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: loginForm.isRegister===(i===1) ? GOLD : "transparent", color: loginForm.isRegister===(i===1) ? DARK : "#7a9cc0" }}>{l}</button>
          ))}
        </div>
        {loginForm.isRegister && <>
          <input placeholder="Full Name" value={loginForm.name} onChange={e => setLoginForm(f => ({ ...f, name: e.target.value }))} style={{ ...inputStyle, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#fff", marginBottom: 10 }} />
          <input placeholder="Phone Number" value={loginForm.phone} onChange={e => setLoginForm(f => ({ ...f, phone: e.target.value }))} style={{ ...inputStyle, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#fff", marginBottom: 10 }} />
        </>}
        <input placeholder="Email Address" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} style={{ ...inputStyle, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#fff", marginBottom: 10 }} />
        <input placeholder="Password" type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} style={{ ...inputStyle, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#fff", marginBottom: 18 }} />
        <button onClick={handleLogin} style={{ width: "100%", padding: 13, background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>
          {loginForm.isRegister ? "CREATE ACCOUNT" : "LOGIN"}
        </button>
        <div style={{ textAlign: "center", marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 18 }}>
          <div style={{ color: "#5a7fa8", fontSize: 11, marginBottom: 10 }}>Need help? Contact us</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ padding: "7px 14px", background: "rgba(255,255,255,0.08)", color: GOLD, borderRadius: 8, fontSize: 11, textDecoration: "none", fontWeight: 600 }}>📧 Email</a>
            <a href={`tel:${CONTACT_PHONE}`} style={{ padding: "7px 14px", background: "rgba(255,255,255,0.08)", color: GOLD, borderRadius: 8, fontSize: 11, textDecoration: "none", fontWeight: 600 }}>📞 Call</a>
            <a href={`https://wa.me/27${CONTACT_PHONE.substring(1)}`} target="_blank" rel="noreferrer" style={{ padding: "7px 14px", background: "#25D366", color: "#fff", borderRadius: 8, fontSize: 11, textDecoration: "none", fontWeight: 600 }}>💬 WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );

  // MAIN APP
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", position: "relative", paddingBottom: 72 }}>
      {notif && <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", background: notif.color, color: "#fff", padding: "12px 22px", borderRadius: 12, zIndex: 999, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px #0006", whiteSpace: "nowrap", maxWidth: "90vw" }}>{notif.msg}</div>}

      {/* MODAL */}
      {modalType && (
        <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, padding: "24px 24px 32px", maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: DARK }}>
                {modalType==="booking" ? "📅 Book Appointment" : modalType==="message" ? "💬 Send Message" : modalType==="email" ? "📧 Send Email" : "📋 Submit Request"}
              </div>
              <button onClick={() => setModalType(null)} style={{ background: "#f0f4fa", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>

            {selectedBiz && <div style={{ background: "#f8fafc", borderRadius: 10, padding: "9px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{selectedBiz.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{selectedBiz.name}</span>
            </div>}

            {modalType === "booking" && <>
              <select value={bookingForm.service} onChange={e => setBookingForm(f => ({ ...f, service: e.target.value }))} style={{ ...selStyle, marginBottom: 10 }}>
                <option value="">Select a service</option>
                {selectedBiz?.services.map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="date" value={bookingForm.date} onChange={e => setBookingForm(f => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }} />
              <input type="time" value={bookingForm.time} onChange={e => setBookingForm(f => ({ ...f, time: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }} />
              <textarea placeholder="Special notes or requests..." value={bookingForm.notes} onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, height: 72, resize: "none", marginBottom: 18 }} />
              <button onClick={submitBooking} style={{ width: "100%", padding: 13, background: DARK, color: GOLD, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>CONFIRM BOOKING</button>
            </>}

            {modalType === "message" && <>
              <input placeholder="Subject" value={msgForm.subject} onChange={e => setMsgForm(f => ({ ...f, subject: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }} />
              <textarea placeholder="Write your message..." value={msgForm.message} onChange={e => setMsgForm(f => ({ ...f, message: e.target.value }))} style={{ ...inputStyle, height: 110, resize: "none", marginBottom: 18 }} />
              <button onClick={submitMessage} style={{ width: "100%", padding: 13, background: DARK, color: GOLD, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>SEND MESSAGE</button>
            </>}

            {modalType === "email" && <>
              <select value={emailForm.business} onChange={e => setEmailForm(f => ({ ...f, business: e.target.value }))} style={{ ...selStyle, marginBottom: 10 }}>
                {BUSINESSES.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </select>
              <input placeholder="Email Subject" value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }} />
              <textarea placeholder="Email body / message..." value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))} style={{ ...inputStyle, height: 130, resize: "none", marginBottom: 10 }} />
              <div style={{ background: "#f0f4fa", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "#5a7fa8" }}>
                📧 Sending to: <strong>{CONTACT_EMAIL}</strong>
              </div>
              <button onClick={submitEmail} style={{ width: "100%", padding: 13, background: DARK, color: GOLD, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>SEND EMAIL</button>
            </>}

            {modalType === "request" && <>
              <select value={requestForm.business} onChange={e => setRequestForm(f => ({ ...f, business: e.target.value }))} style={{ ...selStyle, marginBottom: 10 }}>
                {BUSINESSES.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </select>
              <input placeholder="Request Type (e.g. Loan Application, Quote...)" value={requestForm.type} onChange={e => setRequestForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }} />
              <textarea placeholder="Describe your request in detail..." value={requestForm.details} onChange={e => setRequestForm(f => ({ ...f, details: e.target.value }))} style={{ ...inputStyle, height: 110, resize: "none", marginBottom: 10 }} />
              <select value={requestForm.priority} onChange={e => setRequestForm(f => ({ ...f, priority: e.target.value }))} style={{ ...selStyle, marginBottom: 18 }}>
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🟠 High Priority</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
              <button onClick={submitRequest} style={{ width: "100%", padding: 13, background: DARK, color: GOLD, border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>SUBMIT REQUEST</button>
            </>}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg,${DARK} 0%,#1a3a5c 100%)`, padding: "18px 18px 22px", position: "sticky", top: 0, zIndex: 100 }}>
        {tab !== "profile" ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: GOLD, fontSize: 9, letterSpacing: 3, textTransform: "uppercase" }}>Alessandro Enterprises</div>
              <div style={{ color: "#fff", fontSize: 16, fontFamily: "Georgia, serif", fontWeight: 700 }}>
                {tab==="home" && `Hello, ${user?.name?.split(" ")[0]} 👋`}
                {tab==="services" && "Our Services"}
                {tab==="bookings" && "My Bookings"}
                {tab==="inbox" && "My Inbox"}
                {tab==="contact" && "Contact Us"}
              </div>
            </div>
            <div onClick={() => setTab("profile")} style={{ width: 38, height: 38, background: GOLD, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: DARK, fontWeight: 800, fontSize: 13, cursor: "pointer", overflow: "hidden", border: `2px solid ${GOLD}` }}>
              {profilePic ? <img src={profilePic} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user?.name?.split(" ").map(n => n[0]).join("")}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setTab("home")} style={{ background: "none", border: "none", color: GOLD, fontSize: 20, cursor: "pointer" }}>←</button>
            <div style={{ color: "#fff", fontSize: 16, fontFamily: "Georgia, serif", fontWeight: 700 }}>My Profile</div>
          </div>
        )}
      </div>

      {/* HOME */}
      {tab === "home" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Bookings", value: myBookings.length, icon: "📅", color: "#3b82f6" },
              { label: "Requests", value: myRequests.length, icon: "📋", color: GOLD },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "14px", boxShadow: "0 2px 10px #0001", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, background: s.color+"20", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
                <div><div style={{ fontSize: 22, fontWeight: 800, color: DARK }}>{s.value}</div><div style={{ fontSize: 11, color: "#8a9bb5" }}>{s.label}</div></div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { label: "New Booking", icon: "📅", action: () => { setSelectedBiz(BUSINESSES[0]); setModalType("booking"); } },
              { label: "Send Email", icon: "📧", action: () => setModalType("email") },
              { label: "Submit Request", icon: "📋", action: () => setModalType("request") },
              { label: "WhatsApp Us", icon: "💬", action: () => window.open(`https://wa.me/27${CONTACT_PHONE.substring(1)}`, "_blank") },
            ].map(a => (
              <button key={a.label} onClick={a.action} style={{ background: "#fff", border: "1px solid #e5eaf2", borderRadius: 12, padding: "14px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: DARK, boxShadow: "0 1px 6px #0001" }}>
                <span style={{ fontSize: 20 }}>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 10, fontFamily: "Georgia, serif" }}>Our Businesses</div>
          {BUSINESSES.map(biz => (
            <div key={biz.id} onClick={() => { setSelectedBiz(biz); setTab("bizDetail"); }} style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: "0 2px 10px #0001", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, borderLeft: `4px solid ${biz.color}` }}>
              <div style={{ width: 44, height: 44, background: biz.color+"15", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{biz.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{biz.name}</div>
                <div style={{ fontSize: 11, color: "#8a9bb5", marginTop: 1 }}>{biz.tagline}</div>
              </div>
              <div style={{ color: "#c0cdd8", fontSize: 18 }}>›</div>
            </div>
          ))}
        </div>
      )}

      {/* BIZ DETAIL */}
      {tab === "bizDetail" && selectedBiz && (
        <div>
          <div style={{ background: selectedBiz.color, padding: "18px 18px 28px" }}>
            <button onClick={() => setTab("home")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 20, cursor: "pointer", marginBottom: 10 }}>←</button>
            <div style={{ fontSize: 38, marginBottom: 8 }}>{selectedBiz.icon}</div>
            <div style={{ color: "#fff", fontSize: 19, fontFamily: "Georgia, serif", fontWeight: 700 }}>{selectedBiz.name}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 }}>{selectedBiz.description}</div>
          </div>
          <div style={{ padding: 16, marginTop: -10, background: "#f8fafc", borderRadius: "12px 12px 0 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
              {[
                { label: "Book", icon: "📅", action: () => setModalType("booking") },
                { label: "Message", icon: "💬", action: () => setModalType("message") },
                { label: "Request", icon: "📋", action: () => setModalType("request") },
              ].map(a => (
                <button key={a.label} onClick={a.action} style={{ padding: "11px 6px", background: a.label==="Book" ? DARK : "#fff", color: a.label==="Book" ? GOLD : DARK, border: `1px solid ${a.label==="Book"?DARK:"#e5eaf2"}`, borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 10 }}>Services</div>
            {selectedBiz.services.map(s => (
              <div key={s} onClick={() => { setBookingForm(f => ({ ...f, service: s })); setModalType("booking"); }} style={{ background: "#fff", borderRadius: 12, padding: "13px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", boxShadow: "0 1px 6px #0001" }}>
                <span style={{ fontSize: 13, color: DARK, fontWeight: 500 }}>{s}</span>
                <span style={{ color: selectedBiz.color, fontSize: 12, fontWeight: 600 }}>Book →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICES */}
      {tab === "services" && (
        <div style={{ padding: 16 }}>
          {BUSINESSES.map(biz => (
            <div key={biz.id} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{biz.icon}</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: DARK }}>{biz.name}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {biz.services.map(s => (
                  <span key={s} onClick={() => { setSelectedBiz(biz); setBookingForm(f => ({ ...f, service: s })); setModalType("booking"); }} style={{ background: "#fff", border: `1px solid ${biz.color}40`, borderRadius: 20, padding: "6px 12px", fontSize: 11, color: biz.color, fontWeight: 600, cursor: "pointer" }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOKINGS */}
      {tab === "bookings" && (
        <div style={{ padding: 16 }}>
          <button onClick={() => { setSelectedBiz(BUSINESSES[0]); setModalType("booking"); }} style={{ width: "100%", padding: 13, background: DARK, color: GOLD, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>+ New Booking</button>
          {myBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "#8a9bb5" }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>📅</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No bookings yet</div>
              <div style={{ fontSize: 12 }}>Browse our services and book an appointment</div>
            </div>
          ) : myBookings.map(b => {
            const biz = BUSINESSES.find(bz => bz.id === b.business);
            return (
              <div key={b.id} style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: "0 2px 10px #0001", borderLeft: `4px solid ${biz?.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{b.service}</div>
                  <span style={{ background: badgeBg(b.status), color: badgeClr(b.status), borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700, textTransform: "capitalize" }}>{b.status}</span>
                </div>
                <div style={{ fontSize: 11, color: "#8a9bb5", marginBottom: 3 }}>{biz?.icon} {biz?.name}</div>
                <div style={{ fontSize: 12, color: "#5a7fa8" }}>📅 {b.date} at {b.time}</div>
                {b.notes && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5, fontStyle: "italic" }}>"{b.notes}"</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* INBOX — Messages, Emails, Requests sub-tabs */}
      {tab === "inbox" && (
        <div style={{ padding: 16 }}>
          {/* Sub-tabs */}
          <div style={{ display: "flex", background: "#fff", borderRadius: 12, padding: 4, marginBottom: 16, boxShadow: "0 1px 8px #0001" }}>
            {[
              { id: "messages", label: "Messages", icon: "💬" },
              { id: "emails", label: "Emails", icon: "📧" },
              { id: "requests", label: "Requests", icon: "📋" },
            ].map(t => (
              <button key={t.id} onClick={() => setMsgSubTab(t.id)} style={{ flex: 1, padding: "8px 4px", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 11, fontWeight: 600, background: msgSubTab===t.id ? DARK : "transparent", color: msgSubTab===t.id ? GOLD : "#8a9bb5", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 15 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          {/* MESSAGES */}
          {msgSubTab === "messages" && (
            <>
              <button onClick={() => { setSelectedBiz(BUSINESSES[0]); setModalType("message"); }} style={{ width: "100%", padding: 12, background: DARK, color: GOLD, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>+ New Message</button>
              {myMessages.length === 0 ? <div style={{ textAlign: "center", padding: "40px 20px", color: "#8a9bb5" }}><div style={{ fontSize: 36, marginBottom: 8 }}>💬</div><div style={{ fontSize: 13, fontWeight: 600 }}>No messages yet</div></div>
              : myMessages.map(m => {
                const biz = BUSINESSES.find(b => b.id === m.business);
                return (
                  <div key={m.id} style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: "0 2px 8px #0001" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{m.subject}</span>
                      <span style={{ fontSize: 10, color: "#b0bec5" }}>{m.date}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#8a9bb5", marginBottom: 7 }}>{m.message}</div>
                    <span style={{ fontSize: 10, color: biz?.color, background: biz?.color+"15", padding: "2px 8px", borderRadius: 10 }}>{biz?.icon} {biz?.name.replace("Alessandro ","")}</span>
                  </div>
                );
              })}
            </>
          )}

          {/* EMAILS */}
          {msgSubTab === "emails" && (
            <>
              <button onClick={() => setModalType("email")} style={{ width: "100%", padding: 12, background: DARK, color: GOLD, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>+ New Email</button>
              {myEmails.length === 0 ? <div style={{ textAlign: "center", padding: "40px 20px", color: "#8a9bb5" }}><div style={{ fontSize: 36, marginBottom: 8 }}>📧</div><div style={{ fontSize: 13, fontWeight: 600 }}>No emails sent yet</div></div>
              : myEmails.map(e => {
                const biz = BUSINESSES.find(b => b.id === e.business);
                return (
                  <div key={e.id} style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: "0 2px 8px #0001" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{e.subject}</span>
                      <span style={{ fontSize: 10, color: "#b0bec5" }}>{e.date}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#8a9bb5", marginBottom: 7 }}>{e.body}</div>
                    <span style={{ fontSize: 10, color: biz?.color, background: biz?.color+"15", padding: "2px 8px", borderRadius: 10 }}>{biz?.icon} {biz?.name.replace("Alessandro ","")}</span>
                  </div>
                );
              })}
            </>
          )}

          {/* REQUESTS */}
          {msgSubTab === "requests" && (
            <>
              <button onClick={() => setModalType("request")} style={{ width: "100%", padding: 12, background: DARK, color: GOLD, border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>+ New Request</button>
              {myRequests.length === 0 ? <div style={{ textAlign: "center", padding: "40px 20px", color: "#8a9bb5" }}><div style={{ fontSize: 36, marginBottom: 8 }}>📋</div><div style={{ fontSize: 13, fontWeight: 600 }}>No requests yet</div></div>
              : myRequests.map(r => {
                const biz = BUSINESSES.find(b => b.id === r.business);
                return (
                  <div key={r.id} style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: "0 2px 8px #0001", borderLeft: `4px solid ${biz?.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{r.type}</span>
                      <span style={{ background: badgeBg(r.status), color: badgeClr(r.status), borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700, textTransform: "capitalize" }}>{r.status?.replace("-"," ")}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#8a9bb5", marginBottom: 6 }}>{r.details}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: biz?.color, background: biz?.color+"15", padding: "2px 8px", borderRadius: 10 }}>{biz?.icon} {biz?.name.replace("Alessandro ","")}</span>
                      <span style={{ fontSize: 10, color: "#b0bec5" }}>{r.date}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* CONTACT */}
      {tab === "contact" && (
        <div style={{ padding: 16 }}>
          <div style={{ background: `linear-gradient(135deg,${DARK},#1a3a5c)`, borderRadius: 18, padding: 24, textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>🏢</div>
            <div style={{ color: GOLD, fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>Alessandro</div>
            <div style={{ color: "#fff", fontSize: 20, fontFamily: "Georgia, serif", fontWeight: 700 }}>Enterprises</div>
            <div style={{ color: "#7a9cc0", fontSize: 11, marginTop: 4 }}>Your Trusted Business Partner</div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 14, boxShadow: "0 2px 10px #0001" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 16 }}>Get In Touch</div>
            {[
              { icon: "📧", label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, bg: "#eff6ff", color: "#1d4ed8" },
              { icon: "📞", label: "Phone", value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}`, bg: "#f0fdf4", color: "#15803d" },
            ].map(c => (
              <a key={c.label} href={c.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid #f0f4fa", textDecoration: "none" }}>
                <div style={{ width: 42, height: 42, background: c.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#8a9bb5", marginBottom: 1 }}>{c.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.color }}>{c.value}</div>
                </div>
                <span style={{ color: "#c0cdd8" }}>›</span>
              </a>
            ))}
            {/* WhatsApp Button */}
            <a href={`https://wa.me/27${CONTACT_PHONE.substring(1)}?text=Hello%20Alessandro%20Enterprises%2C%20I%20would%20like%20to%20enquire%20about%20your%20services.`} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", textDecoration: "none" }}>
              <div style={{ width: 42, height: 42, background: "#25D366", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>💬</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#8a9bb5", marginBottom: 1 }}>WhatsApp</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#25D366" }}>{CONTACT_PHONE}</div>
              </div>
              <span style={{ color: "#c0cdd8" }}>›</span>
            </a>
          </div>

          {/* WhatsApp big button */}
          <a href={`https://wa.me/27${CONTACT_PHONE.substring(1)}?text=Hello%20Alessandro%20Enterprises!`} target="_blank" rel="noreferrer"
            style={{ display: "block", background: "#25D366", color: "#fff", borderRadius: 14, padding: "16px", textAlign: "center", textDecoration: "none", fontWeight: 700, fontSize: 15, marginBottom: 12, boxShadow: "0 4px 16px #25D36640" }}>
            💬 Chat on WhatsApp
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ display: "block", background: DARK, color: GOLD, borderRadius: 14, padding: "14px", textAlign: "center", textDecoration: "none", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
            📧 Send an Email
          </a>
          <a href={`tel:${CONTACT_PHONE}`} style={{ display: "block", background: "#fff", color: DARK, border: "1px solid #e5eaf2", borderRadius: 14, padding: "14px", textAlign: "center", textDecoration: "none", fontWeight: 700, fontSize: 14, boxShadow: "0 2px 8px #0001" }}>
            📞 Call Us
          </a>

          <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginTop: 14, boxShadow: "0 2px 10px #0001" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>Our Businesses</div>
            {BUSINESSES.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f4fa" }}>
                <span style={{ fontSize: 18 }}>{b.icon}</span>
                <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE */}
      {tab === "profile" && (
        <div style={{ padding: 16 }}>
          {/* Profile Card */}
          <div style={{ background: `linear-gradient(135deg,${DARK},#1a3a5c)`, borderRadius: 20, padding: "28px 20px 22px", textAlign: "center", marginBottom: 16, boxShadow: "0 4px 20px #0003" }}>
            {/* Profile picture */}
            <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 14px" }}>
              <div style={{ width: 90, height: 90, borderRadius: "50%", background: GOLD, border: `3px solid ${GOLD}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: DARK, fontWeight: 800, fontSize: 28 }}>
                {profilePic
                  ? <img src={profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : user?.name?.split(" ").map(n => n[0]).join("")}
              </div>
              {/* Camera button */}
              <label style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, background: GOLD, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff", fontSize: 14 }}>
                📷
                <input type="file" accept="image/*" onChange={handleProfilePic} style={{ display: "none" }} />
              </label>
            </div>
            <div style={{ color: "#7a9cc0", fontSize: 10, letterSpacing: 2, marginBottom: 2 }}>TAP 📷 TO CHANGE PHOTO</div>
            {editingProfile ? (
              <div style={{ marginTop: 10 }}>
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, marginBottom: 8, boxSizing: "border-box", outline: "none", textAlign: "center" }} />
                <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone Number"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(201,168,76,0.4)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, marginBottom: 12, boxSizing: "border-box", outline: "none", textAlign: "center" }} />
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button onClick={saveProfile} style={{ padding: "8px 20px", background: GOLD, color: DARK, border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
                  <button onClick={() => setEditingProfile(false)} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ color: "#fff", fontSize: 20, fontFamily: "Georgia, serif", fontWeight: 700 }}>{user?.name}</div>
                <div style={{ color: "#7a9cc0", fontSize: 12, marginTop: 3 }}>{user?.email}</div>
                <div style={{ color: "#7a9cc0", fontSize: 12 }}>{user?.phone}</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                  <span style={{ background: "#d1fae5", color: "#065f46", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>✓ Active Member</span>
                  <button onClick={() => { setEditingProfile(true); setEditForm({ name: user?.name || "", phone: user?.phone || "" }); }}
                    style={{ background: "rgba(201,168,76,0.2)", color: GOLD, border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✏️ Edit</button>
                </div>
              </>
            )}
          </div>

          {/* Activity */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 2px 12px #0001", marginBottom: 14 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>My Activity</div>
            {[
              { label: "Bookings", value: myBookings.length, icon: "📅" },
              { label: "Messages", value: myMessages.length, icon: "💬" },
              { label: "Emails", value: myEmails.length, icon: "📧" },
              { label: "Requests", value: myRequests.length, icon: "📋" },
              { label: "Member Since", value: user?.joined || "2026", icon: "📆" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0f4fa" }}>
                <span style={{ fontSize: 13, color: "#5a7fa8" }}>{item.icon} {item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Account info */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 2px 12px #0001", marginBottom: 14 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>Account Details</div>
            {[
              { label: "Email", value: user?.email, icon: "📧" },
              { label: "Phone", value: user?.phone, icon: "📞" },
              { label: "Customer ID", value: `#AE-${user?.id?.toString().slice(-5)}`, icon: "🪪" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0f4fa" }}>
                <span style={{ fontSize: 12, color: "#8a9bb5" }}>{item.icon} {item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{item.value}</span>
              </div>
            ))}
          </div>

          <button onClick={() => { setUser(null); setScreen("login"); setLoginForm({ email:"",password:"",name:"",phone:"",isRegister:false }); setProfilePic(null); }}
            style={{ width: "100%", padding: 13, background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      )}

      {/* BOTTOM NAV */}
      {tab !== "bizDetail" && (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", borderTop: "1px solid #e5eaf2", display: "flex", zIndex: 100, boxShadow: "0 -2px 12px #0001" }}>
          {[
            { id: "home", icon: "🏠", label: "Home" },
            { id: "services", icon: "🛎️", label: "Services" },
            { id: "bookings", icon: "📅", label: "Bookings" },
            { id: "inbox", icon: "✉️", label: "Inbox", badge: myMessages.length + myEmails.length + myRequests.length },
            { id: "contact", icon: "📞", label: "Contact" },
          ].map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, padding: "10px 0 6px", border: "none", background: "none", cursor: "pointer", color: tab===n.id ? GOLD : "#9ca3af", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>
              <span style={{ fontSize: 17 }}>{n.icon}</span>
              <span style={{ fontSize: 9, fontWeight: tab===n.id ? 700 : 400 }}>{n.label}</span>
              {tab===n.id && <div style={{ width: 14, height: 2, background: GOLD, borderRadius: 1 }} />}
              {n.badge > 0 && tab !== n.id && <div style={{ position: "absolute", top: 6, right: "18%", background: "#ef4444", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{n.badge}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
