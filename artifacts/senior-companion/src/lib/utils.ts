import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Translations for enums and constants
export const translations = {
  alertTypes: {
    no_movement: "عدم وجود حركة",
    emergency: "حالة طوارئ",
    medication_missed: "تفويت دواء",
    fall_detected: "اكتشاف سقوط",
  },
  severities: {
    low: "منخفض",
    medium: "متوسط",
    high: "عالي",
    critical: "حرج",
  },
  deviceTypes: {
    heart_rate: "معدل ضربات القلب",
    motion_sensor: "مستشعر حركة",
    fall_detector: "كاشف سقوط",
    blood_pressure: "ضغط الدم",
    blood_sugar: "نسبة السكر",
    smartwatch: "ساعة ذكية",
  }
};

export function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatTimeOnly(dateString: string) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    // Fallback if it's just a time string like "14:30"
    if (typeof dateString === 'string' && dateString.includes(':')) {
      const [hours, minutes] = dateString.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'م' : 'ص';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    }
    return dateString;
  }
}
