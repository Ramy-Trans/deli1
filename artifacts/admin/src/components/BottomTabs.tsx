import { useLocation } from "wouter";
import { LayoutDashboard, ClipboardList, Bike, Tag } from "lucide-react";

const TABS = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/orders", icon: ClipboardList, label: "Orders" },
  { path: "/riders", icon: Bike, label: "Riders" },
  { path: "/promo-codes", icon: Tag, label: "Promos" },
];

export default function BottomTabs() {
  const [loc, setLoc] = useLocation();
  const active = loc === "/" ? "/" : TABS.find(t => t.path !== "/" && loc.startsWith(t.path))?.path ?? "/";

  return (
    <div className="tab-bar">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.path;
        return (
          <button
            key={tab.path}
            className={`tab-item ${isActive ? "active" : ""}`}
            onClick={() => setLoc(tab.path)}
            style={{ color: isActive ? "var(--gold)" : "var(--text-muted)" }}
          >
            <span className="tab-icon">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            </span>
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
