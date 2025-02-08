"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import RecipeCard from "./_components/RecipeCard";
import { Button } from "@/app/_components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

interface MealPlanItem {
  day: string;
  meal: string;
  categories: string[];
  nutritions: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: {
    name: string;
    amount: number;
    unit: string;
  }[];
  image_url: string;
}

interface Recipe {
  id: number;
  title: string;
  diet?: string[];
  categories: string[];
  nutritions: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: {
    name: string;
    amount: number;
    unit: string;
  }[];
  image_url: string;
}
// Add this interface near your other interfaces
interface CheckedItems {
  [mealDay: string]: {
    [ingredient: string]: boolean;
  };
}

export default function Dashboard() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
  const [heldRecipes, setHeldRecipes] = useState<Set<number>>(new Set());
  const [preferences, setPreferences] = useState({
    dietType: "Alles",
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase.from("recipes").select();
      if (error) throw error;
      if (data) setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const toggleChecked = (mealDay: string, ingredient: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [mealDay]: {
        ...prev[mealDay],
        [ingredient]: !prev[mealDay]?.[ingredient],
      },
    }));
  };

  const toggleHoldRecipe = (index: number) => {
    setHeldRecipes((prev) => {
      const newHeld = new Set(prev);
      if (newHeld.has(index)) {
        newHeld.delete(index);
      } else {
        newHeld.add(index);
      }
      return newHeld;
    });
  };

  const generateNewRecipe = (dayIndex: number) => {
    const filteredMeals = recipes.filter((meal) => {
      if (meal.diet) {
        if (preferences.dietType === "Vegetarian") {
          return meal.diet.includes("Vegetarian");
        }
        if (preferences.dietType === "Vegan") {
          return meal.diet?.includes("Vegan");
        }
        if (preferences.dietType === "Fleisch") {
          return meal.diet?.includes("Fleischgerichte");
        }
      }
      return true;
    });

    const currentMeals = new Set(mealPlan.map((day) => day.meal));
    let newRecipe;

    do {
      const randomIndex = Math.floor(Math.random() * filteredMeals.length);
      newRecipe = filteredMeals[randomIndex];
    } while (currentMeals.has(newRecipe.title));

    setMealPlan((prevPlan) => {
      const newPlan = [...prevPlan];
      newPlan[dayIndex] = {
        day: `Tag ${dayIndex + 1}`,
        meal: newRecipe.title,
        categories: newRecipe.categories,
        nutritions: newRecipe.nutritions,
        ingredients: newRecipe.ingredients,
        image_url: newRecipe.image_url,
      };
      return newPlan;
    });
  };

  const generateMealPlan = () => {
    const filteredMeals = recipes.filter((meal) => {
      if (meal.diet) {
        if (preferences.dietType === "Vegetarian") {
          return meal.diet.includes("Vegetarian");
        }
        if (preferences.dietType === "Vegan") {
          return meal.diet?.includes("Vegan");
        }
        if (preferences.dietType === "Fleisch") {
          return meal.diet?.includes("Fleischgerichte");
        }
      }
      return true;
    });

    const selectedMeals = new Set();
    let newMealPlan = [];

    if (mealPlan.length > 0) {
      newMealPlan = mealPlan.map((meal, index) => {
        if (heldRecipes.has(index)) {
          selectedMeals.add(meal.meal);
          return meal;
        }
        return null;
      });
    } else {
      newMealPlan = Array(7).fill(null);
    }

    for (let i = 0; i < 7; i++) {
      if (!heldRecipes.has(i)) {
        let newRecipe;
        do {
          const randomIndex = Math.floor(Math.random() * filteredMeals.length);
          newRecipe = filteredMeals[randomIndex];
        } while (selectedMeals.has(newRecipe.title));

        selectedMeals.add(newRecipe.title);
        newMealPlan[i] = {
          day: `Tag ${i + 1}`,
          meal: newRecipe.title,
          categories: newRecipe.categories,
          nutritions: newRecipe.nutritions,
          ingredients: newRecipe.ingredients,
          image_url: newRecipe.image_url,
        };
      }
    }

    setMealPlan(newMealPlan);
  };

  const downloadPlan = () => {
    const blob = new Blob(
      [
        mealPlan
          .map(
            (day) =>
              `${day.day}: ${day.meal}\n${day.ingredients
                .map(
                  (ingredient) =>
                    `- ${ingredient.amount} ${ingredient.unit} ${ingredient.name} `
                )
                .join("\n")}\n`
          )
          .join("\n"),
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Essensplan.txt";
    a.click();
  };

  return (
    <main className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="w-48">
          <Select
            value={preferences.dietType}
            onValueChange={(val) =>
              setPreferences((p) => ({ ...p, dietType: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Diet Type" />
            </SelectTrigger>
            <SelectContent>
              {["Alles", "Vegetarian", "Vegan", "Fleisch"].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4">
          <Button onClick={generateMealPlan}>
            <RefreshCw className="mr-2" /> Generate
          </Button>
          {mealPlan.length > 0 && (
            <Button onClick={downloadPlan}>
              <Download className="mr-2" /> Download Plan
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {mealPlan.map((day, index) => (
          <RecipeCard
            key={index}
            day={day}
            onGenerateNew={() => generateNewRecipe(index)}
            checkedItems={checkedItems}
            toggleChecked={toggleChecked}
            index={index}
            isHeld={heldRecipes.has(index)}
            onToggleHold={() => toggleHoldRecipe(index)}
          />
        ))}
      </div>
    </main>
  );
}
