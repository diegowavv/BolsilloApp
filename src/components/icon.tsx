import {
  Apple,
  BadgeCheck,
  Bike,
  Briefcase,
  Bus,
  Car,
  CarTaxiFront,
  Cloud,
  Coffee,
  Droplet,
  Dumbbell,
  Flame,
  Fuel,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  LifeBuoy,
  Lightbulb,
  Music,
  PiggyBank,
  Pill,
  Plane,
  Shapes,
  ShieldPlus,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Stethoscope,
  Target,
  Ticket,
  TrendingUp,
  Trophy,
  Tv,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  apple: Apple,
  "badge-check": BadgeCheck,
  bike: Bike,
  briefcase: Briefcase,
  bus: Bus,
  car: Car,
  "car-taxi-front": CarTaxiFront,
  cloud: Cloud,
  coffee: Coffee,
  droplet: Droplet,
  dumbbell: Dumbbell,
  flame: Flame,
  fuel: Fuel,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  home: Home,
  laptop: Laptop,
  "life-buoy": LifeBuoy,
  lightbulb: Lightbulb,
  music: Music,
  "piggy-bank": PiggyBank,
  pill: Pill,
  plane: Plane,
  shapes: Shapes,
  "shield-plus": ShieldPlus,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  smartphone: Smartphone,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  target: Target,
  ticket: Ticket,
  "trending-up": TrendingUp,
  trophy: Trophy,
  tv: Tv,
  utensils: Utensils,
  wallet: Wallet,
  wifi: Wifi,
  wrench: Wrench,
  zap: Zap,
};

export const ICON_CHOICES = Object.keys(ICONS);

export function Icon({ name, className, size = 18 }: { name: string; className?: string; size?: number }) {
  const C = ICONS[name] ?? Shapes;
  return <C className={className} size={size} strokeWidth={1.9} aria-hidden />;
}

/** Ícono dentro de un círculo tintado con el color de su grupo */
export function IconBubble({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, color, background: `color-mix(in oklab, ${color} 14%, transparent)` }}
    >
      <Icon name={name} size={Math.round(size * 0.5)} />
    </span>
  );
}
