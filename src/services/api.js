const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('cartify_token') || localStorage.getItem('shopsphere_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...getAuthHeaders(), ...options.headers };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};

export const api = {
  sendOtp: (identifier) =>
    request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  verifyOtp: (identifier, otp) =>
    request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp }),
    }),

  getCurrentUser: () => request('/auth/me'),

  checkUserExists: (identifier) =>
    request('/auth/check-user', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  updateProfile: (data) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.min_price !== undefined && params.min_price !== '') query.append('min_price', params.min_price);
    if (params.max_price !== undefined && params.max_price !== '') query.append('max_price', params.max_price);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    return request(`/products?${query.toString()}`);
  },

  getProductById: (id) => request(`/products/${id}`),

  getCategories: () => request('/products/categories'),

  getCart: () => request('/cart'),

  addToCart: (productId, quantity = 1) =>
    request('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateCartItem: (productId, quantity) =>
    request(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (productId) =>
    request(`/cart/${productId}`, {
      method: 'DELETE',
    }),

  mergeGuestCart: (guestItems) =>
    request('/cart/merge', {
      method: 'POST',
      body: JSON.stringify(guestItems),
    }),

  placeOrder: (orderData) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getMyOrders: () => request('/orders/my-orders'),

  getOrderById: (orderId) => request(`/orders/${orderId}`),

  cancelOrder: (orderId, reason = 'Cancelled by customer') =>
    request(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  updateUserOrderStatus: (orderId, status) =>
    request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getDashboardStats: () => request('/admin/dashboard'),

  createProduct: (productData) =>
    request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  deleteProduct: (id) =>
    request(`/admin/products/${id}`, {
      method: 'DELETE',
    }),

  getAdminOrders: (page = 1) => request(`/admin/orders?page=${page}`),

  updateOrderStatus: (orderId, status) =>
    request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getPaymentConfig: () => request('/payments/config'),

  createPaymentIntent: (data) =>
    request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyPayment: (paymentIntentId) =>
    request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ payment_intent_id: paymentIntentId }),
    }),
};
