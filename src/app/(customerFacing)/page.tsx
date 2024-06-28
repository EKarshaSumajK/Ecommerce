import { ProductCard, ProductCardSkeleton } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { toggleProductAvailability } from "../admin/_actions/product";
import { Suspense } from "react";
import { cache } from "@/lib/cache";

export default function HomePage() {
  return (
    <main className="space-y-12">
      <ProductGridSection
        title="Most Popular"
        productsFetcher={getPopularProducts}
      ></ProductGridSection>
      <ProductGridSection
        title="Newest"
        productsFetcher={getNewProducts}
      ></ProductGridSection>
    </main>
  );
}

const getPopularProducts = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { orders: { _count: "desc" } },
      take: 6,
    });
  },
  ["/", "getMostPopularProducts"],
  { revalidate: 60 * 60 * 24 }
);
const getNewProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}, ["/", "getNewestProducts"]);
function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
type ProductGridSectionProps = {
  title: string;
  productsFetcher: () => Promise<Product[]>;
};
async function ProductGridSection({
  productsFetcher,
  title,
}: ProductGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" className="space-x-2" asChild>
          <Link href="/products">
            <span>View All</span> <ArrowRight className="size-4"></ArrowRight>
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton></ProductCardSkeleton>
              <ProductCardSkeleton></ProductCardSkeleton>
              <ProductCardSkeleton></ProductCardSkeleton>
            </>
          }
        >
          <ProductSuspense productsFetcher={productsFetcher}></ProductSuspense>
        </Suspense>
        {}
      </div>
    </div>
  );
}

async function ProductSuspense({
  productsFetcher,
}: {
  productsFetcher: () => Promise<Product[]>;
}) {
  return (await productsFetcher()).map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
