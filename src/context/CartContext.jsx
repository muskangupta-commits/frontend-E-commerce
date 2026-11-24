import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('shopsphere_guest_cart');
    return saved ? JSON.parse(saved) : { items: [], subtotal: 0, delivery_charge: 0, total: 0, item_count: 0 };
  });
  const [loading, setLoading] = useState(false);

  const calcGuestCart = (items) => {
    let subtotal = 0;
    let count = 0;
    items.forEach((item) => {
      subtotal += (item.product?.price || 0) * item.quantity;
      count += item.quantity;
    });
    const delivery_charge = subtotal >= 500 || items.length === 0 ? 0 : 40;
    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      delivery_charge,
      total: Math.round((subtotal + delivery_charge) * 100) / 100,
      item_count: count,
    };
  };

  const fetchBackendCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const serverCart = await api.getCart();
      setCart(serverCart);
    } catch (err) {
      console.error('Failed to load server cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const syncOnLogin = async () => {
      if (isAuthenticated) {
        const guestSaved = localStorage.getItem('cartify_guest_cart') || localStorage.getItem('shopsphere_guest_cart');
        if (guestSaved) {
          try {
            const guestCart = JSON.parse(guestSaved);
            if (guestCart.items && guestCart.items.length > 0) {
              const mergePayload = guestCart.items.map((i) => ({
                product_id: i.product_id,
                quantity: i.quantity,
              }));
              await api.mergeGuestCart(mergePayload);
              localStorage.removeItem('cartify_guest_cart');
              localStorage.removeItem('shopsphere_guest_cart');
            }
          } catch (e) {
            console.error('Guest cart merge error:', e);
          }
        }
        fetchBackendCart();
      } else {
        const saved = localStorage.getItem('cartify_guest_cart') || localStorage.getItem('shopsphere_guest_cart');
        setCart(saved ? JSON.parse(saved) : { items: [], subtotal: 0, delivery_charge: 0, total: 0, item_count: 0 });
      }
    };

    syncOnLogin();
  }, [isAuthenticated, fetchBackendCart]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cartify_guest_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const updated = await api.addToCart(product.id, quantity);
        setCart(updated);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    } else {
      let newItems = [...cart.items];
      const existingIdx = newItems.findIndex((i) => i.product_id === product.id);

      if (existingIdx > -1) {
        const newQty = newItems[existingIdx].quantity + quantity;
        if (newQty > product.stock) {
          return { success: false, error: `Only ${product.stock} units available in stock.` };
        }
        newItems[existingIdx].quantity = newQty;
        newItems[existingIdx].line_total = newQty * product.price;
      } else {
        if (quantity > product.stock) {
          return { success: false, error: `Only ${product.stock} units available in stock.` };
        }
        newItems.push({
          product_id: product.id,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            image: product.image,
            category: product.category,
            stock: product.stock,
          },
          quantity,
          line_total: quantity * product.price,
        });
      }

      setCart(calcGuestCart(newItems));
      return { success: true };
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      return removeFromCart(productId);
    }

    if (isAuthenticated) {
      try {
        const updated = await api.updateCartItem(productId, newQuantity);
        setCart(updated);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    } else {
      let newItems = cart.items.map((item) => {
        if (item.product_id === productId) {
          if (newQuantity > (item.product?.stock || 999)) {
            return item;
          }
          return {
            ...item,
            quantity: newQuantity,
            line_total: newQuantity * (item.product?.price || 0),
          };
        }
        return item;
      });
      setCart(calcGuestCart(newItems));
      return { success: true };
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const updated = await api.removeFromCart(productId);
        setCart(updated);
      } catch (err) {
        console.error('Failed to remove item:', err.message);
      }
    } else {
      const newItems = cart.items.filter((i) => i.product_id !== productId);
      setCart(calcGuestCart(newItems));
    }
  };

  const clearCart = () => {
    setCart({ items: [], subtotal: 0, delivery_charge: 0, total: 0, item_count: 0 });
    localStorage.removeItem('shopsphere_guest_cart');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchBackendCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
