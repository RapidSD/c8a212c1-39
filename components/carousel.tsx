import { getCollectionProducts, getProducts } from '@/lib/shopify';
import Link from 'next/link';
import { GridTileImage } from './grid/tile';

export async function Carousel() {
  let products: any[] = [];

  try {
    // First try to get products from the specific collection
    products = await getCollectionProducts({ collection: 'hidden-homepage-carousel' });
  } catch (error) {
    // Collection might not exist, that's okay
    console.log('Collection "hidden-homepage-carousel" not found, falling back to any products');
  }

  // If we don't have products from the collection, get any products (limited to 6)
  if (!products?.length) {
    try {
      const allProducts = await getProducts({});
      products = allProducts.slice(0, 6); // Limit to 6 products for carousel
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }

  // Filter out products without featured images
  const productsWithImages = products.filter(product => product.featuredImage?.url);

  if (!productsWithImages?.length) return null;

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...productsWithImages, ...productsWithImages, ...productsWithImages];

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-carousel gap-4">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.handle}${i}`}
            className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
          >
            <Link href={`/product/${product.handle}`} className="relative h-full w-full">
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode
                }}
                src={product.featuredImage?.url || ''}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
