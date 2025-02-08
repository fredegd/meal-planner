import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RefreshCw, Download, PlusCircle, CloudCog } from "lucide-react";

import { supabase } from "@/lib/supabase";
import RecipeCard from "@/components/RecipeCard";

// Erweiterte Mahlzeiten-Datenbank mit Nährwerten

const ALL_CATEGORIES = [
  "Abwechslungsreich",
  "Saisonal",
  "Regional",
  "Salat",
  "Dampfgemüse",
  "Hülsenfrüchte",
  "Getreide",
  "Vollkorn",
  "Fett",
  "Eiweiß",
  "Käsegerichte",
  "Fleischgerichte",
  "Fischgerichte",
  "Nudelgerichte",
  "Eintopfgerichte",
  "Pfannengericht",
  "Ofengerichte",
  "Internationale Gerichte",
  "Fermentiertes",
  "Vegetarische Gerichte",
  "Vegane Gerichte",
  "Low-Carb Gerichte",
  "Snacks und Fingerfood",
];

const Mahlzeitsplaner = () => {
  const [recipes, setRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [newMeal, setNewMeal] = useState({
    title: "",
    categories: [],
    nutritions: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  });

  const [preferences, setPreferences] = useState({
    dietType: "Alles",
    maxCalories: 800,
    minProtein: 20,
  });

  const [shoppingList, setShoppingList] = useState<string[]>([]);

  const toggleChecked = (mealDay, ingredient) => {
    setCheckedItems((prev) => ({
      ...prev,
      [mealDay]: {
        ...prev[mealDay],
        [ingredient]: !prev[mealDay]?.[ingredient],
      },
    }));
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setRecipes(data);
        console.log(data);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
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

    const currentMeals = new Set(mealPlan.map(day => day.meal));
    let newRecipe;
    
    do {
      const randomIndex = Math.floor(Math.random() * filteredMeals.length);
      newRecipe = filteredMeals[randomIndex];
    } while (currentMeals.has(newRecipe.title));

    setMealPlan(prevPlan => {
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

  // Add new state for held recipes
  const [heldRecipes, setHeldRecipes] = useState<Set<number>>(new Set());
  
  // Add function to handle hold/unhold
  const toggleHoldRecipe = (index: number) => {
    setHeldRecipes(prev => {
      const newHeld = new Set(prev);
      if (newHeld.has(index)) {
        newHeld.delete(index);
      } else {
        newHeld.add(index);
      }
      return newHeld;
    });
  };
  
  // Modify generateMealPlan
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

    // If there are existing meals, preserve the held ones
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

    // Fill in non-held positions with new recipes
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
    generateShoppingList(newMealPlan);
  };
  
  // Essensplan herunterladen as a PDF file
  // mit den ausgewählten Mahlzeiten
  // und den Zutaten
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
      {
        type: "text/plain",
      }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Essensplan.txt";
    a.click();
  };

  // Einkaufslisten-Generierung basierend auf Mahlzeiten
  // Update generateShoppingList to use the recipes state
  const generateShoppingList = (meals) => {
    const flatIngredients = meals.flatMap((meal) =>
      meal.ingredients.map((part) => `${part.amount} ${part.unit} ${part.name}`)
    );
    // Deduplizieren der Zutaten
    setShoppingList([...new Set(flatIngredients)]);
  };

  // Update addNewMeal to work with Supabase
  const addNewMeal = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert([newMeal])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setRecipes(prev => [...prev, ...data]);
        setNewMeal({
          title: "",
          categories: [],
          nutritions: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        });
      }
    } catch (error) {
      console.error('Error adding new meal:', error);
    }
  };

  // Einkaufsliste herunterladen as a PDF file
  const downloadList = () => {
    const blob = new Blob([shoppingList.join("\n")], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Einkaufsliste.txt";
    a.click();
  };

  // Neue Mahlzeit zur Datenbank hinzufügen
  //TODO

  const handleCategoryChange = (category) => {
    setNewMeal((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((cat) => cat !== category)
        : [...prev.categories, category];
      return { ...prev, categories: categories.slice(0, 4) };
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-4 lg:w-[900px] w-full sticky top-0 ">
      {/* Präferenz-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>7-Tage Essensplan</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {/* <div>
            <Label>Max. Kalorien pro Mahlzeit</Label>
            <Input
              type="number"
              value={preferences.maxCalories}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  maxCalories: Number(e.target.value),
                }))
              }
            />
          </div> */}
          {/* <div>
            <Label>Min. Protein (g)</Label>
            <Input
              type="number"
              value={preferences.minProtein}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  minProtein: Number(e.target.value),
                }))
              }
            />
          </div> */}
        </CardContent>
      </Card>

      {/* Mahlzeiten-Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <Label>Ernährungstyp</Label>
              <Select
                value={preferences.dietType}
                onValueChange={(val) => {
                  setPreferences((p) => ({ ...p, dietType: val }));
                  console.log(val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen" />
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
            <Button onClick={generateMealPlan}>
              <RefreshCw className="mr-2" /> Generieren
            </Button>
            <Button
              className={mealPlan.length > 0 ? "" : "hidden"}
              onClick={downloadPlan}
            >
              <Download className="mr-2 " /> Essensplan herunterladen
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mealPlan.map((day, index) => (
            // Remove this standalone RecipeCard component
            // Update RecipeCard props in the render section
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

            // Keep all other functions and the return statement with the correct RecipeCard usage in CardContent
          ))}
        </CardContent>
      </Card>

      {/* Dialog zum Hinzufügen neuer Gerichte */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 " /> Neues Gericht hinzufügen
          </Button>
        </DialogTrigger>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Neues Gericht hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Gerichtname</Label>
              <Input
                value={newMeal.title}
                onChange={(e) =>
                  setNewMeal((m) => ({ ...m, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Kategorien</Label>
              <Select
                value={newMeal.categories[0]}
                onValueChange={(val) =>
                  setNewMeal((m) => ({ ...m, categories: [val] }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorien wählen" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((category) => (
                    <div key={category}>
                      <input
                        type="checkbox"
                        id={category}
                        checked={newMeal.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      <label htmlFor={category} className="ml-2">
                        {category}
                      </label>
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Kalorien</Label>
                <Input
                  type="number"
                  value={newMeal.nutritions.calories}
                  onChange={(e) =>
                    setNewMeal((m) => ({
                      ...m,
                      nutritions: {
                        ...m.nutritions,
                        calories: Number(e.target.value),
                      },
                    }))
                  }
                />
              </div>
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  value={newMeal.nutritions.protein}
                  onChange={(e) =>
                    setNewMeal((m) => ({
                      ...m,
                      nutritions: {
                        ...m.nutritions,
                        protein: Number(e.target.value),
                      },
                    }))
                  }
                />
              </div>
            </div>
            <Button onClick={addNewMeal}>Gericht speichern</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mahlzeitsplaner;
