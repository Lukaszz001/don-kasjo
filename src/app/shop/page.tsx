import type { Metadata } from "next"
import { getShopItems } from "@/lib/db/data"
import { ShopContent } from "@/components/shop/shop-content"

export const metadata: Metadata = {
  title: "Sklep",
  description: "Wymieniaj zebrane punkty na nagrody, kody i ekskluzywne przedmioty w sklepie Don Kasjo.",
}

export default async function ShopPage() {
  const items = await getShopItems()

  return <ShopContent initialItems={items} />
}

export const revalidate = 30
