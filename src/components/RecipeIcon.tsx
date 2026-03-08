import {
  UtensilsCrossed, Pizza, CakeSlice, Salad, Soup, Cookie, Sandwich,
  Coffee, IceCreamCone, Egg, Fish, Beef, Apple, Cherry, Grape, Carrot,
  Wheat, CupSoda, Milk, Flame, LeafyGreen, Bean, CircleDot, Croissant,
  Wine, GlassWater, Drumstick, Popcorn,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map icon keys to Lucide components
const iconMap: Record<string, React.ComponentType<any>> = {
  "utensils-crossed": UtensilsCrossed,
  pizza: Pizza,
  cake: CakeSlice,
  salad: Salad,
  soup: Soup,
  cookie: Cookie,
  sandwich: Sandwich,
  coffee: Coffee,
  "ice-cream": IceCream,
  egg: Egg,
  fish: Fish,
  beef: Beef,
  apple: Apple,
  cherry: Cherry,
  grape: Grape,
  carrot: Carrot,
  wheat: Wheat,
  cup: Cup,
  milk: Milk,
  flame: Flame,
  leafy: LeafyGreen,
  bean: Bean,
  circle: CircleDot,
  croissant: Croissant,
  wine: Wine,
  glass: GlassWater,
  drumstick: Drumstick,
  popcorn: Popcorn,
};

interface RecipeIconProps {
  icon: string;
  size?: number;
  className?: string;
}

const RecipeIcon = ({ icon, size = 24, className }: RecipeIconProps) => {
  const IconComponent = iconMap[icon] || UtensilsCrossed;
  return <IconComponent size={size} className={cn("text-primary", className)} />;
};

export default RecipeIcon;
