import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import {
  PackageCheck,
  CheckCircle2,
  Clock,
  Truck,
  Box,
  MapPin,
  ArrowLeft,
  AlertCircle,
  Check,
  XCircle,
  Ban,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  FastForward,
  Play,
  Pause,
  Timer,
  RefreshCw,
  Phone,
  ShieldCheck,
  Navigation,
  Sparkles,
} from 'lucide-react';

const STATUS_STEPS = [
  { label: 'Order Placed', icon: Clock },
  { label: 'Confirmed', icon: CheckCircle2 },
  { label: 'Processing', icon: Box },
  { label: 'Shipped', icon: Truck },
  { label: 'Delivered', icon: PackageCheck },
];

const CANCEL_REASONS = [
  'Ordered by mistake / Duplicate order',
  'Found a better price elsewhere',
  'Need to change shipping address or phone',
  'Delivery time is too long',
  'Decided on another product',
  'Other reason',
];

const OrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const isNewOrder = location.state?.newOrder;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2-Minute Express Delivery Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSecondsLeft, setSimSecondsLeft] = useState(120); // 2 minutes (120 seconds)
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.getOrderById(id);
        setOrder(data);
        if (data.order_status === 'Delivered') {
          setSimSecondsLeft(0);
        } else {
          const idx = STATUS_STEPS.findIndex((s) => s.label === data.order_status);
          if (idx >= 0) {
            setSimSecondsLeft(Math.max(0, (STATUS_STEPS.length - 1 - idx) * 30));
          }
        }
      } catch (err) {
        setError(err.message || 'Unable to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Handle Order Status Update (Persists to MongoDB)
  const handleUpdateStatus = async (newStatus) => {
    if (!order || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await api.updateUserOrderStatus(order.id || order.order_id, newStatus);
      if (res && res.order) {
        setOrder(res.order);
      } else {
        setOrder((prev) => ({ ...prev, order_status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update order status on server:', err);
      // Fallback local update
      setOrder((prev) => ({ ...prev, order_status: newStatus }));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Step-by-step advance: Order Placed -> Confirmed -> Processing -> Shipped -> Delivered
  const handleAdvanceStatus = () => {
    if (!order) return;
    const currentIndex = STATUS_STEPS.findIndex((s) => s.label === order.order_status);
    if (currentIndex < STATUS_STEPS.length - 1) {
      const nextStatus = STATUS_STEPS[currentIndex + 1].label;
      handleUpdateStatus(nextStatus);
      const remainingForStep = (STATUS_STEPS.length - 1 - (currentIndex + 1)) * 30;
      setSimSecondsLeft(remainingForStep);
      if (nextStatus === 'Delivered') {
        setIsSimulating(false);
      }
    } else {
      // If already Delivered, reset to 'Order Placed' so user can test again
      handleUpdateStatus('Order Placed');
      setSimSecondsLeft(120);
      setIsSimulating(false);
    }
  };

  // Toggle 2-Minute Simulation
  const toggleSimulation = () => {
    if (!order) return;
    if (order.order_status === 'Delivered') {
      handleUpdateStatus('Order Placed');
      setSimSecondsLeft(120);
      setIsSimulating(true);
    } else {
      setIsSimulating((prev) => !prev);
    }
  };

  // 2-Minute Simulation Countdown Effect (Progresses across 120s max)
  useEffect(() => {
    let timer = null;
    if (isSimulating && simSecondsLeft > 0 && order?.order_status !== 'Cancelled') {
      timer = setInterval(() => {
        setSimSecondsLeft((prev) => {
          if (prev <= 1) {
            handleUpdateStatus('Delivered');
            setIsSimulating(false);
            return 0;
          }
          const next = prev - 1;
          // Progress through stages:
          // 120-91s: Order Placed
          // 90-61s: Confirmed
          // 60-31s: Processing
          // 30-1s: Shipped
          // 0s: Delivered
          if (next === 90 && order?.order_status !== 'Confirmed') {
            handleUpdateStatus('Confirmed');
          } else if (next === 60 && order?.order_status !== 'Processing') {
            handleUpdateStatus('Processing');
          } else if (next === 30 && order?.order_status !== 'Shipped') {
            handleUpdateStatus('Shipped');
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulating, simSecondsLeft, order?.order_status]);

  const handleCancelOrder = async (e) => {
    if (e) e.preventDefault();
    setCancelling(true);
    setCancelError('');

    const finalReason = selectedReason === 'Other reason' && customReason.trim()
      ? customReason.trim()
      : selectedReason;

    try {
      const res = await api.cancelOrder(order.id || order.order_id, finalReason);
      setOrder(res.order);
      setShowCancelModal(false);
      setIsSimulating(false);
      setCancelSuccessMsg('Your order has been cancelled successfully.');
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };


  if (loading) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container section">
        <div className="empty-state">
          <AlertCircle className="empty-state-icon" color="var(--danger)" />
          <h3>Order Not Found</h3>
          <p>{error || 'We could not locate this order.'}</p>
          <Link to="/orders" className="btn btn-primary">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const isDelivered = order.order_status === 'Delivered';
  const isCancelled = order.order_status === 'Cancelled';
  const currentStatusIndex = STATUS_STEPS.findIndex((s) => s.label === order.order_status);
  const canCancel = !isCancelled && !isDelivered;

  // Format 2-minute timer display
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Base timestamps for dummy tracking data
  const baseTime = order?.created_at ? new Date(order.created_at) : new Date();
  const formatOffsetTime = (secondsOffset) => {
    const t = new Date(baseTime.getTime() + secondsOffset * 1000);
    return t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Milestone Dummy Data (Calculated across max 2 minutes = 120 seconds)
  const DUMMY_TRACKING_MILESTONES = [
    {
      status: 'Order Placed',
      stepIdx: 0,
      title: 'Order Verified & Payment Received',
      time: formatOffsetTime(0),
      offset: '+0s',
      detail: `Order registered via ${order.payment_method || 'Online'}. Inventory allocated at Cartify central warehouse.`,
      location: 'Madhya Pradesh Fulfillment Hub, Indore',
    },
    {
      status: 'Confirmed',
      stepIdx: 1,
      title: 'Order Confirmed by Merchant',
      time: formatOffsetTime(30),
      offset: '+30s',
      detail: 'Merchant confirmed stock. Digital tax invoice and GST manifest generated.',
      location: 'Seller Sorting Facility',
    },
    {
      status: 'Processing',
      stepIdx: 2,
      title: 'Packed & Ready for Dispatch',
      time: formatOffsetTime(60),
      offset: '+60s',
      detail: 'Securely packed in eco-friendly bubble-wrap with tamper-evident seal and barcoded.',
      location: 'Hub Packaging Bay 4',
    },
    {
      status: 'Shipped',
      stepIdx: 3,
      title: 'Out for Delivery (Express Courier)',
      time: formatOffsetTime(90),
      offset: '+90s',
      detail: 'Assigned to Express Rider Rahul Sharma (Cartify Prime). Electric vehicle en route to delivery address.',
      location: 'Last-Mile Transit (Within 1.5 km)',
    },
    {
      status: 'Delivered',
      stepIdx: 4,
      title: 'Delivered to Customer (2 Min Guarantee)',
      time: formatOffsetTime(120),
      offset: '+120s (2 min max)',
      detail: 'Package handed over safely to recipient. Delivered within maximum 2-minute express delivery window.',
      location: `${order.shipping_address?.city || 'Customer Doorstep'}, ${order.shipping_address?.postal_code || ''}`,
    },
  ];

  // Timeline Progress Percentage (0% -> 25% -> 50% -> 75% -> 100%)
  const progressPercent = isCancelled
    ? 0
    : isDelivered
    ? 100
    : (currentStatusIndex / (STATUS_STEPS.length - 1)) * 100;

  return (
    <div className="container section">
      <Link to="/orders" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> All Orders
      </Link>

      {/* NEW ORDER SUCCESS BANNER */}
      {isNewOrder && !isCancelled && (
        <div
          style={{
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success)',
            color: '#14532d',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <CheckCircle2 size={26} color="var(--success)" />
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#14532d' }}>Order Placed Successfully!</h4>
            <p style={{ fontSize: '0.9rem', color: '#166534' }}>
              Thank you for shopping with Cartify. Your order <strong>{order.order_id}</strong> is registered and will be shipped soon.
            </p>
          </div>
        </div>
      )}

      {/* CANCELLED SUCCESS ALERT */}
      {cancelSuccessMsg && (
        <div
          style={{
            backgroundColor: 'var(--danger-light)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <XCircle size={24} color="var(--danger)" />
          <div style={{ fontWeight: 600 }}>{cancelSuccessMsg}</div>
        </div>
      )}

      {/* ORDER TRACKING & STATUS CARD */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Order Tracking: {order.order_id}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Placed on {new Date(order.created_at).toLocaleString('en-IN')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{
                fontSize: '0.92rem',
                padding: '0.45rem 0.95rem',
                backgroundColor: isCancelled
                  ? 'var(--danger-light)'
                  : isDelivered
                  ? 'var(--success-light)'
                  : 'var(--primary-light)',
                color: isCancelled
                  ? 'var(--danger)'
                  : isDelivered
                  ? 'var(--success)'
                  : 'var(--primary)',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {isDelivered ? <CheckCircle2 size={16} /> : isCancelled ? <Ban size={16} /> : <Clock size={16} />}
              Status: {order.order_status}
            </span>

            {!isCancelled && (
              <>
                {/* BUTTON 1: STEP-BY-STEP PROGRESSION BUTTON */}
                <button
                  onClick={handleAdvanceStatus}
                  disabled={updatingStatus}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                  title="Advance to next delivery stage: Confirmed → Processing → Shipped → Delivered"
                >
                  {updatingStatus ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : isDelivered ? (
                    <RotateCcw size={14} />
                  ) : (
                    <FastForward size={14} />
                  )}
                  {isDelivered
                    ? '↺ Reset to Order Placed'
                    : currentStatusIndex === 0
                    ? '▶ Advance to Confirmed'
                    : currentStatusIndex === 1
                    ? '▶ Advance to Processing'
                    : currentStatusIndex === 2
                    ? '▶ Advance to Shipped'
                    : '▶ Advance to Delivered'}
                </button>

                {/* BUTTON 2: 2-MINUTE LIVE DELIVERY SIMULATION BUTTON */}
                <button
                  onClick={toggleSimulation}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    backgroundColor: isSimulating ? 'var(--primary-light)' : 'transparent',
                    borderColor: isSimulating ? 'var(--primary)' : 'var(--border-strong)',
                    color: isSimulating ? 'var(--primary)' : 'var(--text-main)',
                  }}
                  title="Simulate 2-minute live delivery with countdown timer"
                >
                  {isSimulating ? (
                    <>
                      <Pause size={14} />
                      <span>Simulating ({formatTimer(simSecondsLeft)})</span>
                    </>
                  ) : isDelivered ? (
                    <>
                      <Sparkles size={14} color="var(--success)" />
                      <span>Delivered in 2 Min</span>
                    </>
                  ) : (
                    <>
                      <Timer size={14} color="var(--primary)" />
                      <span>⚡ Start 2-Min Live Delivery</span>
                    </>
                  )}
                </button>
              </>
            )}

            {/* QUICK CANCEL BUTTON IF ACTIVE */}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn btn-secondary btn-sm"
                style={{
                  color: 'var(--danger)',
                  borderColor: 'var(--danger)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.85rem',
                }}
              >
                <Ban size={15} /> Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* CANCELLED ORDER DETAILS BANNER */}
        {isCancelled ? (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--danger-light)',
              border: '1.5px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.05rem' }}>
              <Ban size={20} /> Order Cancelled
            </div>
            {order.cancellation_reason && (
              <div style={{ fontSize: '0.9rem' }}>
                <strong>Reason:</strong> {order.cancellation_reason}
              </div>
            )}
            <div style={{ fontSize: '0.88rem', marginTop: '0.25rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-sm)' }}>
              {order.payment_method === 'COD' ? (
                <span>💵 <strong>Cash on Delivery:</strong> No payment was collected. No refund required.</span>
              ) : (
                <span>
                  💳 <strong>Stripe Refund:</strong> Full refund of ₹{order.total_amount?.toLocaleString()} has been initiated to your original payment method. Expected credit in 5-7 business days.
                </span>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="tracking-timeline">
              <div
                className="timeline-progress-fill"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
              {STATUS_STEPS.map((step, idx) => {
                const isStepCompleted = isDelivered ? true : idx < currentStatusIndex;
                const isStepActive = !isDelivered && idx === currentStatusIndex;
                const StepIcon = step.icon;

                let statusClass = '';
                if (isStepCompleted) statusClass = 'completed';
                else if (isStepActive) statusClass = 'active';

                return (
                  <div key={step.label} className={`timeline-step ${statusClass}`}>
                    <div className="timeline-dot">
                      {isStepCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                    </div>
                    <span className="timeline-label">{step.label}</span>
                  </div>
                );
              })}
            </div>

            {/* CELEBRATION DELIVERED BANNER */}
            {isDelivered && (
              <div
                style={{
                  backgroundColor: 'var(--success-light)',
                  border: '1.5px solid var(--success)',
                  color: '#14532d',
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <CheckCircle2 size={30} color="var(--success)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.12rem', color: '#14532d' }}>
                    🎉 Order Delivered Successfully!
                  </div>
                  <div style={{ fontSize: '0.92rem', color: '#166534', marginTop: '0.2rem' }}>
                    Your order <strong>{order.order_id}</strong> was delivered to your address within the <strong>2-minute maximum express delivery window</strong>. Verified via Customer OTP <strong>5829</strong>.
                  </div>
                </div>
              </div>
            )}

            {/* 2-MINUTE LIVE DELIVERY DUMMY TRACKING CARD (SECTION 3) */}
            <div className="live-delivery-box">
              <div className="live-delivery-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span className="delivery-badge-pill" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                      <span className="pulse-circle" />
                      {isDelivered ? 'DELIVERY COMPLETE' : 'LIVE EXPRESS TRACKING'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Max Delivery Time: <strong>2 Minutes (Demo Mode)</strong>
                    </span>
                  </div>
                  <h4 style={{ margin: '0.5rem 0 0.2rem', fontSize: '1.15rem', fontWeight: 800 }}>
                    {isDelivered ? 'Delivered Within 2 Minutes' : 'Superfast Guaranteed 2-Minute Delivery'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                    {isDelivered
                      ? `Package safely handed over at ${formatOffsetTime(120)}`
                      : 'Track real-time rider progression and handover verification OTP'}
                  </p>
                </div>

                {/* COUNTDOWN TIMER BADGE */}
                <div className="delivery-timer-display" title="2-minute maximum delivery countdown">
                  <Timer size={20} color={isDelivered ? 'var(--success)' : 'var(--primary)'} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isDelivered ? 'Delivered In' : 'Time Remaining'}
                    </div>
                    <span style={{ color: isDelivered ? 'var(--success)' : 'var(--primary)' }}>
                      {isDelivered ? '02:00 MAX' : formatTimer(simSecondsLeft)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR (0 - 120 SECONDS) */}
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: isDelivered ? '100%' : `${Math.min(100, Math.round(((120 - simSecondsLeft) / 120) * 100))}%`,
                    height: '100%',
                    background: isDelivered ? 'var(--success)' : 'linear-gradient(90deg, var(--primary) 0%, #38bdf8 100%)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              {/* TWO COLUMN GRID: COURIER AGENT & LIVE MILESTONES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {/* COURIER & AGENT DETAILS */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Express Courier Partner
                      </span>
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                        ✓ Verified Agent
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                        }}
                      >
                        RS
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>Rahul Sharma</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          ★ 4.9 Rating • 1,420+ 2-Min Deliveries
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <Navigation size={15} color="var(--primary)" />
                        <span>
                          <strong>Vehicle:</strong> Electric Scooter (MP-09-EV-4412)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <Phone size={15} color="var(--primary)" />
                        <span>
                          <strong>Helpline:</strong> +91 98765 43210
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DELIVERY OTP BADGE */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1.5px dashed var(--primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Delivery Verification OTP</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.15em' }}>5829</div>
                    </div>
                    <ShieldCheck size={26} color="var(--primary)" />
                  </div>
                </div>

                {/* DUMMY TRACKING MILESTONES / EVENT LOG */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Live Milestones (Max 2 Min)</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{order.order_status}</span>
                  </div>

                  <div className="delivery-milestones-list">
                    {DUMMY_TRACKING_MILESTONES.map((item) => {
                      const isMilestoneCompleted = isDelivered ? true : item.stepIdx < currentStatusIndex;
                      const isMilestoneActive = !isDelivered && item.stepIdx === currentStatusIndex;
                      const itemClass = isMilestoneCompleted ? 'completed' : isMilestoneActive ? 'active' : 'pending';

                      return (
                        <div key={item.status} className={`milestone-item ${itemClass}`}>
                          <div className={`milestone-icon-wrap ${itemClass}`}>
                            {isMilestoneCompleted ? <Check size={14} /> : isMilestoneActive ? <Clock size={14} /> : <Box size={14} />}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isMilestoneActive ? 'var(--primary)' : 'var(--text-main)' }}>
                                {item.title}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                ({item.offset})
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {item.detail}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.15rem' }}>
                              📍 {item.location}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            {item.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* ORDERED ITEMS LIST */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Ordered Items ({order.items?.length})</h3>
          </div>

          {order.items?.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr auto',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.85rem 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                alt={item.name}
                style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              />
              <div>
                <Link to={`/products/${item.product_id}`} style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {item.name}
                </Link>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ₹{item.price?.toLocaleString()} × {item.quantity}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                ₹{(item.line_total || item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="summary-row">
              <span>Items Subtotal:</span>
              <span>₹{order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charges:</span>
              <span>{order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total {isCancelled ? 'Amount' : 'Paid'}:</span>
              <span style={{ color: isCancelled ? 'var(--text-muted)' : 'var(--primary)', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                ₹{order.total_amount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* SIDEBAR: ADDRESS & PAYMENT & CANCELLATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* SHIPPING ADDRESS */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
            }}
          >
            <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <MapPin size={18} color="var(--primary)" />
              Shipping Address
            </h4>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <strong>{order.shipping_address?.name}</strong><br />
              {order.shipping_address?.address}<br />
              {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal_code}<br />
              Phone: {order.shipping_address?.phone}<br />
              Email: {order.shipping_address?.email}
            </div>
          </div>

          {/* PAYMENT INFORMATION */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
            }}
          >
            <h4 style={{ fontSize: '1rem', marginBottom: '0.85rem' }}>Payment Information</h4>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>
                Method:{' '}
                <strong>
                  {order.payment_method === 'Card'
                    ? 'Credit / Debit Card (Stripe SDK)'
                    : order.payment_method === 'Online'
                    ? 'UPI / Online Banking (Stripe)'
                    : 'Cash on Delivery (COD)'}
                </strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Status:</span>
                <span className={`badge ${isCancelled ? 'badge-stock-out' : (order.payment_status === 'Paid' || isDelivered) ? 'badge-stock' : 'badge-low'}`}>
                  {isCancelled
                    ? 'Order Cancelled'
                    : (order.payment_status === 'Paid' || isDelivered)
                    ? 'Paid'
                    : order.payment_method === 'COD'
                    ? 'Pay on Delivery (Cash/UPI)'
                    : order.payment_status || 'Pending'}
                </span>
              </div>
              {order.refund_status && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Refund: <strong>{order.refund_status}</strong>
                </div>
              )}
              {order.payment_id && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Transaction Ref:{' '}
                  <code style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                    {order.payment_id}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* CANCEL ORDER ACTION CARD (IF ACTIVE) */}
          {canCancel && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--danger-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <h4 style={{ fontSize: '1rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} /> Need to Cancel?
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                If you no longer need these items or made a mistake, you can cancel this order now.
              </p>
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="btn btn-secondary btn-block"
                style={{
                  color: 'var(--danger)',
                  borderColor: 'var(--danger)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                <Ban size={16} /> Cancel This Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CANCELLATION MODAL */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                <Ban size={22} /> Cancel Order {order.order_id}
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.65rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Please tell us why you would like to cancel your order:
            </p>

            {cancelError && (
              <div
                style={{
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {cancelError}
              </div>
            )}

            <form onSubmit={handleCancelOrder}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                {CANCEL_REASONS.map((reason) => (
                  <label
                    key={reason}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: selectedReason === reason ? 'var(--bg-subtle)' : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {selectedReason === 'Other reason' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <textarea
                    rows="2"
                    placeholder="Please specify your reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    style={{ width: '100%', fontSize: '0.9rem' }}
                    required
                  />
                </div>
              )}

              {/* REFUND NOTICE IN MODAL */}
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {order.payment_method === 'COD' ? (
                  <span>Since this order was placed with <strong>Cash on Delivery</strong>, no amount was charged.</span>
                ) : (
                  <span>
                    Your payment of <strong>₹{order.total_amount?.toLocaleString()}</strong> will be refunded to your original payment method via Stripe within <strong>5-7 business days</strong>.
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="btn btn-secondary"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="btn"
                  style={{
                    backgroundColor: 'var(--danger)',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
