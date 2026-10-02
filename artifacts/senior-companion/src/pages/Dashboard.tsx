import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BellRing, Users, Activity, AlertTriangle, Heart, ChevronLeft, Clock,
  CheckCircle2, CalendarDays, Building2, Stethoscope, Pill, PhoneCall,
  TrendingUp, Droplets, User,
} from "lucide-react";
import { useRemindersQuery } from "@/hooks/use-reminders";
import { useFamilyQuery } from "@/hooks/use-family";
import { useAlertsQuery, useTriggerAlert } from "@/hooks/use-alerts";
import { useDevicesQuery, useDeviceReadingsQuery } from "@/hooks/use-devices";
import { useProfileQuery } from "@/hooks/use-profile";
import { useTodayLogsQuery, useMarkTaken } from "@/hooks/use-medication-logs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const ARABIC_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const ARABIC_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function ComplianceRing({ percent }: { percent: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  const color = percent >= 80 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
      <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
      <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }} />
    </svg>
  );
}

export default function Dashboard() {
  const { data: profile } = useProfileQuery();
  const { data: reminders = [] } = useRemindersQuery();
  const { data: family = [] } = useFamilyQuery();
  const { data: alerts = [] } = useAlertsQuery();
  const { data: devices = [] } = useDevicesQuery();
  const { data: todayLogs = [] } = useTodayLogsQuery();
  const triggerAlert = useTriggerAlert();
  const markTaken = useMarkTaken();
  const { toast } = useToast();
  const now = useLiveClock();

  const activeReminders = reminders.filter(r => r.isActive);
  const connectedDevices = devices.filter(d => d.isConnected);
  const unresolvedAlerts = alerts.filter(a => !a.isResolved);

  const todayCompliance = activeReminders.length > 0
    ? Math.round((todayLogs.length / activeReminders.length) * 100)
    : 100;

  const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dayName = ARABIC_DAYS[now.getDay()];
  const dateStr = `${dayName}، ${now.getDate()} ${ARABIC_MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  const handleEmergencyClick = () => {
    triggerAlert.mutate({
      data: { type: "emergency", message: "تم طلب المساعدة الطارئة من الشاشة الرئيسية", severity: "critical" }
    }, {
      onSuccess: () => toast({ title: "🚨 تم إرسال التنبيه", description: "تم إخطار أفراد الأسرة بحالة الطوارئ.", variant: "destructive" })
    });
  };

  const handleMarkTaken = (reminderId: number, name: string) => {
    markTaken.mutate({ id: reminderId }, {
      onSuccess: () => toast({ title: `✅ تم تسجيل ${name}`, description: "تم تحديث سجل الأدوية." })
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

      {/* Top Bar: Clock + Emergency */}
      <motion.header variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl px-5 py-2.5">
            <div className="text-2xl font-black text-primary tracking-widest tabular-nums" dir="ltr">{timeStr}</div>
          </div>
          <button
            onClick={handleEmergencyClick}
            disabled={triggerAlert.isPending}
            className="flex items-center gap-2 px-5 py-3 bg-destructive hover:bg-red-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-destructive/30 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <AlertTriangle className="w-5 h-5" />
            {triggerAlert.isPending ? "جاري الإرسال..." : "مساعدة طارئة"}
          </button>
        </div>
      </motion.header>

      {/* Patient Card */}
      {profile && (
        <motion.div variants={itemVariants}>
          <Link href="/profile">
            <div className="bg-gradient-to-br from-primary to-primary/70 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 cursor-pointer hover:shadow-2xl hover:shadow-primary/25 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black border border-white/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                  {profile.fullName?.charAt(0) || "؟"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black">{profile.fullName}</h2>
                    <span className="text-white/60 text-sm">• {profile.age} سنة</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-white/80 text-sm">
                    {profile.bloodType && (
                      <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" />{profile.bloodType}</span>
                    )}
                    {profile.roomNumber && (
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{profile.roomNumber}</span>
                    )}
                    {profile.doctorName && (
                      <span className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" />د. {profile.doctorName}</span>
                    )}
                  </div>
                  {(profile.conditions ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(profile.conditions ?? []).slice(0, 3).map(c => (
                        <span key={c} className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">{c}</span>
                      ))}
                      {(profile.conditions ?? []).length > 3 && (
                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">+{(profile.conditions ?? []).length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <ChevronLeft className="w-5 h-5 text-white/60 group-hover:text-white transition-colors flex-shrink-0" />
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Alerts Warning */}
      {unresolvedAlerts.length > 0 && (
        <motion.div variants={itemVariants}>
          <Link href="/alerts">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-red-100 transition-colors">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-800">يوجد {unresolvedAlerts.length} {unresolvedAlerts.length === 1 ? "تنبيه" : "تنبيهات"} غير معالجة</h4>
                <p className="text-red-600 text-sm">اضغط للاطلاع والتعامل معها</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-red-400" />
            </div>
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="التذكيرات النشطة" value={activeReminders.length} icon={BellRing} colorClass="bg-amber-100 text-amber-600" href="/reminders" />
        <StatCard title="جهات الاتصال" value={family.length} icon={Users} colorClass="bg-blue-100 text-blue-600" href="/family" />
        <StatCard title="تنبيهات مفتوحة" value={unresolvedAlerts.length} icon={AlertTriangle}
          colorClass={unresolvedAlerts.length > 0 ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"}
          href="/alerts" urgent={unresolvedAlerts.length > 0} />
        <StatCard title="الأجهزة المتصلة" value={connectedDevices.length} icon={Activity} colorClass="bg-emerald-100 text-emerald-600" href="/devices" />
      </motion.div>

      {/* Compliance + Medications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Ring */}
        <motion.div variants={itemVariants} className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            الالتزام اليوم
          </h3>
          <div className="relative flex items-center justify-center">
            <ComplianceRing percent={todayCompliance} />
            <div className="absolute text-center">
              <div className={cn(
                "text-2xl font-black",
                todayCompliance >= 80 ? "text-emerald-600" : todayCompliance >= 50 ? "text-amber-600" : "text-red-600"
              )}>
                {todayCompliance}%
              </div>
            </div>
          </div>
          <p className="mt-3 text-muted-foreground text-sm">
            {todayLogs.length} من {activeReminders.length} جرعة
          </p>
          <Link href="/reminders" className="mt-3 text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
            عرض الجدول
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Today's Medications */}
        <motion.div variants={itemVariants} className="bg-card rounded-3xl p-6 shadow-sm border border-border lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              أدوية اليوم
            </h3>
            <Link href="/reminders" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
              إدارة الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {activeReminders.slice(0, 5).map(r => {
              const taken = todayLogs.some(l => l.reminderId === r.id);
              return (
                <div key={r.id} className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border-2 transition-all",
                  taken ? "bg-emerald-50 border-emerald-200" : "bg-secondary/40 border-border"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0",
                      taken ? "bg-emerald-500 text-white" : "bg-primary text-white"
                    )} dir="ltr">
                      {r.time}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{r.medicationName}</p>
                      <p className="text-muted-foreground text-xs">{r.dosage}</p>
                    </div>
                  </div>
                  {taken ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      تم
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMarkTaken(r.id, r.medicationName)}
                      disabled={markTaken.isPending}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      تناولته
                    </button>
                  )}
                </div>
              );
            })}
            {activeReminders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="w-8 h-8 mx-auto mb-2 opacity-40" />
                لا توجد أدوية نشطة
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid: Family Contacts + Device Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Family Contacts */}
        <motion.div variants={itemVariants} className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              جهات الاتصال العائلية
            </h3>
            <Link href="/family" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
              إدارة
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {family.slice(0, 3).map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/40 border border-secondary/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm flex-shrink-0">
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{f.name}</p>
                    <p className="text-muted-foreground text-xs">{f.relationship}</p>
                  </div>
                </div>
                {f.isPrimary && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">رئيسي</span>
                )}
              </div>
            ))}
            {family.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                لا توجد جهات اتصال
              </div>
            )}
          </div>
        </motion.div>

        {/* Device Status */}
        <motion.div variants={itemVariants} className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              الأجهزة الصحية
            </h3>
            <Link href="/devices" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
              التفاصيل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {devices.slice(0, 4).map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/40 border border-secondary/80">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0",
                    d.isConnected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-destructive/60"
                  )} />
                  <div>
                    <p className="font-bold text-sm">{d.name}</p>
                    <p className="text-muted-foreground text-xs">{d.isConnected ? "متصل ويعمل" : "غير متصل"}</p>
                  </div>
                </div>
              </div>
            ))}
            {devices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                لا توجد أجهزة
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, colorClass, href, urgent }: {
  title: string; value: number; icon: any; colorClass: string; href: string; urgent?: boolean;
}) {
  return (
    <Link href={href}>
      <motion.div whileHover={{ y: -3 }} className={cn(
        "bg-card p-5 rounded-3xl shadow-sm border cursor-pointer transition-shadow hover:shadow-md",
        urgent ? "border-red-200 bg-red-50/50" : "border-border"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0", colorClass)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium leading-tight">{title}</p>
            <h3 className={cn("text-3xl font-black mt-0.5", urgent && value > 0 ? "text-red-600" : "text-foreground")}>
              {value}
            </h3>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
