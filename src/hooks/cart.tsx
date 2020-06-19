import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();

      const storedProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      if (storedProducts) {
        setProducts([...JSON.parse(storedProducts)]);
      }

      // console.log(products);
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // await AsyncStorage.clear();
      const productExists = products.find(p => p.id === product.id);

      if (productExists) {
        setProducts(
          products.map(newProduct =>
            newProduct.id === product.id
              ? { ...newProduct, quantity: newProduct.quantity + 1 }
              : newProduct,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newItems = products.map(productId =>
        productId.id === id
          ? { ...productId, quantity: productId.quantity + 1 }
          : productId,
      );

      setProducts(newItems);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newItems),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newItems = products.map(productId =>
        productId.id === id
          ? { ...productId, quantity: productId.quantity - 1 }
          : productId,
      );

      setProducts(newItems);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newItems),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
