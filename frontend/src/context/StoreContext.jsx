/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { getOrdersApi, createOrderApi, updateOrderStatusApi, getCartApi, saveCartApi, getWishlistApi, saveWishlistApi } from '../api';

const StoreContext = createContext();

const initialState = {
  cart: [], // [{ id, quantity }]
  wishlist: [], // [id]
  orders: [], // [{ id, date, items, total }]
};

const getCustomerKey = (shipping, orderId) => shipping?.email || orderId;

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.cart.find((i) => i.id === action.payload.id);
      const updatedCart = existing
        ? state.cart.map((i) => i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...state.cart, { id: action.payload.id, quantity: 1 }];
      return { ...state, cart: updatedCart };
    }
    case 'REMOVE_FROM_CART': {
      const updatedCart = state.cart.filter((i) => i.id !== action.payload.id);
      return { ...state, cart: updatedCart };
    }
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.includes(action.payload.id);
      const updatedWish = exists
        ? state.wishlist.filter((id) => id !== action.payload.id)
        : [...state.wishlist, action.payload.id];
      return { ...state, wishlist: updatedWish };
    }
    case 'ADD_ORDER': {
      return { ...state, orders: [...state.orders, action.payload] };
    }
    case 'SET_ORDERS': {
      return { ...state, orders: action.payload };
    }
    case 'UPDATE_ORDER_STATUS': {
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.id ? { ...order, status: action.payload.status } : order
        ),
      };
    }
    case 'DELETE_CUSTOMER_ORDERS': {
      return {
        ...state,
        orders: state.orders.filter(
          (order) => getCustomerKey(order.shipping, order.id) !== action.payload.customerKey
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SET_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const getInitialState = () => {
  if (typeof window === 'undefined') return initialState;
  const stored = localStorage.getItem('storeState');
  return stored ? JSON.parse(stored) : initialState;
};

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);
  const cartLoadedRef = useRef(false);
  const hydratedRef = useRef(false);

  // Sync state with backend in parallel
  useEffect(() => {
    let mounted = true;
    async function syncState() {
      const stored = localStorage.getItem('storeState');
      const storedState = stored ? JSON.parse(stored) : null;
      
      const results = await Promise.allSettled([
        getCartApi(),
        getWishlistApi(),
        getOrdersApi()
      ]);
      
      if (!mounted) return;

      const cartRes = results[0];
      const wishlistRes = results[1];
      const ordersRes = results[2];

      const updates = {};

      if (cartRes.status === 'fulfilled' && Array.isArray(cartRes.value)) {
        updates.cart = cartRes.value;
      } else if (storedState && Array.isArray(storedState.cart) && storedState.cart.length > 0) {
        saveCartApi(storedState.cart).catch(() => {});
      }

      if (wishlistRes.status === 'fulfilled' && Array.isArray(wishlistRes.value)) {
        updates.wishlist = wishlistRes.value;
      } else if (storedState && Array.isArray(storedState.wishlist) && storedState.wishlist.length > 0) {
        saveWishlistApi(storedState.wishlist).catch(() => {});
      }

      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        updates.orders = ordersRes.value;
      }

      if (Object.keys(updates).length > 0) {
        dispatch({ type: 'SET_STATE', payload: updates });
      }

      cartLoadedRef.current = true;
      hydratedRef.current = true;
    }

    syncState();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist local cart and wishlist state after hydration
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem('storeState', JSON.stringify({
      cart: state.cart,
      wishlist: state.wishlist,
      orders: state.orders,
    }));
  }, [state.cart, state.wishlist, state.orders]);

  useEffect(() => {
    if (!cartLoadedRef.current) return;
    saveCartApi(state.cart).catch((err) => {
      console.error('Could not save cart to backend:', err.message);
    });
  }, [state.cart]);

  useEffect(() => {
    if (!cartLoadedRef.current) return;
    saveWishlistApi(state.wishlist).catch((err) => {
      console.error('Could not save wishlist to backend:', err.message);
    });
  }, [state.wishlist]);

  const addToCart = (id) => {
    dispatch({ type: 'ADD_TO_CART', payload: { id } });
  };

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
  };

  const toggleWishlist = (id) => dispatch({ type: 'TOGGLE_WISHLIST', payload: { id } });

  const addOrder = async (order) => {
    dispatch({ type: 'ADD_ORDER', payload: order });
    try {
      await createOrderApi(order);
    } catch (err) {
      console.error('Could not save order to backend:', err.message);
    }
  };

  const updateOrderStatus = async (id, status) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id, status } });
    try {
      await updateOrderStatusApi(id, status);
    } catch (err) {
      console.error('Could not update order status:', err.message);
    }
  };

  const deleteCustomerOrders = (customerKey) => {
    dispatch({ type: 'DELETE_CUSTOMER_ORDERS', payload: { customerKey } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <StoreContext.Provider value={{ state, addToCart, removeFromCart, toggleWishlist, addOrder, updateOrderStatus, deleteCustomerOrders, clearCart }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
