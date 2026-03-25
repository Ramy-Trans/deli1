import { useState } from "react";
import { riderFetch, setRiderToken } from "@/lib/api";
import { Phone, KeyRound, AlertTriangle, LogIn } from "lucide-react";

export default function RiderLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await riderFetch("/api/rider/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
        headers: { Authorization: "" },
      });
      setRiderToken(data.token, { rider: data.rider, user: data.user });
      window.location.reload();
    } catch (err: any) {
      setError(err.message ?? "Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #060f1f 0%, #0a1628 40%, #0e2040 100%)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 320,
        background: "linear-gradient(135deg, #0A1628 0%, #1A5A30 60%, #22C55E 100%)",
        borderRadius: "0 0 48px 48px", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(34,197,94,0.2) 0%, transparent 60%)",
        }} />
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: "max(40px, 10vh)", gap: 14, paddingLeft: 16, paddingRight: 16,
      }}>
        <div style={{
          width: "clamp(80px, 20vw, 100px)", height: "clamp(80px, 20vw, 100px)", borderRadius: 32,
          background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)",
          border: "2px solid rgba(34,197,94,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)", overflow: "hidden",
        }}>
          <img src="/admin/logo.png" alt="Seagull" style={{ width: "70%", height: "70%", objectFit: "contain" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "clamp(22px, 6vw, 28px)", fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>Rider Portal</div>
          <div style={{ fontSize: "clamp(12px, 3vw, 13px)", color: "rgba(255,255,255,0.55)", marginTop: 4, maxWidth: "90vw" }}>Sea Gull Restaurant · Delivery</div>
        </div>
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        margin: "clamp(16px, 6vw, 32px) clamp(16px, 5vw, 20px) 0",
        maxWidth: "420px", width: "100%", alignSelf: "center",
        background: "rgba(22, 34, 54, 0.95)", borderRadius: 24,
        padding: "clamp(20px, 5vw, 28px) clamp(16px, 4vw, 24px) clamp(24px, 5vw, 32px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 0.8, marginBottom: 8, textTransform: "uppercase" }}>
              Phone Number
            </label>
            <div style={{ position: "relative" }}>
              <Phone size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+20XXXXXXXXXX"
                autoComplete="username"
                required
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 14, padding: "14px 16px 14px 44px",
                  color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit",
                }}
                onFocus={e => { e.target.style.borderColor = "#22C55E"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 0.8, marginBottom: 8, textTransform: "uppercase" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <KeyRound size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 14, padding: "14px 16px 14px 44px",
                  color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit",
                }}
                onFocus={e => { e.target.style.borderColor = "#22C55E"; }}
                onBlur={e => { e.target.style.borderColor = error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"; }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10, padding: "10px 14px",
            }}>
              <AlertTriangle size={16} color="#f87171" />
              <span style={{ color: "#f87171", fontSize: 13 }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !phone}
            style={{
              background: loading || !password || !phone
                ? "rgba(34,197,94,0.3)"
                : "linear-gradient(135deg, #22C55E, #16A34A)",
              color: loading || !password || !phone ? "rgba(34,197,94,0.6)" : "#fff",
              fontWeight: 800, border: "none", borderRadius: 14,
              padding: "15px 24px", fontSize: 15,
              cursor: loading || !password || !phone ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
              boxShadow: !loading && password ? "0 4px 20px rgba(34,197,94,0.3)" : "none",
              marginTop: 4,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  display: "inline-block", width: 16, height: 16,
                  border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                }} />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={17} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 16, marginTop: 16,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
            Managing the restaurant?
          </div>
          <a
            href="/admin/"
            style={{
              color: "#D4AF37", textDecoration: "none", fontSize: 14, fontWeight: 600,
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(212,175,55,0.3)",
              display: "inline-block", cursor: "pointer", transition: "all 0.2s",
              background: "rgba(212,175,55,0.08)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(212,175,55,0.15)";
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.6)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(212,175,55,0.08)";
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)";
            }}
          >
            Sign in as Admin
          </a>
        </div>
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        margin: "16px 20px 0",
        background: "rgba(34,197,94,0.07)", borderRadius: 14,
        padding: "12px 16px", border: "1px solid rgba(34,197,94,0.15)",
      }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
          Contact your admin to get your phone number and password for this portal.
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          body { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
