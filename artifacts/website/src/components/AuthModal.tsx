import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { X, Phone, User as UserIcon, KeyRound, ArrowRight, RefreshCw } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login } = useAuth();
  const { isRTL } = useLanguage();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = (import.meta.env.VITE_API_URL as string) ?? "";

  const sendOtp = async () => {
    setError("");
    const trimmed = phone.trim();
    if (!trimmed || trimmed.length < 8) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send code");
      setDemoOtp(data.otp ?? "");
      setStep("otp");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (otp.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true);
    try {
      const body: Record<string, string> = { phone: phone.trim(), otp };
      if (name.trim()) body.name = name.trim();
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code");
      login(data.token, {
        id: data.user?.id,
        name: data.user?.name ?? name,
        phone: data.user?.phone ?? phone,
        email: data.user?.email,
        loyaltyPoints: data.user?.loyaltyPoints ?? 0,
      });
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 22, padding: "36px 32px", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(13,45,68,0.18)", direction: isRTL ? "rtl" : "ltr" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Sea Gull"
              style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--dark)", marginBottom: 2, lineHeight: 1.2 }}>
                {step === "phone" ? "Welcome to Sea Gull" : "Verify your number"}
              </h2>
              <p style={{ color: "var(--gray-500)", fontSize: 13 }}>
                {step === "phone" ? "Sign in with your phone number" : `Code sent to ${phone.trim()}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: 9, background: "var(--gray-100)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-500)", flexShrink: 0, marginInlineStart: 8 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 13, marginBottom: 18 }}>
            {error}
          </div>
        )}

        {/* Step 1: Phone */}
        {step === "phone" && (
          <div>
            <label style={{ display: "block", color: "var(--gray-700)", fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
              Phone Number
            </label>
            <div className="sg-input-wrap">
              <Phone size={15} className="icon" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 000 0000"
                type="tel"
                className="sg-input"
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                autoFocus
              />
            </div>
            <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 10, lineHeight: 1.5 }}>
              We'll send a 6-digit verification code to this number.
            </p>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="sg-btn sg-btn-primary"
              style={{ width: "100%", marginTop: 20, justifyContent: "center", fontSize: 15, padding: "14px", borderRadius: 12, opacity: loading ? 0.8 : 1, gap: 8 }}
            >
              {loading
                ? <span className="sg-spinner sg-spinner-white" style={{ width: 18, height: 18, borderWidth: 2.5 }} />
                : <ArrowRight size={16} />}
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <div>
            {/* Demo OTP hint */}
            {demoOtp && (
              <div style={{ background: "var(--primary-light)", border: "1px solid rgba(11,126,164,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <KeyRound size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Demo Mode — Your code:</p>
                  <p style={{ fontSize: 26, fontWeight: 900, color: "var(--dark)", letterSpacing: "6px", fontFamily: "monospace", lineHeight: 1 }}>{demoOtp}</p>
                </div>
              </div>
            )}

            {/* Name (optional, for new users) */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "var(--gray-700)", fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
                Your Name <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(new customers)</span>
              </label>
              <div className="sg-input-wrap">
                <UserIcon size={15} className="icon" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="sg-input"
                />
              </div>
            </div>

            <label style={{ display: "block", color: "var(--gray-700)", fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
              Verification Code
            </label>
            <input
              value={otp}
              onChange={handleOtpChange}
              placeholder="· · · · · ·"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
              style={{
                width: "100%", boxSizing: "border-box",
                fontSize: 28, fontWeight: 800, letterSpacing: "10px",
                textAlign: "center", fontFamily: "monospace",
                border: "2px solid var(--border)", borderRadius: 14,
                padding: "16px 20px", outline: "none", color: "var(--dark)",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--primary)"; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="sg-btn sg-btn-primary"
              style={{ width: "100%", marginTop: 20, justifyContent: "center", fontSize: 15, padding: "14px", borderRadius: 12, opacity: loading ? 0.8 : 1 }}
            >
              {loading && <span className="sg-spinner sg-spinner-white" style={{ width: 18, height: 18, borderWidth: 2.5 }} />}
              {loading ? "Verifying..." : "Sign In"}
            </button>

            <button
              onClick={() => { setStep("phone"); setOtp(""); setError(""); setDemoOtp(""); setName(""); }}
              style={{ width: "100%", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "none", border: "none", color: "var(--gray-500)", fontSize: 13, cursor: "pointer", padding: "8px" }}
            >
              <RefreshCw size={13} /> Change phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
