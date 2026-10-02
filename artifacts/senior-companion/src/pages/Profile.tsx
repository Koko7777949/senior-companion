import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Edit3, Save, X, Droplets, Building2, Stethoscope,
  Heart, FileText, Plus, Trash2, BadgeCheck,
} from "lucide-react";
import { useProfileQuery, useEditProfile } from "@/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const COMMON_CONDITIONS = [
  "ضغط الدم", "السكري من النوع الثاني", "السكري من النوع الأول",
  "أمراض القلب", "الفشل الكلوي", "آلام المفاصل",
  "الربو", "زيادة الكوليسترول", "فقر الدم",
  "الخرف المبكر", "هشاشة العظام", "قصور الغدة الدرقية",
];

export default function Profile() {
  const { data: profile, isLoading } = useProfileQuery();
  const editProfile = useEditProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newCondition, setNewCondition] = useState("");

  const [form, setForm] = useState<any>(null);

  function startEdit() {
    if (!profile) return;
    setForm({
      fullName: profile.fullName,
      age: profile.age,
      bloodType: profile.bloodType,
      roomNumber: profile.roomNumber ?? "",
      doctorName: profile.doctorName ?? "",
      conditions: [...(profile.conditions ?? [])],
      notes: profile.notes ?? "",
    });
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setForm(null);
    setNewCondition("");
  }

  function handleSave() {
    if (!form) return;
    editProfile.mutate({
      data: {
        ...form,
        age: Number(form.age),
        roomNumber: form.roomNumber || undefined,
        doctorName: form.doctorName || undefined,
        notes: form.notes || undefined,
      }
    }, {
      onSuccess: () => {
        toast({ title: "تم حفظ البيانات بنجاح ✓" });
        setIsEditing(false);
        setForm(null);
      }
    });
  }

  function addCondition(c: string) {
    if (!c.trim() || form.conditions.includes(c)) return;
    setForm({ ...form, conditions: [...form.conditions, c] });
    setNewCondition("");
  }

  function removeCondition(c: string) {
    setForm({ ...form, conditions: form.conditions.filter((x: string) => x !== c) });
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
  };

  if (isLoading) {
    return <div className="flex justify-center p-20"><div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!profile) return null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-3xl mx-auto">
      <motion.header variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <User className="w-10 h-10 text-primary" />
            الملف الطبي
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">بيانات المريض الكاملة للاستخدام الطبي والمتابعة الصحية</p>
        </div>
        {!isEditing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Edit3 className="w-5 h-5" />
            تعديل البيانات
          </button>
        )}
      </motion.header>

      {!isEditing ? (
        <>
          {/* Patient Card */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-primary/70 rounded-3xl p-8 text-white shadow-xl shadow-primary/20">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-black backdrop-blur-sm border border-white/30 flex-shrink-0">
                {profile.fullName?.charAt(0) || "؟"}
              </div>
              <div>
                <h2 className="text-3xl font-black">{profile.fullName}</h2>
                <p className="text-white/80 text-lg mt-1">العمر: {profile.age} سنة</p>
                {profile.roomNumber && (
                  <div className="mt-2 flex items-center gap-2 text-white/90 font-medium">
                    <Building2 className="w-4 h-4" />
                    {profile.roomNumber}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Info Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoCard icon={Droplets} label="فصيلة الدم" value={profile.bloodType} color="text-red-500 bg-red-50" ltr />
            <InfoCard icon={Stethoscope} label="الطبيب المعالج" value={profile.doctorName || "غير محدد"} color="text-blue-500 bg-blue-50" />
            <InfoCard icon={Building2} label="رقم الغرفة / الجناح" value={profile.roomNumber || "غير محدد"} color="text-emerald-500 bg-emerald-50" />
          </motion.div>

          {/* Conditions */}
          <motion.div variants={itemVariants} className="bg-card rounded-3xl p-6 shadow-sm border border-border">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              الحالات الطبية المزمنة
            </h3>
            {(profile.conditions ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {(profile.conditions ?? []).map(c => (
                  <span key={c} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-bold">
                    <BadgeCheck className="w-4 h-4" />
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-lg">لا توجد حالات مزمنة مسجلة</p>
            )}
          </motion.div>

          {/* Notes */}
          {profile.notes && (
            <motion.div variants={itemVariants} className="bg-card rounded-3xl p-6 shadow-sm border border-border">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                ملاحظات طبية
              </h3>
              <p className="text-lg leading-relaxed text-foreground/90">{profile.notes}</p>
            </motion.div>
          )}
        </>
      ) : (
        /* Edit Form */
        <motion.div variants={itemVariants} className="bg-card rounded-3xl p-8 shadow-sm border border-border space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="الاسم الكامل">
              <input
                className="form-input"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                placeholder="الاسم الكامل للمريض"
              />
            </FormField>
            <FormField label="العمر">
              <input
                className="form-input"
                type="number"
                min={1}
                max={150}
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
              />
            </FormField>
            <FormField label="فصيلة الدم">
              <div className="flex flex-wrap gap-2">
                {BLOOD_TYPES.map(bt => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => setForm({ ...form, bloodType: bt })}
                    className={cn(
                      "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                      form.bloodType === bt ? "bg-primary text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="الطبيب المعالج (اختياري)">
              <input
                className="form-input"
                value={form.doctorName}
                onChange={e => setForm({ ...form, doctorName: e.target.value })}
                placeholder="اسم الطبيب..."
              />
            </FormField>
            <FormField label="رقم الغرفة / الجناح (للمستشفى)">
              <input
                className="form-input"
                value={form.roomNumber}
                onChange={e => setForm({ ...form, roomNumber: e.target.value })}
                placeholder="مثال: غرفة 204 - جناح القلب"
              />
            </FormField>
          </div>

          {/* Conditions */}
          <FormField label="الحالات الطبية المزمنة">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {form.conditions.map((c: string) => (
                  <span key={c} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full font-bold text-sm">
                    {c}
                    <button type="button" onClick={() => removeCondition(c)} className="hover:text-destructive">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="form-input flex-1"
                  value={newCondition}
                  onChange={e => setNewCondition(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCondition(newCondition))}
                  placeholder="أضف حالة طبية..."
                />
                <button type="button" onClick={() => addCondition(newCondition)} className="px-3 py-2 bg-primary text-white rounded-xl hover:bg-primary/90">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {COMMON_CONDITIONS.filter(c => !form.conditions.includes(c)).slice(0, 6).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => addCondition(c)}
                    className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm hover:bg-secondary transition-colors"
                  >
                    + {c}
                  </button>
                ))}
              </div>
            </div>
          </FormField>

          {/* Notes */}
          <FormField label="ملاحظات طبية (اختياري)">
            <textarea
              className="form-input resize-none"
              rows={3}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="ملاحظات خاصة بالمريض، تعليمات الطبيب..."
            />
          </FormField>

          <div className="flex gap-4 pt-2">
            <button
              onClick={handleSave}
              disabled={editProfile.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xl shadow-lg transition-all"
            >
              <Save className="w-5 h-5" />
              {editProfile.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
            <button
              onClick={cancelEdit}
              className="px-6 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-bold text-xl"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function InfoCard({ icon: Icon, label, value, color, ltr }: any) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <p className="text-lg font-bold mt-0.5" dir={ltr ? "ltr" : undefined}>{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-base font-bold text-foreground">{label}</label>
      {children}
    </div>
  );
}
