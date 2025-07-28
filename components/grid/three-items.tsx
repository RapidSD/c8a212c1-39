import { GridTileImage } from '@/components/grid/tile';
import { getCollectionProducts, getProducts } from '@/lib/shopify';
import type { Product } from '@/lib/shopify/types';
import Link from 'next/link';

function ThreeItemGridItem({
  item,
  size,
  priority
}: {
  item: Product;
  size: 'full' | 'half';
  priority?: boolean;
}) {
  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={`/product/${item.handle}`}
        prefetch={true}
      >
        <GridTileImage
          src={item.featuredImage?.url || ''}
          fill
          sizes={
            size === 'full' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'
          }
          priority={priority}
          alt={item.title}
          label={{
            position: size === 'full' ? 'center' : 'bottom',
            title: item.title as string,
            amount: item.priceRange.maxVariantPrice.amount,
            currencyCode: item.priceRange.maxVariantPrice.currencyCode
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  let homepageItems: Product[] = [];

  try {
    // First try to get products from the specific collection
    homepageItems = await getCollectionProducts({
      collection: 'hidden-homepage-featured-items'
    });
  } catch (error) {
    // Collection might not exist, that's okay
    console.log('Collection "hidden-homepage-featured-items" not found, falling back to any products');
  }

  // If we don't have enough products from the collection, get any products
  if (homepageItems.length < 3) {
    try {
      const allProducts = await getProducts({});
      // Take the first products that have featured images
      const needed = 3 - homepageItems.length;
      const productsWithImages = allProducts.filter(product => product.featuredImage?.url);
      const additionalProducts = productsWithImages.slice(0, needed);
      homepageItems = [...homepageItems, ...additionalProducts];
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }

  // Filter out any products without featured images and ensure we have exactly 3
  const validProducts = homepageItems.filter(product => product.featuredImage?.url);
  
  // If we still don't have at least 3 products with images, don't render
  if (!validProducts[0] || !validProducts[1] || !validProducts[2]) return null;

  const [firstProduct, secondProduct, thirdProduct] = validProducts;

  return (
    <section className="mx-auto grid max-w-(--breakpoint-2xl) gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </section>
  );
}
