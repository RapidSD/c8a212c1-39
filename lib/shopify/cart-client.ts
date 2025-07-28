import type { Cart } from './types';

const CART_STORAGE_KEY = 'shopify_cart_id';

// Environment variables for Storefront API
// Read environment variables with fallbacks for WebContainer
const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_SHOP || '';
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

// GraphQL mutations and queries
const CREATE_CART_MUTATION = `
  mutation cartCreate {
    cartCreate {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    handle
                    title
                    featuredImage {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    handle
                    title
                    featuredImage {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_CART_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    handle
                    title
                    featuredImage {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const REMOVE_FROM_CART_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    handle
                    title
                    featuredImage {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_CART_QUERY = `
  query cart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                selectedOptions {
                  name
                  value
                }
                product {
                  id
                  handle
                  title
                  featuredImage {
                    url
                    altText
                    width
                    height
                  }
                }
              }
            }
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

// Storefront API fetch function
async function storefrontFetch<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  if (!SHOPIFY_DOMAIN || !STOREFRONT_ACCESS_TOKEN) {
    throw new Error('Missing Shopify configuration. Please set NEXT_PUBLIC_SHOPIFY_SHOP and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  }

  const endpoint = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Shopify API error');
  }

  return result.data;
}

// Helper to reshape cart data
function reshapeCart(cart: any): Cart {
  if (!cart) {
    return createEmptyCart();
  }

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    lines: cart.lines.edges.map((edge: any) => ({
      id: edge.node.id,
      quantity: edge.node.quantity,
      cost: {
        totalAmount: {
          amount: edge.node.cost.totalAmount.amount,
          currencyCode: edge.node.cost.totalAmount.currencyCode
        }
      },
      merchandise: {
        id: edge.node.merchandise.id,
        title: edge.node.merchandise.title,
        selectedOptions: edge.node.merchandise.selectedOptions,
        product: {
          id: edge.node.merchandise.product.id,
          handle: edge.node.merchandise.product.handle,
          title: edge.node.merchandise.product.title,
          featuredImage: edge.node.merchandise.product.featuredImage
        }
      }
    })),
    cost: {
      totalAmount: {
        amount: cart.cost.totalAmount.amount,
        currencyCode: cart.cost.totalAmount.currencyCode
      },
      subtotalAmount: {
        amount: cart.cost.subtotalAmount.amount,
        currencyCode: cart.cost.subtotalAmount.currencyCode
      },
      totalTaxAmount: cart.cost.totalTaxAmount ? {
        amount: cart.cost.totalTaxAmount.amount,
        currencyCode: cart.cost.totalTaxAmount.currencyCode
      } : {
        amount: '0.0',
        currencyCode: cart.cost.totalAmount.currencyCode
      }
    }
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: '',
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
    }
  };
}

// Cart storage functions
export function getStoredCartId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CART_STORAGE_KEY);
}

export function storeCartId(cartId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, cartId);
}

export function removeStoredCartId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
}

// Cart operations
export async function createCart(): Promise<Cart> {
  console.log('🆕 Creating new cart...');
  
  const data = await storefrontFetch<{ cartCreate: any }>(CREATE_CART_MUTATION);
  
  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  
  const cart = reshapeCart(data.cartCreate.cart);
  
  if (cart.id) {
    storeCartId(cart.id);
    console.log('✅ Cart created with ID:', cart.id);
  }
  
  return cart;
}

export async function getCart(): Promise<Cart | null> {
  const cartId = getStoredCartId();
  
  if (!cartId) {
    console.log('🛒 No stored cart ID found');
    return null;
  }

  try {
    console.log('🔍 Fetching cart with ID:', cartId);
    
    const data = await storefrontFetch<{ cart: any }>(GET_CART_QUERY, { cartId });
    
    if (!data.cart) {
      console.log('🗑️ Cart not found, removing stored ID');
      removeStoredCartId();
      return null;
    }

    const cart = reshapeCart(data.cart);
    console.log('✅ Cart fetched successfully');
    return cart;
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    removeStoredCartId();
    return null;
  }
}

export async function addToCart(merchandiseId: string, quantity: number = 1): Promise<Cart> {
  console.log('➕ Adding to cart:', { merchandiseId, quantity });
  
  let cartId = getStoredCartId();
  
  // Create cart if it doesn't exist
  if (!cartId) {
    console.log('🆕 No cart exists, creating new one...');
    const newCart = await createCart();
    cartId = newCart.id!;
  }

  const data = await storefrontFetch<{ cartLinesAdd: any }>(ADD_TO_CART_MUTATION, {
    cartId,
    lines: [{ merchandiseId, quantity }]
  });

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }

  const cart = reshapeCart(data.cartLinesAdd.cart);
  console.log('✅ Items added to cart');
  return cart;
}

export async function updateCartLine(lineId: string, quantity: number): Promise<Cart> {
  console.log('🔄 Updating cart line:', { lineId, quantity });
  
  const cartId = getStoredCartId();
  if (!cartId) {
    throw new Error('No cart found');
  }

  const data = await storefrontFetch<{ cartLinesUpdate: any }>(UPDATE_CART_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }]
  });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors[0].message);
  }

  const cart = reshapeCart(data.cartLinesUpdate.cart);
  console.log('✅ Cart line updated');
  return cart;
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  console.log('🗑️ Removing from cart:', { lineIds });
  
  const cartId = getStoredCartId();
  if (!cartId) {
    throw new Error('No cart found');
  }

  const data = await storefrontFetch<{ cartLinesRemove: any }>(REMOVE_FROM_CART_MUTATION, {
    cartId,
    lineIds
  });

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors[0].message);
  }

  const cart = reshapeCart(data.cartLinesRemove.cart);
  console.log('✅ Items removed from cart');
  return cart;
} 