import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Mobiles',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Books',
  'Sports',
  'Accessories',
];

const ORDER_STATUSES = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_products: 0, total_orders: 0, total_users: 0, total_sales: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Add or Edit Product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Electronics',
    brand: '',
    price: '',
    original_price: '',
    stock: '',
    image: '',
    description: '',
  });

  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, prodsData, ordersData] = await Promise.all([
        api.getDashboardStats(),
        api.getProducts({ limit: 100 }),
        api.getAdminOrders(1),
      ]);
      setStats(statsData);
      setProducts(prodsData.products || []);
      setOrders(ordersData.orders || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type, text) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4000);
  };

  // Open modal for new product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Electronics',
      brand: '',
      price: '',
      original_price: '',
      stock: '',
      image: '',
      description: '',
    });
    setShowProductModal(true);
  };

  // Open modal for edit product
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      brand: p.brand || '',
      price: p.price,
      original_price: p.original_price || '',
      stock: p.stock,
      image: p.image || '',
      description: p.description || '',
    });
    setShowProductModal(true);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        category: productForm.category,
        brand: productForm.brand || undefined,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : undefined,
        stock: parseInt(productForm.stock, 10),
        image: productForm.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        description: productForm.description,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showNotification('success', 'Product updated successfully!');
      } else {
        await api.createProduct(payload);
        showNotification('success', 'New product created successfully!');
      }

      setShowProductModal(false);
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Operation failed');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      showNotification('success', 'Product deleted.');
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Delete failed');
    }
  };

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showNotification('success', `Order status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Status update failed');
    }
  };

  return (
    <div className="container section">
      <div className="section-header">
        <div>
          <h1 className="section-title">Admin Management Dashboard</h1>
          <p className="section-subtitle">Real-time store metrics, inventory control, and fulfillment</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {feedbackMsg.text && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            backgroundColor: feedbackMsg.type === 'error' ? 'var(--danger-light)' : 'var(--success-light)',
            color: feedbackMsg.type === 'error' ? 'var(--danger)' : '#14532d',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {feedbackMsg.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.total_products}</div>
            <div className="stat-title">Catalog Products</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--secondary)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.total_orders}</div>
            <div className="stat-title">Total Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.total_users}</div>
            <div className="stat-title">Registered Customers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fdf2f8', color: '#db2777' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="stat-value">₹{stats.total_sales?.toLocaleString()}</div>
            <div className="stat-title">Total Revenue</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('products')}
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Manage Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Manage Orders ({orders.length})
        </button>
      </div>
      {activeTab === 'products' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                      alt={p.name}
                      style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand || 'No brand'}</div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td style={{ fontWeight: 700 }}>₹{p.price?.toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${p.stock > 0 ? 'badge-stock' : 'badge-stock-out'}`}
                    >
                      {p.stock} in stock
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="btn btn-secondary btn-sm"
                        title="Edit product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'orders' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id || o.order_id}>
                  <td style={{ fontWeight: 700 }}>{o.order_id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.shipping_address?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.shipping_address?.phone}</div>
                  </td>
                  <td>{o.items?.length} items</td>
                  <td style={{ fontWeight: 800 }}>₹{o.total_amount?.toLocaleString()}</td>
                  <td>
                    <span className="badge badge-stock">{o.order_status}</span>
                  </td>
                  <td>
                    <select
                      value={o.order_status}
                      onChange={(e) => handleStatusChange(o.id || o.order_id, e.target.value)}
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showProductModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="btn btn-secondary btn-sm">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Brand
                  </label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Description *
                </label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
