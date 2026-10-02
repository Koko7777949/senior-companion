import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, Clock, Users, AlertTriangle, Activity, Menu, X,
  PhoneCall, User, FileBarChart2, Heart,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTriggerAlert } from "@/hooks/use-alerts";
import { useAlertsQuery } from "@/hooks/use-alerts";
import { useToast } from "@/hooks/use-toast";
import { useProfileQuery } from "@/hooks/use-profile";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const triggerAlert = useTriggerAlert();
  const { data: alerts = [] } = useAlertsQuery();
  const { data: profile } = useProfileQuery();
  const { toast } = useToast();

  const unresolvedCount = alerts.filter(a => !a.isResolved).length;

  const navItems = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/reminders", label: "الأدوية", icon: Clock },
    { href: "/family", label: "الأسرة", icon: Users },
    {
      href: "/alerts", label: "التنبيهات", icon: AlertTriangle,
      badge: unresolvedCount > 0 ? unresolvedCount : undefined
    },
    { href: "/devices", label: "الأجهزة", icon: Activity },
    { href: "/profile", label: "الملف الطبي", icon: User },
    { href: "/reports", label: "التقارير", icon: FileBarChart2 },
  ];

  const handleEmergency = () => {
    triggerAlert.mutate({
      data: { type: "emergency", message: "تم الضغط على زر المساعدة الفورية", severity: "critical" }
    }, {
      onSuccess: () => toast({ title: "🚨 تم إرسال التنبيه", description: "تم إخطار أفراد الأسرة فوراً.", variant: "destructive" })
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-foreground">

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          رفيق كبار السن
        </div>
        <div className="flex items-center gap-2">
          {unresolvedCount > 0 && (
            <span className="w-6 h-6 rounded-full bg-destructive text-white text-xs font-bold flex items-center justify-center">
              {unresolvedCount}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed md:static inset-y-0 right-0 z-10 w-68 bg-white border-l border-border shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        <div className="h-full flex flex-col p-5 overflow-y-auto">

          {/* Logo */}
          <div className="hidden md:block mb-6">
            {profile ? (
              <Link href="/profile">
                <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary cursor-pointer transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 flex-shrink-0">
                    {profile.fullName?.charAt(0) || "؟"}
                  </div>
                  <div>
                    <p className="font-bold text-base leading-tight">{profile.fullName}</p>
                    <p className="text-muted-foreground text-xs">
                      {profile.roomNumber || `${profile.age} سنة`}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 text-primary font-bold text-xl px-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                رفيق كبار السن
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-0.5">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-primary")} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && !isActive && (
                      <span className="w-5 h-5 rounded-full bg-destructive text-white text-xs font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Emergency Button */}
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={handleEmergency}
              disabled={triggerAlert.isPending}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-base font-bold text-white bg-destructive hover:bg-red-600 transition-colors shadow-lg shadow-destructive/20 active:scale-95"
            >
              <PhoneCall className="w-5 h-5" />
              {triggerAlert.isPending ? "جاري الإرسال..." : "طلب مساعدة فورية"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative min-h-0">
        <div className="absolute top-0 right-0 w-full h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto relative z-0">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-0 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
}
