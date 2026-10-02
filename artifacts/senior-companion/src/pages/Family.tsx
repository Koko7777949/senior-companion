import { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Phone, Star, Trash2, X } from "lucide-react";
import { useFamilyQuery, useAddFamilyContact, useRemoveFamilyContact } from "@/hooks/use-family";
import { useToast } from "@/hooks/use-toast";

export default function Family() {
  const { data: family = [], isLoading } = useFamilyQuery();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            أفراد الأسرة
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            جهات الاتصال الخاصة بعائلتك. سيتم إخطارهم في حالات الطوارئ.
          </p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <UserPlus className="w-6 h-6" />
          إضافة فرد جديد
        </button>
      </header>

      {isAdding && <FamilyForm onClose={() => setIsAdding(false)} />}

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {family.map((contact, i) => (
            <ContactCard key={contact.id} contact={contact} index={i} />
          ))}
          
          {family.length === 0 && !isAdding && (
            <div className="col-span-full text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
              <img src={`${import.meta.env.BASE_URL}images/avatar-elderly.png`} alt="لا يوجد" className="w-32 h-32 mx-auto mb-4 opacity-50 grayscale" />
              <h3 className="text-2xl font-bold text-foreground">لا يوجد أفراد مسجلين</h3>
              <p className="text-muted-foreground mt-2 text-lg">قم بإضافة أرقام هواتف أبنائك وأقاربك لسهولة التواصل</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact, index }: { contact: any, index: number }) {
  const remove = useRemoveFamilyContact();
  const { toast } = useToast();

  const handleDelete = () => {
    if (confirm(`هل أنت متأكد من حذف ${contact.name}؟`)) {
      remove.mutate({ id: contact.id }, {
        onSuccess: () => toast({ title: "تم الحذف بنجاح" })
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-3xl p-6 shadow-md border border-border relative overflow-hidden group"
    >
      {contact.isPrimary && (
        <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-4 py-1 rounded-bl-xl flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" /> جهة اتصال رئيسية
        </div>
      )}
      
      <div className="flex items-center gap-4 mt-4">
        <div className="w-20 h-20 rounded-full bg-secondary overflow-hidden border-4 border-white shadow-md flex-shrink-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/avatar-elderly.png`} 
            alt={contact.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-2xl font-bold">{contact.name}</h3>
          <p className="text-primary font-medium text-lg">{contact.relationship}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <a 
          href={`tel:${contact.phone}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-success/10 text-success hover:bg-success hover:text-white rounded-xl font-bold transition-colors"
        >
          <Phone className="w-5 h-5" />
          اتصال
        </a>
        <button 
          onClick={handleDelete}
          disabled={remove.isPending}
          className="p-3 text-destructive bg-destructive/10 hover:bg-destructive hover:text-white rounded-xl transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

function FamilyForm({ onClose }: { onClose: () => void }) {
  const add = useAddFamilyContact();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relationship: "",
    isPrimary: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    add.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "تم الإضافة بنجاح" });
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
          <h2 className="text-2xl font-bold">إضافة فرد جديد</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-lg font-bold mb-2">الاسم</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="مثال: أحمد"
            />
          </div>
          
          <div>
            <label className="block text-lg font-bold mb-2">رقم الهاتف</label>
            <input 
              required
              type="tel" 
              dir="ltr"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-border focus:border-primary focus:outline-none transition-colors text-right"
              placeholder="05X XXX XXXX"
            />
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">صلة القرابة</label>
            <select 
              required
              value={formData.relationship}
              onChange={e => setFormData({...formData, relationship: e.target.value})}
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-border focus:border-primary focus:outline-none transition-colors bg-white"
            >
              <option value="" disabled>اختر صلة القرابة</option>
              <option value="ابن">ابن</option>
              <option value="ابنة">ابنة</option>
              <option value="زوج/زوجة">زوج / زوجة</option>
              <option value="أخ/أخت">أخ / أخت</option>
              <option value="صديق">صديق</option>
              <option value="ممرض/ة">ممرض / ممرضة</option>
            </select>
          </div>

          <label className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.isPrimary}
              onChange={e => setFormData({...formData, isPrimary: e.target.checked})}
              className="w-6 h-6 text-primary border-2 border-primary rounded focus:ring-primary"
            />
            <span className="text-lg font-bold">جهة اتصال رئيسية لحالات الطوارئ</span>
          </label>

          <div className="pt-4 flex gap-4">
            <button 
              type="submit"
              disabled={add.isPending}
              className="flex-1 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xl shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {add.isPending ? "جاري الحفظ..." : "إضافة"}
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
