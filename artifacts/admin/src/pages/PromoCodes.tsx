import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import BottomTabs from "@/components/BottomTabs";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";

interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed" | "free_delivery";
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscount: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  percentage: "#8B5CF6",
  fixed: "#3B82F6",
  free_delivery: "#22C55E",
};

const TYPE_LABELS: Record<string, string> = {
  percentage: "% Off",
  fixed: "Fixed EGP",
  free_delivery: "Free Delivery",
};

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "percentage" as Coupon["discountType"],
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
};

export default function PromoCodesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () =>
    apiFetch("/api/admin/coupons")
      .then(setCoupons)
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(""); setShowModal(true); };

  const handleSave = async () => {
    setFormError("");
    if (!form.code.trim()) { setFormError("Code is required"); return; }
    if (!form.discountValue || isNaN(Number(form.discountValue))) { setFormError("Valid discount value required"); return; }
    setSaving(true);
    try {
      await apiFetch("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          description: form.description || null,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      setShowModal(false);
      load();
    } catch (e: any) {
      setFormError(e.message ?? "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      const updated = await apiFetch(`/api/admin/coupons/${c.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: updated.isActive } : x)));
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch {}
    setDeleteId(null);
  };

  const getValueLabel = (c: Coupon) => {
    if (c.discountType === "percentage") return `${c.discountValue}% off`;
    if (c.discountType === "fixed") return `EGP ${c.discountValue} off`;
    return "Free delivery";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg, #0A1628 0%, #1A6FA8 80%, #0FBCD4 100%)", padding: "52px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(212,175,55,0.08)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(212,175,55,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Tag size={22} color="#D4AF37" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Promo Codes</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>{coupons.length} coupon{coupons.length !== 1 ? "s" : ""}</div>
          </div>
          <button
            onClick={openCreate}
            style={{ marginLeft: "auto", background: "#D4AF37", border: "none", borderRadius: 12, padding: "9px 18px", color: "#0A1628", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} /> New Code
          </button>
        </div>
      </div>

      <div className="page" style={{ padding: "16px 14px 80px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <div className="spinner" />
          </div>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", marginTop: 60 }}>
            <Tag size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>No promo codes yet.</p>
            <button onClick={openCreate} style={{ marginTop: 8, background: "#D4AF37", border: "none", borderRadius: 10, padding: "10px 24px", color: "#0A1628", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Create First Code</button>
          </div>
        ) : (
          coupons.map((c) => {
            const col = TYPE_COLORS[c.discountType] ?? "#3B82F6";
            return (
              <div key={c.id} style={{ background: "#0F2437", borderRadius: 16, border: `1.5px solid ${c.isActive ? col + "60" : "rgba(255,255,255,0.08)"}`, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ background: col + "20", borderRadius: 10, padding: "6px 12px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 70 }}>
                    <span style={{ color: col, fontSize: 15, fontWeight: 800 }}>{getValueLabel(c).split(" ")[0]}</span>
                    <span style={{ color: col, fontSize: 10, opacity: 0.8 }}>{TYPE_LABELS[c.discountType]}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>{c.code}</span>
                      {!c.isActive && <span style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 7px" }}>INACTIVE</span>}
                    </div>
                    {c.description && <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>{c.description}</div>}
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 4 }}>
                      {c.minOrderAmount ? `Min EGP ${c.minOrderAmount}` : "No minimum"}
                      {c.expiresAt ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                      {" · "}Used {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}x
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      onClick={() => toggleActive(c)}
                      title={c.isActive ? "Deactivate" : "Activate"}
                      style={{ background: "none", border: "none", cursor: "pointer", color: c.isActive ? "#22C55E" : "rgba(255,255,255,0.3)", padding: 4 }}
                    >
                      {c.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      title="Delete"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", opacity: 0.7, padding: 4 }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#0F2437", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>New Promo Code</span>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}><X size={20} /></button>
            </div>

            {formError && <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 10, padding: "10px 14px", color: "#EF4444", fontSize: 13, marginBottom: 14 }}>{formError}</div>}

            {[
              { label: "Code *", key: "code", placeholder: "e.g. SUMMER20", type: "text" },
              { label: "Description", key: "description", placeholder: "What does this code offer?", type: "text" },
              { label: "Discount Value *", key: "discountValue", placeholder: "e.g. 20", type: "number" },
              { label: "Min. Order Amount (EGP)", key: "minOrderAmount", placeholder: "e.g. 100", type: "number" },
              { label: "Max Discount Cap (EGP)", key: "maxDiscount", placeholder: "Leave blank for no cap", type: "number" },
              { label: "Usage Limit (total)", key: "usageLimit", placeholder: "Leave blank for unlimited", type: "number" },
              { label: "Expires At", key: "expiresAt", placeholder: "", type: "date" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={(e) => { setFormError(""); setForm((p) => ({ ...p, [f.key]: e.target.value })); }}
                  style={{ width: "100%", background: "#0A1628", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Discount Type *</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as any }))}
                style={{ width: "100%", background: "#0A1628", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14 }}
              >
                <option value="percentage">Percentage Off</option>
                <option value="fixed">Fixed EGP Amount</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ width: "100%", background: "#D4AF37", border: "none", borderRadius: 12, padding: "14px", color: "#0A1628", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Creating..." : "Create Promo Code"}
            </button>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0F2437", borderRadius: 18, padding: 24, maxWidth: 320, width: "100%", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Delete Coupon?</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 20 }}>This action cannot be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 12, color: "#fff", fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId!)} style={{ flex: 1, background: "rgba(239,68,68,0.8)", border: "none", borderRadius: 10, padding: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <BottomTabs />
    </div>
  );
}
