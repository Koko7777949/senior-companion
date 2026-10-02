import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Pill, Clock, Edit2, Trash2, X, CheckCircle2, Circle,
  CalendarCheck, TrendingUp,
} from "lucide-react";
import { useRemindersQuery, useAddReminder, useRemoveReminder, useEditReminder } from "@/hooks/use-reminders";
import { useTodayLogsQuery, useMarkTaken } from "@/hooks/use-medication-logs";
import { formatTimeOnly } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Reminders() {
  const { data: reminders = [], isLoading } = useRemindersQuery();
  const { data: todayLogs = [] } = useTodayLogsQuery();
  const markTaken = useMarkTaken();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const activeReminders = reminders.filter(r => r.isActive);
  const takenCount = todayLogs.length;
  const compliance = activeReminders.length > 0 ? Math.round((takenCount / activeReminders.length) * 100) : 100;

  const handleMarkTaken = (id: number, name: string) => {
    const alreadyTaken = todayLogs.some(l => l.reminderId === id);
    if (alreadyTaken) return;
    markTaken.mutate({ id }, {
      onSuccess: () => toast({ title: `✅ تم تسجيل جرعة ${name}` })
    });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <Pill className="w-10 h-10 text-primary" />
            جدول الأدوية
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">تتبع أدويتك اليومية وسجّل الجرعات المتناولة</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          إضافة دواء
        </button>
      </header>

      {/* Today's Compliance Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded-3xl p-6 flex items-center gap-6 border-2 shadow-sm",
          compliance === 100 ? "bg-emerald-50 border-emerald-200" :
            compliance >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
        )}
      >
        <div className="flex-shrink-0 text-center">
          <div className={cn(
            "text-4xl font-black",
            compliance === 100 ? "text-emerald-600" : compliance >= 50 ? "text-amber-600" : "text-red-600"
          )}>
            {compliance}%
          </div>
          <div className="text-sm font-medium mt-1 text-muted-foreground">الالتزام</div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className={cn(
              "w-5 h-5",
              compliance === 100 ? "text-emerald-600" : compliance >= 50 ? "text-amber-600" : "text-red-600"
            )} />
            <h3 className="font-bold text-lg">الالتزام باليوم</h3>
          </div>
          <p className="text-muted-foreground">تم تناول {takenCount} من {activeReminders.length} جرعة مقررة اليوم</p>
          <div className="mt-3 h-2.5 bg-white/60 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                compliance === 100 ? "bg-emerald-500" : compliance >= 50 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${compliance}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Today's Schedule */}
      {activeReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            جدول الجرعات اليومية
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {activeReminders.map((r, i) => {
              const taken = todayLogs.some(l => l.reminderId === r.id);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                    taken ? "bg-emerald-50 border-emerald-200" : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0",
                    taken ? "bg-emerald-500 text-white" : "bg-primary text-white"
                  )} dir="ltr">
                    {r.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{r.medicationName}</p>
                    <p className="text-muted-foreground text-sm">{r.dosage}</p>
                  </div>
                  <button
                    onClick={() => handleMarkTaken(r.id, r.medicationName)}
                    disabled={taken || markTaken.isPending}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold transition-all flex-shrink-0",
                      taken
                        ? "bg-emerald-100 text-emerald-700 cursor-default"
                        : "bg-primary hover:bg-primary/90 text-white hover:-translate-y-0.5 active:translate-y-0"
                    )}
                  >
                    {taken ? <><CheckCircle2 className="w-4 h-4" />تم</> : <><Circle className="w-4 h-4" />تناولت</>}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-primary" />
          قائمة الأدوية الكاملة
        </h2>

        {isAdding && <ReminderForm onClose={() => setIsAdding(false)} />}
        {editingId && (
          <ReminderForm
            reminder={reminders.find(r => r.id === editingId)}
            onClose={() => setEditingId(null)}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center p-12"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {reminders.map((reminder, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={reminder.id}
                className={cn(
                  "bg-card rounded-3xl p-6 shadow-sm border-2 transition-all hover:shadow-lg",
                  reminder.isActive ? "border-primary/20" : "border-border opacity-70"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold shadow-inner",
                      reminder.isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {formatTimeOnly(reminder.time)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{reminder.medicationName}</h3>
                      <p className="text-muted-foreground">{reminder.dosage}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">أيام التناول:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {reminder.days.map(day => (
                      <span key={day} className="px-2 py-0.5 bg-white rounded-lg text-xs font-bold shadow-sm">{day}</span>
                    ))}
                  </div>
                  {reminder.notes && (
                    <p className="mt-2 text-xs border-t border-border/50 pt-2 text-foreground/80">{reminder.notes}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                  <ReminderActions reminder={reminder} onEdit={() => setEditingId(reminder.id)} />
                </div>
              </motion.div>
            ))}
            {reminders.length === 0 && !isAdding && (
              <div className="col-span-full text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                <Pill className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold">لا توجد أدوية مضافة</h3>
                <p className="text-muted-foreground mt-2 text-lg">أضف أدويتك لتتبع الجرعات</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReminderActions({ reminder, onEdit }: any) {
  const remove = useRemoveReminder();
  const edit = useEditReminder();
  const { toast } = useToast();

  const handleToggle = () => {
    edit.mutate({
      id: reminder.id,
      data: {
        medicationName: reminder.medicationName,
        dosage: reminder.dosage,
        time: reminder.time,
        days: reminder.days,
        isActive: !reminder.isActive
      }
    });
  };

  const handleDelete = () => {
    if (confirm("هل أنت متأكد من حذف هذا التذكير؟")) {
      remove.mutate({ id: reminder.id }, {
        onSuccess: () => toast({ title: "تم الحذف بنجاح" })
      });
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={cn(
          "px-4 py-2 rounded-lg font-bold text-sm transition-colors",
          reminder.isActive ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-success/20 text-success hover:bg-success/30"
        )}
      >
        {reminder.isActive ? "إيقاف مؤقت" : "تفعيل"}
      </button>
      <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        <Edit2 className="w-4 h-4" />
      </button>
      <button onClick={handleDelete} disabled={remove.isPending} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </>
  );
}

function ReminderForm({ reminder, onClose }: { reminder?: any; onClose: () => void }) {
  const isEditing = !!reminder;
  const add = useAddReminder();
  const edit = useEditReminder();
  const { toast } = useToast();
  const daysOfWeek = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const [formData, setFormData] = useState({
    medicationName: reminder?.medicationName || "",
    dosage: reminder?.dosage || "",
    time: reminder?.time || "08:00",
    days: reminder?.days || ["يومياً"],
    notes: reminder?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, isActive: true, days: formData.days.length > 0 ? formData.days : ["يومياً"] };
    if (isEditing) {
      edit.mutate({ id: reminder.id, data: payload }, {
        onSuccess: () => { toast({ title: "تم التعديل بنجاح" }); onClose(); }
      });
    } else {
      add.mutate({ data: payload }, {
        onSuccess: () => { toast({ title: "تم الإضافة بنجاح" }); onClose(); }
      });
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => {
      if (prev.days.includes("يومياً") && day !== "يومياً") return { ...prev, days: [day] };
      if (day === "يومياً") return { ...prev, days: ["يومياً"] };
      const newDays = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days.filter(d => d !== "يومياً"), day];
      return { ...prev, days: newDays.length === 0 ? ["يومياً"] : newDays };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden mb-4"
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <h2 className="text-2xl font-bold">{isEditing ? "تعديل الدواء" : "إضافة دواء جديد"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-base font-bold mb-2">اسم الدواء</label>
            <input required type="text" value={formData.medicationName}
              onChange={e => setFormData({ ...formData, medicationName: e.target.value })}
              className="form-input" placeholder="مثال: بنادول، أسبيرين..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold mb-2">الجرعة</label>
              <input required type="text" value={formData.dosage}
                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                className="form-input" placeholder="حبة، 5مل..." />
            </div>
            <div>
              <label className="block text-base font-bold mb-2">الوقت</label>
              <input required type="time" value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="form-input" />
            </div>
          </div>
          <div>
            <label className="block text-base font-bold mb-2">أيام التناول</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => toggleDay("يومياً")}
                className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-colors",
                  formData.days.includes("يومياً") ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                يومياً
              </button>
              {daysOfWeek.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={cn("px-3 py-2 rounded-xl text-sm font-bold transition-colors",
                    formData.days.includes(day) && !formData.days.includes("يومياً") ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-base font-bold mb-2">ملاحظات (اختياري)</label>
            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="form-input resize-none" placeholder="يؤخذ بعد الأكل..." rows={2} />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="submit" disabled={add.isPending || edit.isPending}
              className="flex-1 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg transition-all">
              {add.isPending || edit.isPending ? "جاري الحفظ..." : "حفظ الدواء"}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-bold text-lg">
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
