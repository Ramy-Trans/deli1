import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiFetch } from "@/lib/api";
import BottomTabs from "@/components/BottomTabs";
import {
  Package, ChefHat, Bike, Users, ClipboardList, LogOut, ChevronRight, TrendingUp,
} from "lucide-react";

interface Stats {
  totalOrders: number; todayOrders: number; todayRevenue: number;
  availableRiders: number; deliveringRiders: number; totalRiders: number;
}

export default function DashboardPage() {
  const [, setLoc] = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => apiFetch("/api/admin/stats").then(setStats).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  const branchName = localStorage.getItem("admin_branch_name");
  const isBranchAdmin = !!localStorage.getItem("admin_branch_id");

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_branch_id");
    localStorage.removeItem("admin_branch_name");
    window.location.reload();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", display: "flex", flexDirection: "column" }}>
      <div style={{
        background: "linear-gradient(135deg, #0A1628 0%, #1A6FA8 80%, #0FBCD4 100%)",
        padding: "52px 20px 24px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(212,175,55,0.08)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(15,188,212,0.08)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(212,175,55,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}>
              <img src="/admin/logo.png" alt="Seagull" style={{ width: 34, height: 34, objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>Seagull Admin</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
                {branchName ? `📍 ${branchName}` : "All Branches"}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 20, padding: "6px 14px", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </div>

      <div className="page" style={{ padding: "16px 14px 0" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 100%)",
              border: "1px solid rgba(212,175,55,0.3)",
              borderRadius: 20, padding: "20px 20px 18px", marginBottom: 12,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", right: 12, top: 12, opacity: 0.08 }}>
                <TrendingUp size={72} color="#D4AF37" />
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#D4AF37", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Today's Performance</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
                    EGP <span style={{ color: "#D4AF37" }}>{(stats?.todayRevenue ?? 0).toFixed(0)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>Revenue today</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#0FBCD4" }}>{stats?.todayOrders ?? 0}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Orders today</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <StatCard icon={Package} label="Total Orders" value={stats?.totalOrders ?? 0} color="#3B82F6" />
              <StatCard icon={ChefHat} label="Available Riders" value={stats?.availableRiders ?? 0} color="#22C55E" />
              <StatCard icon={Bike} label="Delivering Now" value={stats?.deliveringRiders ?? 0} color="#F97316" />
              <StatCard icon={Users} label="Total Riders" value={stats?.totalRiders ?? 0} color="#0FBCD4" />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>Quick Access</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <QuickCard
                icon={ClipboardList} label="Manage Orders" desc="Update status, assign riders"
                accent="#3B82F6" onClick={() => setLoc("/orders")}
              />
              <QuickCard
                icon={Bike} label="Manage Riders" desc="Add agents, track availability"
                accent="#22C55E" onClick={() => setLoc("/riders")}
              />
            </div>
          </>
        )}
      </div>
      <BottomTabs />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "#162236", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: "16px 14px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", right: 10, top: 10, opacity: 0.06 }}>
        <Icon size={40} color={color} />
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</div>
      <div style={{ height: 3, borderRadius: 2, background: color, marginTop: 12, width: "60%", opacity: 0.7 }} />
    </div>
  );
}

function QuickCard({ icon: Icon, label, desc, accent, onClick }: { icon: any; label: string; desc: string; accent: string; onClick: () => void }) {
  return (
    <div
      className="press-item"
      onClick={onClick}
      style={{ background: "#162236", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: accent + "18", border: `1.5px solid ${accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={24} color={accent} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{label}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{desc}</div>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: accent + "18", border: `1px solid ${accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent,
      }}>
        <ChevronRight size={18} />
      </div>
    </div>
  );
}
