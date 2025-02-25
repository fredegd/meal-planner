"use client";

import { Lock, RefreshCw } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";

interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface RecipeCardProps {
  day: {
    day: string;
    meal: string;
    categories: string[];
    nutritions: Nutrition;
    ingredients: Ingredient[];
    image_url: string;
  };
  onGenerateNew: (dayNumber: number) => void;
  checkedItems: Record<string, Record<string, boolean>>;
  toggleChecked: (day: string, ingredient: string) => void;
  index: number;
  isHeld: boolean;
  onToggleHold: () => void;
}

const DEFAULT_IMAGE_URL = "https://placehold.co/300x200";
export default function RecipeCard({
  day,
  onGenerateNew,
  checkedItems,
  toggleChecked,
  index,
  isHeld,
  onToggleHold,
}: RecipeCardProps) {
  return (
    <div className="p-4 border rounded mb-4 text-left">
      <div className="flex justify-between">
        <h5 className="mb-4">
          {day.day}: {day.meal}
        </h5>
        <div className="flex gap-3 justify-end">
          <Button
            className="flex items-center justify-center"
            variant={isHeld ? "secondary" : "outline"}
            onClick={onToggleHold}
          >
            <Lock className="h-4 w-4" />
          </Button>
          <Button
            className="flex items-center justify-center"
            onClick={() => onGenerateNew(index)}
            disabled={isHeld}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-start mt-4">
        <Image
          src={day.image_url || DEFAULT_IMAGE_URL}
          alt={day.meal}
          width={240}
          height={160}
          className="w-60 max-h-40 object-cover"
        />

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button>Ingredients</Button>
            </PopoverTrigger>
            <PopoverContent>
              <ul>
                {day.ingredients.map((ingredient, idx) => (
                  <li
                    key={`${day.day}-${idx}`}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={
                        checkedItems[day.day]?.[`${ingredient.name}-${idx}`] ||
                        false
                      }
                      onChange={() =>
                        toggleChecked(day.day, `${ingredient.name}-${idx}`)
                      }
                    />
                    <span
                      style={{
                        textDecoration: checkedItems[day.day]?.[
                          `${ingredient.name}-${idx}`
                        ]
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {`${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
                    </span>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
