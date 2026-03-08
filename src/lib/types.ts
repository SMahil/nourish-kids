export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface KidProfile {
  name: string;
  age: string;
  allergies: string[];
  dislikes: string[];
  favorites: string[];
  dietType: string;
}

export interface UserPreferences {
  kids: KidProfile[];
  cookingTime: string;
  skillLevel: string;
  cuisinePreferences: string[];
}

export interface Recipe {
  id: string;
  title: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  kidApproval: number;
  ingredients: string[];
  steps: string[];
  tags: string[];
  icon: string;
  cuisine?: string;
  matchReasons?: string[];
  nutrition?: NutritionInfo;
}
