import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Lock, RefreshCcw } from "lucide-react";

// Update interface
interface RecipeCardProps {
  day: {
    day: string;
    meal: string;
    categories: string[];
    nutritions: any;
    ingredients: any[];
    image_url: string;
  };
  onGenerateNew: (dayNumber: number) => void;
  checkedItems: any;
  toggleChecked: (day: string, ingredient: string) => void;
  index: number;
  isHeld: boolean;
  onToggleHold: () => void;
}

// Remove useState and update the component
const RecipeCard = ({ 
  day, 
  onGenerateNew, 
  checkedItems, 
  toggleChecked, 
  index,
  isHeld,
  onToggleHold 
}: RecipeCardProps) => {
  return (
    <div className="p-4 border rounded mb-4 text-left" id="recipe-card">
     <h3 className="mb-4">
        {day.day}: {day.meal}
      </h3>
      <div className="flex gap-3 justify-end ">
      <Button
            variant={isHeld ? "secondary" : "outline"}
            onClick={onToggleHold}
          >
            <Lock className="mr-2 h-4 w-4" />
            {isHeld ? "Held" : "Hold"}
          </Button>
          <Button
            onClick={() => onGenerateNew(index)}
            disabled={isHeld}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Generate New
          </Button>
      </div>
      
      <img src={day.image_url} alt="" className="w-60 max-h-40" />
      <div className="flex justify-between items-center mt-4">
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
};

export default RecipeCard;