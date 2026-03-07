import { Recipe } from "./types";

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Rainbow Veggie Wraps",
    cookTime: "15 min",
    difficulty: "Easy",
    servings: 4,
    kidApproval: 92,
    ingredients: ["Tortillas", "Hummus", "Carrots", "Cucumber", "Bell peppers", "Cheese"],
    steps: ["Spread hummus on tortilla", "Layer sliced veggies", "Add cheese", "Roll tightly and slice"],
    tags: ["Quick", "No-Cook", "Veggie"],
    emoji: "🌯",
  },
  {
    id: "2",
    title: "Mini Pizza Faces",
    cookTime: "20 min",
    difficulty: "Easy",
    servings: 6,
    kidApproval: 98,
    ingredients: ["English muffins", "Pizza sauce", "Mozzarella", "Olives", "Cherry tomatoes", "Peppers"],
    steps: ["Preheat oven to 375°F", "Spread sauce on muffin halves", "Add cheese and toppings as faces", "Bake 10-12 minutes"],
    tags: ["Fun", "Kid-Favorite", "Interactive"],
    emoji: "🍕",
  },
  {
    id: "3",
    title: "Banana Oat Pancakes",
    cookTime: "15 min",
    difficulty: "Easy",
    servings: 4,
    kidApproval: 95,
    ingredients: ["Bananas", "Oats", "Eggs", "Cinnamon", "Honey", "Blueberries"],
    steps: ["Blend banana, oats, eggs and cinnamon", "Pour small circles on pan", "Cook 2 min each side", "Top with berries"],
    tags: ["Breakfast", "Healthy", "No Sugar Added"],
    emoji: "🥞",
  },
  {
    id: "4",
    title: "Cheesy Broccoli Bites",
    cookTime: "25 min",
    difficulty: "Medium",
    servings: 12,
    kidApproval: 87,
    ingredients: ["Broccoli", "Cheddar cheese", "Breadcrumbs", "Eggs", "Garlic powder"],
    steps: ["Steam and chop broccoli", "Mix with cheese, breadcrumbs, egg", "Form into small balls", "Bake at 400°F for 15 min"],
    tags: ["Veggie Hidden", "Snack", "Freezer-Friendly"],
    emoji: "🥦",
  },
  {
    id: "5",
    title: "Peanut Butter Noodles",
    cookTime: "12 min",
    difficulty: "Easy",
    servings: 4,
    kidApproval: 90,
    ingredients: ["Spaghetti", "Peanut butter", "Soy sauce", "Honey", "Lime", "Carrots"],
    steps: ["Cook pasta al dente", "Whisk PB, soy, honey, lime", "Toss pasta with sauce", "Top with shredded carrots"],
    tags: ["Quick", "Protein-Rich", "One-Pot"],
    emoji: "🍝",
  },
  {
    id: "6",
    title: "Berry Smoothie Bowl",
    cookTime: "5 min",
    difficulty: "Easy",
    servings: 2,
    kidApproval: 94,
    ingredients: ["Mixed berries", "Banana", "Yogurt", "Granola", "Chia seeds", "Honey"],
    steps: ["Blend berries, banana, yogurt until thick", "Pour into bowls", "Top with granola and chia", "Drizzle honey"],
    tags: ["Breakfast", "No-Cook", "Healthy"],
    emoji: "🫐",
  },
];

export const commonAllergies = [
  "Dairy", "Eggs", "Peanuts", "Tree Nuts", "Wheat/Gluten", "Soy", "Fish", "Shellfish",
];

export const commonDislikes = [
  "Spicy food", "Mushrooms", "Onions", "Tomatoes", "Broccoli", "Fish", "Beans", "Spinach",
];

export const commonFavorites = [
  "Pasta", "Pizza", "Chicken nuggets", "Mac & cheese", "Rice", "Fruits", "Pancakes", "Sandwiches",
];

export const cuisineOptions = [
  "Italian", "Mexican", "Indian", "Chinese", "Japanese", "Mediterranean", "American", "Thai",
];
