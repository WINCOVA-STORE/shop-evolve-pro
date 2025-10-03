import { LucideIcon, Home, Shirt, Footprints, ShoppingBag, Baby, Dog, Sparkles, Heart, Wrench, Laptop, Car, Palette, Package, Lightbulb, UtensilsCrossed, Sofa, Users, ShirtIcon as ShirtIcon2, Watch, Shield, Backpack, ToyBrick, Bone, Droplet, Dumbbell, Hammer, Drill, Leaf, Smartphone, CarFront, Wrench as Screwdriver, PaintBucket, Scissors } from "lucide-react";

export interface Subcategory {
  name: string;
  slug: string;
  icon?: LucideIcon;
}

export interface Category {
  name: string;
  slug: string;
  icon: LucideIcon;
  subcategories: Subcategory[];
}

export const categories: Category[] = [
  {
    name: "Home and Kitchen",
    slug: "home-kitchen",
    icon: Home,
    subcategories: [
      { name: "Storage and Organization", slug: "storage-organization", icon: Package },
      { name: "Decoration", slug: "decoration", icon: Sparkles },
      { name: "Kitchen Utensils", slug: "kitchen-utensils", icon: UtensilsCrossed },
      { name: "Lighting", slug: "lighting", icon: Lightbulb },
      { name: "Furniture", slug: "furniture", icon: Sofa },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: Shirt,
    subcategories: [
      { name: "Women", slug: "women", icon: Users },
      { name: "Men", slug: "men", icon: ShirtIcon2 },
      { name: "Accessories", slug: "accessories", icon: Watch },
      { name: "Underwear", slug: "underwear", icon: Shield },
    ],
  },
  {
    name: "Shoes and Sneakers",
    slug: "shoes-sneakers",
    icon: Footprints,
    subcategories: [
      { name: "Sport Shoes", slug: "sport-shoes" },
      { name: "Casual", slug: "casual" },
      { name: "Sandals", slug: "sandals" },
      { name: "Boots for Every Terrain", slug: "boots-terrain" },
    ],
  },
  {
    name: "Bags and Accessories",
    slug: "bags-accessories",
    icon: ShoppingBag,
    subcategories: [
      { name: "Handbags", slug: "handbags" },
      { name: "Backpacks, Bags and Satchels", slug: "backpacks-bags", icon: Backpack },
      { name: "Belts", slug: "belts" },
    ],
  },
  {
    name: "Babies and Kids",
    slug: "babies-kids",
    icon: Baby,
    subcategories: [
      { name: "Clothing", slug: "kids-clothing" },
      { name: "Toys", slug: "toys", icon: ToyBrick },
      { name: "Baby Safety", slug: "baby-safety" },
      { name: "Kids Accessories", slug: "kids-accessories" },
    ],
  },
  {
    name: "Pets",
    slug: "pets",
    icon: Dog,
    subcategories: [
      { name: "Pet Toys and Chewers", slug: "pet-toys", icon: Bone },
      { name: "Pet Clothing", slug: "pet-clothing" },
      { name: "Pet Accessories", slug: "pet-accessories" },
    ],
  },
  {
    name: "Beauty and Personal Care",
    slug: "beauty-personal-care",
    icon: Sparkles,
    subcategories: [
      { name: "Hair Care", slug: "hair-care" },
      { name: "Skin Care", slug: "skin-care", icon: Droplet },
      { name: "Makeup", slug: "makeup" },
      { name: "Fragrances", slug: "fragrances" },
    ],
  },
  {
    name: "Health and Wellness",
    slug: "health-wellness",
    icon: Heart,
    subcategories: [
      { name: "Fitness", slug: "fitness", icon: Dumbbell },
      { name: "Massage", slug: "massage" },
      { name: "Supplements", slug: "supplements" },
      { name: "Personal Care", slug: "personal-care" },
    ],
  },
  {
    name: "Home Tools and Equipment",
    slug: "home-tools",
    icon: Wrench,
    subcategories: [
      { name: "Electric Tools", slug: "electric-tools", icon: Drill },
      { name: "Manual Tools", slug: "manual-tools", icon: Hammer },
      { name: "Gardening", slug: "gardening", icon: Leaf },
    ],
  },
  {
    name: "Electronics and Accessories",
    slug: "electronics",
    icon: Laptop,
    subcategories: [
      { name: "Smart Tech Accessories", slug: "smart-tech", icon: Smartphone },
      { name: "Audio & Video", slug: "audio-video" },
      { name: "Gaming", slug: "gaming" },
      { name: "Wearables", slug: "wearables" },
    ],
  },
  {
    name: "Auto Accessories and Car Care",
    slug: "auto-accessories",
    icon: Car,
    subcategories: [
      { name: "Car Accessories", slug: "car-accessories", icon: CarFront },
      { name: "Car Gadgets", slug: "car-gadgets" },
      { name: "Car Care Products", slug: "car-care", icon: Screwdriver },
    ],
  },
  {
    name: "Arts and Crafts",
    slug: "arts-crafts",
    icon: Palette,
    subcategories: [
      { name: "Crochet", slug: "crochet" },
      { name: "DIY Projects", slug: "diy", icon: PaintBucket },
      { name: "Painting", slug: "painting" },
      { name: "Crafting Supplies", slug: "crafting-supplies", icon: Scissors },
    ],
  },
];

// Quick access to main categories for navigation
export const mainCategories = categories.map(cat => ({
  name: cat.name,
  slug: cat.slug,
  icon: cat.icon,
}));
