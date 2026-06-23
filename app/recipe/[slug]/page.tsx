import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCreator, getRecipe } from "@/lib/api";
import { canvasNodes } from "@/lib/mock-data";
import { SiteHeader } from "@/components/SiteHeader";
import { RecipeView } from "@/components/recipe/RecipeView";

export function generateStaticParams() {
  return canvasNodes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) return { title: "ykk" };
  return {
    title: `${recipe.title} · ykk`,
    description: recipe.summary,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) notFound();

  const creator = getCreator(recipe.creatorId);
  const related = canvasNodes
    .filter((n) => n.regionId === recipe.regionId && n.slug !== recipe.slug)
    .slice(0, 6);

  return (
    <>
      <SiteHeader />
      <RecipeView recipe={recipe} creator={creator} related={related} />
    </>
  );
}
