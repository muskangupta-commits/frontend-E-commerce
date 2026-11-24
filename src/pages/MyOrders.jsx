import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Package, Clock, Eye, ShoppingBag } from 'lucide-react';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Delivered':
      return 'badge-discount';
    case 'Shipped':
    case 'Processing':
    case 'Confirmed':
      return 'badge-stock';
    case 'Cancelled':
      return 'badge-stock-out';
    default:
      return 'badge-rating';
  }
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.getMyOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <Package className="empty-state-icon" />
          <h3>No Orders Placed Yet</h3>
          <p>You haven't placed any orders yet. Discover our catalog and place your first order!</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-header">
        <div>
          <h1 className="section-title">My Orders</h1>
          <p className="section-subtitle">Track and review your recent purchases</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {orders.map((order) => {
          const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={order.id || order.order_id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.85rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      {order.order_id}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Placed on {dateStr}
                    {order.order_status === 'Cancelled' && order.cancellation_reason && (
                      <span style={{ color: 'var(--danger)', marginLeft: '0.5rem' }}>
                        • Cancelled: {order.cancellation_reason}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: order.order_status === 'Cancelled' ? 'var(--text-muted)' : 'var(--primary)',
                        textDecoration: order.order_status === 'Cancelled' ? 'line-through' : 'none',
                      }}
                    >
                      ₹{order.total_amount?.toLocaleString()}
                    </div>
                  </div>

                  <Link
                    to={`/orders/${order.id || order.order_id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    <Eye size={15} />
                    <span>{order.order_status === 'Cancelled' ? 'View Details' : 'Track & Manage'}</span>
                  </Link>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0.5rem 0' }}>
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: 'var(--bg-subtle)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      minWidth: '220px',
                    }}
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                      alt={item.name}
                      style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <div style={{ fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
