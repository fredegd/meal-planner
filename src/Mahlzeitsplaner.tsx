import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { RefreshCw, Download, PlusCircle } from "lucide-react";
import Meals from "@/data/meals";

// Erweiterte Mahlzeiten-Datenbank mit Nährwerten

const Mahlzeitsplaner = () => {
  const [mealPlan, setMealPlan] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});

  const toggleChecked = (mealDay, ingredient) => {
    setCheckedItems((prev) => ({
      ...prev,
      [mealDay]: {
        ...prev[mealDay],
        [ingredient]: !prev[mealDay]?.[ingredient],
      },
    }));
  };

  const [preferences, setPreferences] = useState({
    dietType: "Alles",
    maxCalories: 800,
    minProtein: 20,
  });
  const [newMeal, setNewMeal] = useState({
    name: "",
    categories: [],
    nutritions: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  });
  const [shoppingList, setShoppingList] = useState<string[]>([]);

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

  const generateMealPlan = () => {
    const allMeals = Object.entries(Meals).flatMap(
      ([category, meals]) => meals
    );

    // Filter basierend auf Präferenzen
    const filteredMeals = allMeals.filter(
      (meal) =>
        (preferences.dietType === "Alles" ||
          meal.categories.includes(preferences.dietType)) &&
        meal.nutritions.calories <= preferences.maxCalories &&
        meal.nutritions.protein >= preferences.minProtein
    );

    const selectedMeals = new Set();
    const mealPlan = [];

    while (mealPlan.length < 7 && filteredMeals.length > selectedMeals.size) {
      const randomIndex = Math.floor(Math.random() * filteredMeals.length);
      const randomMeal = filteredMeals[randomIndex];

      if (!selectedMeals.has(randomMeal.name)) {
        selectedMeals.add(randomMeal.name);
        mealPlan.push({
          day: `Tag ${mealPlan.length + 1}`,
          meal: randomMeal.name,
          categories: randomMeal.categories,
          nutritions: randomMeal.nutritions,
          ingredients: randomMeal.ingredients,
        });
      }
    }

    setMealPlan(mealPlan);
    generateShoppingList(mealPlan);
  };

  // Einkaufslisten-Generierung basierend auf Mahlzeiten
  const generateShoppingList = (meals) => {
    const allMeals = Object.values(Meals).flat();
    const flatIngredients = allMeals.flatMap((meal) => meal.ingredients);
    // Deduplizieren der Zutaten
    setShoppingList([...new Set(flatIngredients)]);
  };

  // Neue Mahlzeit zur Datenbank hinzufügen
  const addNewMeal = () => {
    const category = newMeal.categories[0];
    if (!Meals[category]) {
      Meals[category] = [];
    }
    Meals[category].push(newMeal);
    setNewMeal({
      name: "",
      categories: [],
      nutritions: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-4 w-[900px] ">
      {/* Präferenz-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Ernährungspräferenzen</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label>Ernährungstyp</Label>
            <Select
              value={preferences.dietType}
              onValueChange={(val) =>
                setPreferences((p) => ({ ...p, dietType: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Wählen" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Alles",
                  "Vegetarische Gerichte",
                  "Vegane Gerichte",
                  "Fleischgerichte",
                ].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
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
          </div>
          <div>
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
          </div>
        </CardContent>
      </Card>

      {/* Mahlzeiten-Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            7-Tage Essensplan
            <Button onClick={generateMealPlan}>
              <RefreshCw className="mr-2" /> Generieren
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mealPlan.map((day, index) => (
            <div key={index} className="p-4 border rounded mb-4 text-left">
              <h3 className="mb-4">
                {day.day}: {day.meal}
              </h3>

              <div className="flex justify-between">
                <ul>
                  {day.ingredients.map((ingredient) => (
                    <li
                      key={ingredient}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={checkedItems[day.day]?.[ingredient] || false}
                        onChange={() => toggleChecked(day.day, ingredient)}
                      />
                      <span
                        style={{
                          textDecoration: checkedItems[day.day]?.[ingredient]
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {ingredient}
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-col text-right">
                  {day.categories.map((category) => (
                    <li key={category}>{category}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dialog zum Hinzufügen neuer Gerichte */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2" /> Neues Gericht hinzufügen
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Gericht hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Gerichtname</Label>
              <Input
                value={newMeal.name}
                onChange={(e) =>
                  setNewMeal((m) => ({ ...m, name: e.target.value }))
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
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
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
