import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const BENEFITS = [
  {
    icon: Truck,
    title: 'Fast & Reliable Delivery',
    description: 'Quick dispatch on millions of verified items',
  },
  {
    icon: ShieldCheck,
    title: '100% Secure Payments',
    description: 'Protected with Stripe encryption & Cash on Delivery',
  },
  {
    icon: RotateCcw,
    title: 'Easy 7-Day Returns',
    description: 'Hassle-free replacement or quick refund',
  },
  {
    icon: Headphones,
    title: 'Dedicated 24/7 Support',
    description: 'Expert customer assistance whenever you need',
  },
];

const TrustStrip = () => {
  return (
    <section className="trust-strip-container" aria-label="Service Benefits">
      <div className="trust-strip-grid">
        {BENEFITS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="trust-benefit-card">
              <div className="trust-icon-box">
                <Icon size={22} color="var(--color-primary)" />
              </div>
              <div className="trust-text-box">
                <h4 className="trust-title">{item.title}</h4>
                <p className="trust-desc">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TrustStrip;
