import { useEffect, useState } from "react";
import { apiFetch, getRiderDashboardUrl } from "@/lib/api";
import BottomTabs from "@/components/BottomTabs";
import {
  Bike, Link, Copy, Check, Star, ShieldCheck, Trash2, ChevronRight,
  Plus, KeyRound, AlertCircle, MapPin,
} from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  offline: "#6B7280", available: "#22C55E", busy: "#F97316",
};
const STATUS_LABEL: Record<string, string> = {
  offline: "Offline", available: "Available", busy: "Busy",
};
const STATUSES = ["available", "busy", "offline"];

function StatusDot({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "#6B7280";
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

const INITIAL = { name: "", phone: "", vehicleType: "motorcycle", vehiclePlate: "", loginPassword: "", branchId: "" };

export default function RidersPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [pwReset, setPwReset] = useState<{ id: number; pw: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  const isSuperAdmin = !localStorage.getItem("admin_branch_id");

  const load = () => apiFetch("/api/admin/riders")
    .then(setRiders).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => {
    load();
    if (isSuperAdmin) {
      apiFetch("/api/branches").then(setBranches).catch(() => {});
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setSaving(true);
    try {
      const payload: any = { ...form };
      if (payload.branchId) payload.branchId = Number(payload.branchId);
      else delete payload.branchId;
      await apiFetch("/api/admin/riders", { method: "POST", body: JSON.stringify(payload) });
      setForm(INITIAL); setShowCreate(false); load();
    } catch (err: any) { setFormError(err.message); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this rider?")) return;
    await apiFetch(`/api/admin/riders/${id}`, { method: "DELETE" }).catch(() => {});
    load();
  };

  const handleStatus = async (id: number, status: string) => {
    await apiFetch(`/api/admin/riders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }).catch(() => {});
    load(); setExpandedId(null);
  };

  const handleResetPassword = async () => {
    if (!pwReset || !pwReset.pw || pwReset.pw.length < 4) return;
    setPwSaving(true);
    try {
      await apiFetch(`/api/admin/riders/${pwReset.id}/password`, { method: "PATCH", body: JSON.stringify({ password: pwReset.pw }) });
      setPwReset(null);
    } catch {}
    setPwSaving(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getRiderDashboardUrl()).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const available = riders.filter(r => r.status === "available").length;
  const busy = riders.filter(r => r.status === "busy").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg, #0A1628 0%, #1A6FA8 100%)", padding: "52px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>Riders</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              {available} available · {busy} delivering
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: "linear-gradient(135deg, #D4AF37, #F0D060)",
              color: "#0A1628", fontWeight: 800, border: "none",
              borderRadius: 20, padding: "8px 18px", fontSize: 13, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(212,175,55,0.35)",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Plus size={15} />
            Add Rider
          </button>
        </div>

        <div style={{
          background: "rgba(15,188,212,0.08)", border: "1px solid rgba(15,188,212,0.2)",
          borderRadius: 14, padding: "12px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Link size={20} color="#0FBCD4" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0FBCD4", letterSpacing: 0.5, marginBottom: 3 }}>RIDER PORTAL LINK</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {getRiderDashboardUrl()}
            </div>
          </div>
          <button
            onClick={copyLink}
            style={{
              background: copied ? "rgba(34,197,94,0.2)" : "rgba(15,188,212,0.15)",
              border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(15,188,212,0.25)"}`,
              borderRadius: 10, padding: "6px 12px",
              color: copied ? "#22C55E" : "#0FBCD4",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              flexShrink: 0, transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="page" style={{ padding: "14px 12px 0" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><div className="spinner" /></div>
        ) : riders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Bike size={56} color="rgba(255,255,255,0.15)" style={{ margin: "0 auto 12px" }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>No Riders Yet</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Tap "+ Add Rider" to add delivery agents</div>
          </div>
        ) : (
          riders.map(rider => (
            <RiderCard
              key={rider.id} rider={rider}
              showBranch={isSuperAdmin}
              expanded={expandedId === rider.id}
              onToggle={() => setExpandedId(expandedId === rider.id ? null : rider.id)}
              onStatus={(s: string) => handleStatus(rider.id, s)}
              onDelete={() => handleDelete(rider.id)}
              onResetPw={() => setPwReset({ id: rider.id, pw: "" })}
            />
          ))
        )}
      </div>

      {/* Create sheet */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => { setShowCreate(false); setFormError(""); }}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bike size={20} color="#22C55E" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Add New Rider</div>
            </div>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Full Name *", key: "name", placeholder: "Ahmed Mohamed", type: "text" },
                { label: "Phone Number *", key: "phone", placeholder: "+201234567890", type: "tel" },
                { label: "Vehicle Plate", key: "vehiclePlate", placeholder: "ABC 1234", type: "text" },
              ].map(field => (
                <div key={field.key}>
                  <label className="form-label">{field.label}</label>
                  <input
                    type={field.type}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="input"
                    required={field.label.includes("*")}
                  />
                </div>
              ))}
              <div>
                <label className="form-label">Vehicle Type</label>
                <select value={form.vehicleType} onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}
                  className="input" style={{ appearance: "none" }}>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="car">Car</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>
              {isSuperAdmin && (
                <div>
                  <label className="form-label">Assign to Branch</label>
                  <select value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}
                    className="input" style={{ appearance: "none" }}>
                    <option value="">No branch (unassigned)</option>
                    {branches.filter(b => b.isActive).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="form-label">Portal Password (rider login)</label>
                <input
                  type="text"
                  value={form.loginPassword}
                  onChange={e => setForm(f => ({ ...f, loginPassword: e.target.value }))}
                  placeholder="Set a password for rider portal"
                  className="input"
                />
              </div>
              {formError && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", color: "#f87171", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={14} />
                  {formError}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn-outline" onClick={() => { setShowCreate(false); setFormError(""); }}>Cancel</button>
                <button type="submit" className="btn-gold" disabled={saving}>{saving ? "Creating..." : "Create Rider"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {pwReset && (
        <div className="modal-overlay" onClick={() => setPwReset(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <KeyRound size={20} color="#D4AF37" />
              <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Reset Portal Password</div>
            </div>
            <input
              type="text"
              value={pwReset.pw}
              onChange={e => setPwReset((r: { id: number; pw: string } | null) => r ? { ...r, pw: e.target.value } : r)}
              placeholder="New password (min 4 characters)"
              className="input"
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-outline" onClick={() => setPwReset(null)}>Cancel</button>
              <button className="btn-gold" disabled={pwSaving || !pwReset.pw || pwReset.pw.length < 4} onClick={handleResetPassword}>
                {pwSaving ? "Saving..." : "Save Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomTabs />
    </div>
  );
}

function RiderCard({ rider, expanded, onToggle, onStatus, onDelete, onResetPw, showBranch }: any) {
  const color = STATUS_COLOR[rider.status] ?? "#6B7280";
  const initial = rider.user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div style={{ marginBottom: 10, background: "#162236", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden" }}>
      <div className="press-item" onClick={onToggle} style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 16,
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            border: `2px solid ${color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>{initial}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{rider.user?.name ?? "Unknown"}</span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 20,
                background: color + "18", color, fontSize: 10, fontWeight: 700,
              }}>
                <StatusDot status={rider.status} />
                {STATUS_LABEL[rider.status] ?? rider.status}
              </span>
              {showBranch && rider.branch && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  padding: "2px 7px", borderRadius: 20,
                  background: "rgba(15,188,212,0.12)", color: "#0FBCD4",
                  fontSize: 10, fontWeight: 600,
                }}>
                  <MapPin size={9} />
                  {rider.branch.name}
                </span>
              )}
              {showBranch && !rider.branch && (
                <span style={{
                  padding: "2px 7px", borderRadius: 20,
                  background: "rgba(107,114,128,0.15)", color: "#6B7280",
                  fontSize: 10, fontWeight: 600,
                }}>
                  Unassigned
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              {rider.user?.phone ?? ""} · {rider.vehicleType}{rider.vehiclePlate ? ` · ${rider.vehiclePlate}` : ""}
            </div>
          </div>

          <ChevronRight
            size={18}
            color="rgba(255,255,255,0.25)"
            style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
          />
        </div>
      </div>

      {expanded && (
        <div onClick={e => e.stopPropagation()} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px 16px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <StatMini value={rider.totalDeliveries ?? 0} label="Deliveries" />
            <StatMiniRating value={rider.rating ?? "5.0"} />
            <StatMiniVerified verified={rider.isVerified} />
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>Change Status</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => onStatus(s)}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 12,
                  border: `1.5px solid ${s === rider.status ? STATUS_COLOR[s] : "rgba(255,255,255,0.1)"}`,
                  background: s === rider.status ? STATUS_COLOR[s] + "22" : "transparent",
                  color: s === rider.status ? STATUS_COLOR[s] : "rgba(255,255,255,0.4)",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                }}
              >
                <StatusDot status={s} />
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onResetPw}
              style={{
                flex: 1, background: "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37",
                borderRadius: 12, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <KeyRound size={14} />
              Set Password
            </button>
            <button
              onClick={onDelete}
              style={{
                flex: 1, background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)", color: "#f87171",
                borderRadius: 12, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatMini({ value, label }: { value: any; label: string }) {
  return (
    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{value}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function StatMiniRating({ value }: { value: string }) {
  return (
    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <Star size={14} fill="#D4AF37" /> {value}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Rating</div>
    </div>
  );
}

function StatMiniVerified({ verified }: { verified: boolean }) {
  return (
    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: verified ? "#22C55E" : "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {verified ? <ShieldCheck size={20} color="#22C55E" /> : <span style={{ fontSize: 16 }}>–</span>}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Verified</div>
    </div>
  );
}
