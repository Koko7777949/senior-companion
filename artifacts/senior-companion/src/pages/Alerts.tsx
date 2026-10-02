import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Activity, Pill, UserX, CheckCircle2, ShieldCheck, Clock, Filter } from "lucide-react";
import { useAlertsQuery, useMarkAlertResolved } from "@/hooks/use-alerts";
import { formatDate, translations } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "unresolved" | "resolved";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200 shadow-red-500/20 shadow-lg",
  high: "bg-orange-50 text-orange-700 border-orange-200 shadow-orange-500/10 shadow-md",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm",
  low: "bg-blue-50 text-blue-700 border-blue-200 shadow-sm",
};

const SEVERITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

export default function Alerts() {
  const { data: alerts = [], isLoading } = useAlertsQuery();
  const resolveAlert = useMarkAlertResolved();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const filtered = alerts.filter(a => {
    if (activeFilter === "unresolved") return !a.isResolved;
    if (activeFilter === "resolved") return a.isResolved;
    return true;
  });

  const unresolvedCount = alerts.filter(a => !a.isResolved).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-7 h-7" />;
      case 'fall_detected': return <Activity className="w-7 h-7" />;
      case 'medication_missed': return <Pill className="w-7 h-7" />;
      case 'no_movement': return <UserX className="w-7 h-7" />;
      default: return <AlertTriangle className="w-7 h-7" />;
    }
  };

  const handleResolve = (id: number) => {
    resolveAlert.mutate({ id }, {
      onSuccess: () => toast({ title: "تم تحديد التنبيه كمُعالج" }),
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
          <AlertTriangle className="w-10 h-10 text-destructive" />
          سجل التنبيهات
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          سجل كامل بجميع الحالات الطارئة والتنبيهات المسجلة.
        </p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-sm">
          <div className="text-3xl font-black text-foreground">{alerts.length}</div>
          <div className="text-sm font-medium text-muted-foreground mt-1">إجمالي التنبيهات</div>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-center shadow-sm">
          <div className="text-3xl font-black text-red-600">{unresolvedCount}</div>
          <div className="text-sm font-medium text-red-500 mt-1">غير معالجة</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center shadow-sm">
          <div className="text-3xl font-black text-emerald-600">{alerts.length - unresolvedCount}</div>
          <div className="text-sm font-medium text-emerald-500 mt-1">تم معالجتها</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-2xl w-fit">
        <Filter className="w-5 h-5 text-muted-foreground mr-1" />
        {([
          { key: "all", label: "الكل" },
          { key: "unresolved", label: "غير معالجة" },
          { key: "resolved", label: "معالجة" },
        ] as { key: FilterTab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={cn(
              "px-5 py-2 rounded-xl text-base font-bold transition-all",
              activeFilter === key
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {key === "unresolved" && unresolvedCount > 0 && (
              <span className="mr-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unresolvedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          <AnimatePresence mode="popLayout">
            {filtered.map((alert, i) => (
              <motion.div
                layout
                key={alert.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "flex items-start gap-4 p-6 rounded-3xl border-2 transition-all",
                  alert.isResolved
                    ? "bg-muted/30 text-muted-foreground border-border"
                    : SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.low
                )}
              >
                <div className="flex-shrink-0 p-3 rounded-2xl bg-white/60 backdrop-blur-sm">
                  {getAlertIcon(alert.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold">
                      {translations.alertTypes[alert.type as keyof typeof translations.alertTypes] || alert.type}
                    </h3>
                    <div className="flex items-center gap-2 text-sm opacity-80">
                      <Clock className="w-4 h-4" />
                      {formatDate(alert.createdAt)}
                    </div>
                  </div>

                  <p className="text-lg opacity-90 mb-4">{alert.message}</p>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-bold px-3 py-1 rounded-lg",
                        alert.isResolved ? "bg-muted text-muted-foreground" : (SEVERITY_BADGE[alert.severity] || "bg-blue-100 text-blue-700")
                      )}>
                        {translations.severities[alert.severity as keyof typeof translations.severities] || alert.severity}
                      </span>
                      {alert.isResolved && (
                        <span className="text-sm font-bold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          تم التعامل معها
                        </span>
                      )}
                    </div>

                    {!alert.isResolved && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolveAlert.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white rounded-xl font-bold text-sm transition-all hover:shadow-md active:scale-95 border border-current/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        تحديد كمُعالج
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border"
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-60" />
              <h3 className="text-2xl font-bold text-foreground">
                {activeFilter === "unresolved" ? "لا توجد تنبيهات غير معالجة" : "لا توجد تنبيهات"}
              </h3>
              <p className="text-muted-foreground mt-2 text-lg">الوضع مستقر ✓</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
