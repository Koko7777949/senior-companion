import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Watch, Heart, ShieldAlert, Plus, Trash2, X, RefreshCw, Clock, Droplets, BarChart3 } from "lucide-react";
import { useDevicesQuery, useAddDevice, useRemoveDevice, useDeviceReadingsQuery } from "@/hooks/use-devices";
import { translations, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEVICE_COLORS: Record<string, string> = {
  heart_rate: "bg-red-50 text-red-500",
  smartwatch: "bg-blue-50 text-blue-500",
  fall_detector: "bg-amber-50 text-amber-500",
  motion_sensor: "bg-violet-50 text-violet-500",
  blood_pressure: "bg-emerald-50 text-emerald-500",
  blood_sugar: "bg-orange-50 text-orange-500",
};

const DEVICE_UNITS: Record<string, string> = {
  heart_rate: "نبضة/د",
  blood_pressure: "مم زئبق",
  blood_sugar: "ملجم/دل",
  motion_sensor: "حركة",
  fall_detector: "حوادث",
  smartwatch: "خطوة",
};

export default function Devices() {
  const { data: devices = [], isLoading } = useDevicesQuery();
  const [isAdding, setIsAdding] = useState(false);
  const [viewingDevice, setViewingDevice] = useState<number | null>(null);

  const getDeviceIcon = (type: string, className = "w-10 h-10") => {
    switch (type) {
      case 'heart_rate': return <Heart className={cn(className, "text-red-500")} />;
      case 'smartwatch': return <Watch className={cn(className, "text-blue-500")} />;
      case 'fall_detector': return <ShieldAlert className={cn(className, "text-amber-500")} />;
      case 'blood_pressure': return <Activity className={cn(className, "text-emerald-500")} />;
      case 'blood_sugar': return <Droplets className={cn(className, "text-orange-500")} />;
      default: return <Activity className={cn(className, "text-primary")} />;
    }
  };

  const connectedCount = devices.filter(d => d.isConnected).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <Activity className="w-10 h-10 text-primary" />
            الأجهزة الصحية
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            إدارة أجهزة التتبع الصحي وأجهزة الاستشعار المنزلية.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-6 h-6" />
          ربط جهاز جديد
        </button>
      </header>

      {/* Connection summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-700">{connectedCount}</div>
            <div className="text-sm font-medium text-emerald-600">جهاز متصل</div>
          </div>
        </div>
        <div className="bg-muted/50 rounded-2xl p-5 border border-border flex items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">{devices.length}</div>
            <div className="text-sm font-medium text-muted-foreground">إجمالي الأجهزة</div>
          </div>
        </div>
      </div>

      {isAdding && <DeviceForm onClose={() => setIsAdding(false)} />}

      <AnimatePresence>
        {viewingDevice && (
          <DeviceReadings
            deviceId={viewingDevice}
            deviceName={devices.find(d => d.id === viewingDevice)?.name || ""}
            deviceType={devices.find(d => d.id === viewingDevice)?.type || ""}
            onClose={() => setViewingDevice(null)}
          />
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              icon={getDeviceIcon(device.type)}
              colorClass={DEVICE_COLORS[device.type] || "bg-secondary text-primary"}
              onView={() => setViewingDevice(device.id)}
            />
          ))}
          {devices.length === 0 && !isAdding && (
            <div className="col-span-full text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
              <Watch className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-foreground">لا توجد أجهزة متصلة</h3>
              <p className="text-muted-foreground mt-2 text-lg">قم بربط أجهزة قياس الصحة أو مستشعرات الحركة.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeviceCard({ device, icon, colorClass, onView }: { device: any, icon: React.ReactNode, colorClass: string, onView: () => void }) {
  const remove = useRemoveDevice();
  const { toast } = useToast();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`هل تريد إزالة ${device.name}؟`)) {
      remove.mutate({ id: device.id }, {
        onSuccess: () => toast({ title: "تم إزالة الجهاز" })
      });
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onView}
      className="bg-card rounded-3xl p-6 shadow-sm border border-border cursor-pointer relative overflow-hidden group hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-5">
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner", colorClass)}>
          {icon}
        </div>
        <div className={cn(
          "px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold",
          device.isConnected ? "bg-emerald-100 text-emerald-700" : "bg-destructive/10 text-destructive"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            device.isConnected ? "bg-emerald-500 animate-pulse" : "bg-destructive"
          )} />
          {device.isConnected ? "متصل" : "غير متصل"}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-1">{device.name}</h3>
      <p className="text-muted-foreground text-base mb-2">
        {translations.deviceTypes[device.type as keyof typeof translations.deviceTypes] || device.type}
      </p>
      {device.isConnected && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-5">
          <Clock className="w-3 h-3" />
          يعمل بشكل طبيعي
        </p>
      )}
      {!device.isConnected && <div className="mb-5" />}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm font-bold text-primary flex items-center gap-1">
          <BarChart3 className="w-4 h-4" />
          عرض القراءات
        </span>
        <button
          onClick={handleDelete}
          className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors z-10"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

function DeviceReadings({ deviceId, deviceName, deviceType, onClose }: { deviceId: number, deviceName: string, deviceType: string, onClose: () => void }) {
  const { data: readings = [], isLoading } = useDeviceReadingsQuery(deviceId);
  const unit = DEVICE_UNITS[deviceType] || "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-card w-full max-w-md h-full shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-2xl font-bold">قراءات الجهاز</h2>
            <p className="text-muted-foreground">{deviceName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : readings.length > 0 ? (
            readings.map((reading, i) => (
              <motion.div
                key={reading.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-secondary/30 p-4 rounded-2xl flex justify-between items-center border border-border/50"
              >
                <div>
                  <div className="text-3xl font-black text-primary">
                    {reading.value}
                    <span className="text-sm font-normal text-muted-foreground mr-1">{reading.unit || unit}</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(reading.recordedAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20">
              <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-bold text-muted-foreground">لا توجد قراءات لهذا الجهاز بعد</p>
              <p className="text-sm text-muted-foreground mt-2">ستظهر القراءات هنا بمجرد بدء الجهاز بالإرسال</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeviceForm({ onClose }: { onClose: () => void }) {
  const add = useAddDevice();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", type: "smartwatch" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    add.mutate({ data: { name: formData.name, type: formData.type as any } }, {
      onSuccess: () => {
        toast({ title: "تم ربط الجهاز بنجاح" });
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <h2 className="text-2xl font-bold">ربط جهاز جديد</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-lg font-bold mb-2">اسم الجهاز</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="مثال: ساعة أبل، جهاز قياس الضغط..."
            />
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">نوع الجهاز</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(translations.deviceTypes).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: key })}
                  className={cn(
                    "px-4 py-3 rounded-xl text-base font-bold transition-all border-2 text-right",
                    formData.type === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={add.isPending}
              className="flex-1 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xl shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {add.isPending ? "جاري الربط..." : "ربط الجهاز"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-bold text-xl transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
