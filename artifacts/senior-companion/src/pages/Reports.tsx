import { motion } from "framer-motion";
import {
  FileBarChart2, Printer, Heart, Pill, AlertTriangle, Activity,
  TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, BarChart3,
} from "lucide-react";
import { useProfileQuery } from "@/hooks/use-profile";
import { useRemindersQuery } from "@/hooks/use-reminders";
import { useAlertsQuery } from "@/hooks/use-alerts";
import { useDevicesQuery } from "@/hooks/use-devices";
import { useTodayLogsQuery } from "@/hooks/use-medication-logs";
import { cn } from "@/lib/utils";

const ARABIC_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function formatDate(d: Date) {
  return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Reports() {
  const { data: profile } = useProfileQuery();
  const { data: reminders = [] } = useRemindersQuery();
  const { data: alerts = [] } = useAlertsQuery();
  const { data: devices = [] } = useDevicesQuery();
  const { data: todayLogs = [] } = useTodayLogsQuery();

  const activeReminders = reminders.filter(r => r.isActive);
  const todayCompliance = activeReminders.length > 0
    ? Math.round((todayLogs.length / activeReminders.length) * 100)
    : 100;

  const unresolvedAlerts = alerts.filter(a => !a.isResolved);
  const criticalAlerts = alerts.filter(a => a.severity === "critical");
  const connectedDevices = devices.filter(d => d.isConnected);

  const now = new Date();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-4xl mx-auto">
      <motion.header variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <FileBarChart2 className="w-10 h-10 text-primary" />
            التقرير الصحي
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">ملخص شامل للحالة الصحية — تاريخ التقرير: {formatDate(now)}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="hidden md:flex items-center gap-2 px-5 py-3 bg-muted hover:bg-secondary text-foreground rounded-xl font-bold transition-colors border border-border"
        >
          <Printer className="w-5 h-5" />
          طباعة
        </button>
      </motion.header>

      {/* Patient Header Card */}
      {profile && (
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-primary/70 rounded-3xl p-7 text-white shadow-xl shadow-primary/20">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-black border border-white/30 flex-shrink-0">
              {profile.fullName?.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black">{profile.fullName}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-white/80 text-sm">
                <span>العمر: {profile.age} سنة</span>
                <span>فصيلة الدم: {profile.bloodType}</span>
                {profile.roomNumber && <span>{profile.roomNumber}</span>}
                {profile.doctorName && <span>د. {profile.doctorName}</span>}
              </div>
              {(profile.conditions ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(profile.conditions ?? []).map(c => (
                    <span key={c} className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{c}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStat label="التزام الأدوية اليوم" value={`${todayCompliance}%`}
          color={todayCompliance >= 80 ? "text-emerald-600 bg-emerald-50" : todayCompliance >= 50 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"}
          icon={Pill} trend={todayCompliance >= 80 ? "up" : todayCompliance >= 50 ? "flat" : "down"} />
        <ReportStat label="تنبيهات غير معالجة" value={String(unresolvedAlerts.length)}
          color={unresolvedAlerts.length === 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}
          icon={AlertTriangle} trend={unresolvedAlerts.length === 0 ? "up" : "down"} />
        <ReportStat label="أجهزة متصلة" value={`${connectedDevices.length}/${devices.length}`}
          color="text-blue-600 bg-blue-50" icon={Activity} trend="flat" />
        <ReportStat label="تنبيهات حرجة (إجمالي)" value={String(criticalAlerts.length)}
          color={criticalAlerts.length === 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}
          icon={Heart} trend={criticalAlerts.length === 0 ? "up" : "down"} />
      </motion.div>

      {/* Medication Section */}
      <motion.div variants={itemVariants} className="bg-card rounded-3xl p-6 shadow-sm border border-border">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-5">
          <Pill className="w-6 h-6 text-primary" />
          جدول الأدوية
        </h3>
        <div className="space-y-3">
          {reminders.map(r => {
            const takenToday = todayLogs.some(l => l.reminderId === r.id);
            return (
              <div key={r.id} className={cn(
                "flex items-center justify-between p-4 rounded-2xl border",
                takenToday ? "bg-emerald-50 border-emerald-200" : r.isActive ? "bg-amber-50 border-amber-200" : "bg-muted border-border opacity-60"
              )}>
                <div className="flex items-center gap-3">
                  {takenToday ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : r.isActive ? <XCircle className="w-5 h-5 text-amber-500" /> : <Minus className="w-5 h-5 text-muted-foreground" />}
                  <div>
                    <p className="font-bold text-base">{r.medicationName}</p>
                    <p className="text-sm text-muted-foreground">{r.dosage} — {r.time} — {r.days.join("، ")}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-bold",
                  takenToday ? "bg-emerald-200 text-emerald-800" :
                    r.isActive ? "bg-amber-200 text-amber-800" : "bg-muted text-muted-foreground"
                )}>
                  {takenToday ? "تم تناوله" : r.isActive ? "لم يُتناول بعد" : "موقوف"}
                </span>
              </div>
            );
          })}
          {reminders.length === 0 && <p className="text-muted-foreground text-center py-8">لا توجد أدوية مسجلة</p>}
        </div>
      </motion.div>

      {/* Alerts Section */}
      <motion.div variants={itemVariants} className="bg-card rounded-3xl p-6 shadow-sm border border-border">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-5">
          <AlertTriangle className="w-6 h-6 text-primary" />
          آخر التنبيهات والحوادث
        </h3>
        <div className="space-y-3">
          {alerts.slice(0, 8).map(alert => (
            <div key={alert.id} className={cn(
              "flex items-center justify-between p-4 rounded-2xl border",
              alert.severity === "critical" ? "bg-red-50 border-red-200" :
                alert.severity === "high" ? "bg-orange-50 border-orange-200" :
                  "bg-muted/50 border-border"
            )}>
              <div>
                <p className="font-bold">{alert.message}</p>
                <p className="text-sm text-muted-foreground">{new Date(alert.createdAt).toLocaleString("ar-EG")}</p>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-bold flex-shrink-0 mr-3",
                alert.isResolved ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              )}>
                {alert.isResolved ? "تمت المعالجة" : "غير معالج"}
              </span>
            </div>
          ))}
          {alerts.length === 0 && <p className="text-muted-foreground text-center py-8">لا توجد تنبيهات مسجلة</p>}
        </div>
      </motion.div>

      {/* Devices Section */}
      <motion.div variants={itemVariants} className="bg-card rounded-3xl p-6 shadow-sm border border-border">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-5">
          <Activity className="w-6 h-6 text-primary" />
          حالة الأجهزة الطبية
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {devices.map(d => (
            <div key={d.id} className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border",
              d.isConnected ? "bg-emerald-50 border-emerald-200" : "bg-muted/50 border-border"
            )}>
              <div className={cn("w-3 h-3 rounded-full flex-shrink-0", d.isConnected ? "bg-emerald-500" : "bg-muted-foreground/40")} />
              <div>
                <p className="font-bold">{d.name}</p>
                <p className="text-sm text-muted-foreground">{d.isConnected ? "متصل ويعمل بشكل طبيعي" : "غير متصل"}</p>
              </div>
            </div>
          ))}
          {devices.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">لا توجد أجهزة مسجلة</p>}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center text-muted-foreground text-sm py-4 border-t border-border">
        تم إنشاء هذا التقرير آلياً بواسطة نظام رفيق كبار السن — {formatDate(now)}
      </motion.div>
    </motion.div>
  );
}

function ReportStat({ label, value, color, icon: Icon, trend }: any) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium leading-tight">{label}</p>
          <h3 className="text-3xl font-black mt-1">{value}</h3>
        </div>
        <TrendIcon className={cn("w-5 h-5", trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground")} />
      </div>
    </div>
  );
}
