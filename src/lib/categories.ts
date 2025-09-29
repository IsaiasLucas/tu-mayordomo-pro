import { 
  ShoppingCart, 
  Home, 
  Car, 
  Heart, 
  GraduationCap, 
  Smartphone, 
  CreditCard, 
  Shield, 
  Gamepad2, 
  Baby, 
  MoreHorizontal,
  LucideIcon
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "alimentacion",
    name: "Alimentación",
    icon: ShoppingCart,
    color: "text-emerald-600"
  },
  {
    id: "vivienda", 
    name: "Vivienda",
    icon: Home,
    color: "text-blue-600"
  },
  {
    id: "transporte",
    name: "Transporte", 
    icon: Car,
    color: "text-orange-600"
  },
  {
    id: "salud",
    name: "Salud",
    icon: Heart,
    color: "text-red-600"
  },
  {
    id: "educacion",
    name: "Educación",
    icon: GraduationCap,
    color: "text-purple-600"
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    icon: Smartphone,
    color: "text-indigo-600"
  },
  {
    id: "finanzas",
    name: "Finanzas",
    icon: CreditCard,
    color: "text-green-600"
  },
  {
    id: "seguros",
    name: "Seguros",
    icon: Shield,
    color: "text-cyan-600"
  },
  {
    id: "ocio",
    name: "Ocio",
    icon: Gamepad2,
    color: "text-pink-600"
  },
  {
    id: "familia",
    name: "Familia",
    icon: Baby,
    color: "text-rose-600"
  },
  {
    id: "otros",
    name: "Otros",
    icon: MoreHorizontal,
    color: "text-gray-600"
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(category => category.id === id);
};

export const getCategoryByName = (name: string): Category | undefined => {
  return CATEGORIES.find(category => category.name.toLowerCase() === name.toLowerCase());
};