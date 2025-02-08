"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/app/_components/ui/button";
import Image from "next/image";

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
  rating: {
    ratingValue: number;
    ratingCount: number;
  };
}

const DEFAULT_IMAGE_URL = "https://placehold.co/300x200";

export default function RecipesList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("title");

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

  const sortedRecipes = [...recipes].sort((a, b) => {
    if (sortOption === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortOption === "rating") {
      return b.rating.ratingValue - a.rating.ratingValue;
    }
    return 0;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button onClick={() => setViewMode("grid")}>Grid View</Button>
          <Button onClick={() => setViewMode("list")}>List View</Button>
        </div>
        <div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="title">Sort by Title</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>
      <div
        className={viewMode === "grid" ? "grid grid-cols-4 gap-4" : "space-y-4"}
      >
        {sortedRecipes.map((recipe) => (
          <div key={recipe.id} className="border p-4 rounded shadow">
            <Image
              src={recipe.image_url || DEFAULT_IMAGE_URL}
              alt={recipe.title}
              width={300}
              height={200}
              className="w-full h-40 object-cover mb-2"
            />
            <h3 className="text-lg font-bold">{recipe.title}</h3>
            <p>Rating: {recipe.rating.ratingValue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
