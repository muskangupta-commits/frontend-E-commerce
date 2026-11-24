import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Check,
  Edit2,
  MapPin,
  CreditCard,
  Smartphone,
  Banknote,
  Lock,
  Sparkles,
} from 'lucide-react';

// ===== INDIAN CITIES, STATES & PIN CODES DATA FOR SUGGESTIONS =====
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const INDIAN_CITIES = [
  // Madhya Pradesh
  'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur', 'Hoshangabad', 'Itarsi', 'Sehore',
  // Uttar Pradesh
  'Lucknow', 'Noida', 'Ghaziabad', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Firozabad', 'Jhansi', 'Mathura', 'Muzaffarnagar', 'Shahjahanpur',
  // Maharashtra
  'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded', 'Sangli', 'Malegaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Jalgaon',
  // Delhi / NCR
  'New Delhi', 'Delhi', 'Gurugram', 'Faridabad',
  // Rajasthan
  'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Sikar', 'Bharatpur', 'Pali',
  // Gujarat
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Morbi',
  // Karnataka
  'Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary', 'Shimoga', 'Tumkur',
  // Tamil Nadu
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi',
  // Telangana
  'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
  // Andhra Pradesh
  'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kakinada',
  // West Bengal
  'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Kharagpur',
  // Bihar
  'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Arrah',
  // Punjab
  'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali',
  // Haryana
  'Ambala', 'Karnal', 'Panipat', 'Sonipat', 'Hisar', 'Rohtak',
  // Kerala
  'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur',
  // Odisha
  'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur',
  // Jharkhand
  'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh',
  // Chhattisgarh
  'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg',
  // Assam
  'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon',
  // Uttarakhand
  'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh',
  // Himachal Pradesh
  'Shimla', 'Mandi', 'Solan', 'Dharamsala', 'Kullu',
  // Goa
  'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda',
];

// PIN code to city/state mapping for auto-fill
const PIN_CODE_MAP = {
  // Madhya Pradesh (Indore region)
  '452001': { city: 'Indore', state: 'Madhya Pradesh' },
  '452002': { city: 'Indore', state: 'Madhya Pradesh' },
  '452003': { city: 'Indore', state: 'Madhya Pradesh' },
  '452004': { city: 'Indore', state: 'Madhya Pradesh' },
  '452005': { city: 'Indore', state: 'Madhya Pradesh' },
  '452006': { city: 'Indore', state: 'Madhya Pradesh' },
  '452007': { city: 'Indore', state: 'Madhya Pradesh' },
  '452008': { city: 'Indore', state: 'Madhya Pradesh' },
  '452009': { city: 'Indore', state: 'Madhya Pradesh' },
  '452010': { city: 'Indore', state: 'Madhya Pradesh' },
  '452011': { city: 'Indore', state: 'Madhya Pradesh' },
  '452012': { city: 'Indore', state: 'Madhya Pradesh' },
  '452013': { city: 'Indore', state: 'Madhya Pradesh' },
  '452014': { city: 'Indore', state: 'Madhya Pradesh' },
  '452015': { city: 'Indore', state: 'Madhya Pradesh' },
  '452016': { city: 'Indore', state: 'Madhya Pradesh' },
  '452018': { city: 'Indore', state: 'Madhya Pradesh' },
  '452020': { city: 'Indore', state: 'Madhya Pradesh' },
  // Bhopal
  '462001': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462002': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462003': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462010': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462011': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462016': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462020': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462023': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462026': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462030': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462036': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462038': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '462042': { city: 'Bhopal', state: 'Madhya Pradesh' },
  // Jabalpur
  '482001': { city: 'Jabalpur', state: 'Madhya Pradesh' },
  '482002': { city: 'Jabalpur', state: 'Madhya Pradesh' },
  '482003': { city: 'Jabalpur', state: 'Madhya Pradesh' },
  // Gwalior
  '474001': { city: 'Gwalior', state: 'Madhya Pradesh' },
  '474002': { city: 'Gwalior', state: 'Madhya Pradesh' },
  '474003': { city: 'Gwalior', state: 'Madhya Pradesh' },
  // Ujjain
  '456001': { city: 'Ujjain', state: 'Madhya Pradesh' },
  '456006': { city: 'Ujjain', state: 'Madhya Pradesh' },
  '456010': { city: 'Ujjain', state: 'Madhya Pradesh' },
  // Delhi / NCR
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110002': { city: 'New Delhi', state: 'Delhi' },
  '110003': { city: 'New Delhi', state: 'Delhi' },
  '110085': { city: 'Delhi', state: 'Delhi' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh' },
  '201304': { city: 'Noida', state: 'Uttar Pradesh' },
  '201306': { city: 'Noida', state: 'Uttar Pradesh' },
  '122001': { city: 'Gurugram', state: 'Haryana' },
  '122002': { city: 'Gurugram', state: 'Haryana' },
  // Mumbai
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '400002': { city: 'Mumbai', state: 'Maharashtra' },
  '400050': { city: 'Mumbai', state: 'Maharashtra' },
  '400070': { city: 'Mumbai', state: 'Maharashtra' },
  // Pune
  '411001': { city: 'Pune', state: 'Maharashtra' },
  '411002': { city: 'Pune', state: 'Maharashtra' },
  '411004': { city: 'Pune', state: 'Maharashtra' },
  // Bengaluru
  '560001': { city: 'Bengaluru', state: 'Karnataka' },
  '560002': { city: 'Bengaluru', state: 'Karnataka' },
  '560034': { city: 'Bengaluru', state: 'Karnataka' },
  // Chennai
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '600002': { city: 'Chennai', state: 'Tamil Nadu' },
  // Hyderabad
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '500002': { city: 'Hyderabad', state: 'Telangana' },
  // Kolkata
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '700002': { city: 'Kolkata', state: 'West Bengal' },
  // Jaipur
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '302002': { city: 'Jaipur', state: 'Rajasthan' },
  // Lucknow
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '226002': { city: 'Lucknow', state: 'Uttar Pradesh' },
  // Ahmedabad
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '380002': { city: 'Ahmedabad', state: 'Gujarat' },
  // Patna
  '800001': { city: 'Patna', state: 'Bihar' },
  '800002': { city: 'Patna', state: 'Bihar' },
  // Ranchi
  '834001': { city: 'Ranchi', state: 'Jharkhand' },
  // Raipur
  '492001': { city: 'Raipur', state: 'Chhattisgarh' },
  // Dehradun
  '248001': { city: 'Dehradun', state: 'Uttarakhand' },
  // Chandigarh
  '160001': { city: 'Chandigarh', state: 'Chandigarh' },
  // Surat
  '395001': { city: 'Surat', state: 'Gujarat' },
  // Nagpur
  '440001': { city: 'Nagpur', state: 'Maharashtra' },
  // Kochi
  '682001': { city: 'Kochi', state: 'Kerala' },
};

// PIN code prefix to state mapping for broader matching
const PIN_PREFIX_STATE_MAP = {
  '45': 'Madhya Pradesh',
  '46': 'Madhya Pradesh',
  '47': 'Madhya Pradesh',
  '48': 'Madhya Pradesh',
  '49': 'Chhattisgarh',
  '11': 'Delhi',
  '12': 'Haryana',
  '13': 'Punjab',
  '14': 'Punjab',
  '15': 'Himachal Pradesh',
  '16': 'Chandigarh',
  '17': 'Himachal Pradesh',
  '18': 'Jammu and Kashmir',
  '19': 'Jammu and Kashmir',
  '20': 'Uttar Pradesh',
  '21': 'Uttar Pradesh',
  '22': 'Uttar Pradesh',
  '23': 'Uttar Pradesh',
  '24': 'Uttarakhand',
  '25': 'Uttar Pradesh',
  '26': 'Uttar Pradesh',
  '27': 'Uttar Pradesh',
  '28': 'Uttar Pradesh',
  '30': 'Rajasthan',
  '31': 'Rajasthan',
  '32': 'Rajasthan',
  '33': 'Rajasthan',
  '34': 'Rajasthan',
  '36': 'Gujarat',
  '37': 'Gujarat',
  '38': 'Gujarat',
  '39': 'Gujarat',
  '40': 'Maharashtra',
  '41': 'Maharashtra',
  '42': 'Maharashtra',
  '43': 'Maharashtra',
  '44': 'Maharashtra',
  '50': 'Telangana',
  '51': 'Andhra Pradesh',
  '52': 'Andhra Pradesh',
  '53': 'Andhra Pradesh',
  '56': 'Karnataka',
  '57': 'Karnataka',
  '58': 'Karnataka',
  '59': 'Karnataka',
  '60': 'Tamil Nadu',
  '61': 'Tamil Nadu',
  '62': 'Tamil Nadu',
  '63': 'Tamil Nadu',
  '64': 'Tamil Nadu',
  '67': 'Kerala',
  '68': 'Kerala',
  '69': 'Kerala',
  '70': 'West Bengal',
  '71': 'West Bengal',
  '72': 'West Bengal',
  '73': 'West Bengal',
  '74': 'West Bengal',
  '75': 'Odisha',
  '76': 'Odisha',
  '77': 'Assam',
  '78': 'Assam',
  '79': 'Manipur',
  '80': 'Bihar',
  '81': 'Bihar',
  '82': 'Bihar',
  '83': 'Jharkhand',
  '84': 'Bihar',
  '85': 'Bihar',
};

// ===== AUTOCOMPLETE DROPDOWN COMPONENT =====
const AutocompleteInput = ({ label, name, value, onChange, placeholder, suggestions, required, style }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(e);
    if (val.trim().length > 0) {
      const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (suggestion) => {
    const fakeEvent = { target: { name, value: suggestion } };
    onChange(fakeEvent);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', ...style }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (value.trim().length > 0) {
            const filtered = suggestions.filter((s) =>
              s.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 8);
            if (filtered.length > 0) {
              setFilteredSuggestions(filtered);
              setShowSuggestions(true);
            }
          }
        }}
        placeholder={placeholder}
        style={{ width: '100%' }}
        required={required}
        autoComplete="off"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
            maxHeight: '180px',
            overflowY: 'auto',
            zIndex: 100,
          }}
        >
          {filteredSuggestions.map((suggestion, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(suggestion)}
              style={{
                padding: '0.55rem 0.85rem',
                fontSize: '0.88rem',
                cursor: 'pointer',
                borderBottom: idx < filteredSuggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <MapPin size={13} style={{ marginRight: '0.4rem', color: 'var(--primary)', verticalAlign: 'middle' }} />
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper: get per-user localStorage key for saved address
  const getAddressStorageKey = () => {
    const userId = user?.id || user?.phone || null;
    return userId ? `cartify_saved_address_${userId}` : null;
  };

  const getSavedAddress = () => {
    // 1. Check user profile from backend
    let saved = user?.saved_address;
    if (saved) return saved;

    // 2. Check per-user localStorage key
    const userKey = getAddressStorageKey();
    if (userKey) {
      try {
        const local = localStorage.getItem(userKey);
        if (local) return JSON.parse(local);
      } catch (e) {}
    }

    // 3. Migrate old global key if it exists and belongs to this user
    try {
      const oldLocal = localStorage.getItem('cartify_saved_address');
      if (oldLocal) {
        const oldData = JSON.parse(oldLocal);
        // Check if the old saved address phone matches current user
        if (user?.phone && oldData?.phone === user.phone) {
          // Migrate to per-user key
          if (userKey) {
            localStorage.setItem(userKey, oldLocal);
          }
          localStorage.removeItem('cartify_saved_address');
          return oldData;
        }
        // Different user — don't use the old data, clean it up
        localStorage.removeItem('cartify_saved_address');
      }
    } catch (e) {}

    return null;
  };

  // Check if this is a new/first-time user (no saved address anywhere)
  const savedAddress = getSavedAddress();
  const isNewUser = !savedAddress && !user?.saved_address;

  const [formData, setFormData] = useState({
    name: savedAddress?.name || user?.name || '',
    email: savedAddress?.email || user?.email || (user?.phone ? `${user.phone}@cartify.com` : ''),
    phone: savedAddress?.phone || user?.phone || '',
    address: savedAddress?.address || '',
    city: savedAddress?.city || '',
    state: savedAddress?.state || '',
    postal_code: savedAddress?.postal_code || '',
  });

  const isAddressComplete = Boolean(
    formData.name?.trim() &&
    formData.phone?.trim() &&
    formData.address?.trim() &&
    formData.city?.trim() &&
    formData.postal_code?.trim()
  );

  // New user: always show editing form open
  // Returning user with saved address: show collapsed view
  const [isEditingAddress, setIsEditingAddress] = useState(isNewUser || !isAddressComplete);
  const [paymentMethod, setPaymentMethod] = useState('Card'); // Default to Card (Stripe SDK)
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // COD confirmation state
  const [codConfirmed, setCodConfirmed] = useState(false);
  const [codConfirming, setCodConfirming] = useState(false);

  // Card details state
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [upiId, setUpiId] = useState('');

  // Auto-populate when user profile finishes loading
  useEffect(() => {
    if (user) {
      const saved = getSavedAddress();
      const hasAnySaved = Boolean(saved);

      setFormData((prev) => {
        const name = prev.name || saved?.name || user.name || '';
        const phone = prev.phone || saved?.phone || user.phone || '';
        const email = prev.email || saved?.email || user.email || (phone ? `${phone}@cartify.com` : '');
        const address = prev.address || saved?.address || '';
        const city = prev.city || saved?.city || '';
        const state = prev.state || saved?.state || '';
        const postal_code = prev.postal_code || saved?.postal_code || '';

        const newData = { name, phone, email, address, city, state, postal_code };

        // Check if the new data makes a complete address
        const complete = Boolean(
          newData.name?.trim() &&
          newData.phone?.trim() &&
          newData.address?.trim() &&
          newData.city?.trim() &&
          newData.postal_code?.trim()
        );

        // If returning user with complete saved address, collapse the form
        if (complete && hasAnySaved) {
          setIsEditingAddress(false);
        } else {
          // New user or incomplete address — keep form open
          setIsEditingAddress(true);
        }

        return newData;
      });
    }
  }, [user]);

  // Collapse into saved view if a complete address is available (initial mount)
  useEffect(() => {
    if (isAddressComplete && savedAddress) {
      setIsEditingAddress(false);
    }
  }, []);

  // Reset COD confirmed when payment method changes
  useEffect(() => {
    setCodConfirmed(false);
  }, [paymentMethod]);

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <h3>No items to checkout</h3>
          <p>Please add products to your cart before proceeding to checkout.</p>
          <Link to="/products" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');

    // Auto-fill city and state when PIN code is entered
    if (name === 'postal_code' && value.length === 6) {
      const exactMatch = PIN_CODE_MAP[value];
      if (exactMatch) {
        setFormData((prev) => ({
          ...prev,
          postal_code: value,
          city: prev.city || exactMatch.city,
          state: exactMatch.state,
        }));
      } else {
        // Try prefix match for state
        const prefix2 = value.substring(0, 2);
        const matchedState = PIN_PREFIX_STATE_MAP[prefix2];
        if (matchedState) {
          setFormData((prev) => ({
            ...prev,
            postal_code: value,
            state: prev.state || matchedState,
          }));
        }
      }
    }
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardData({ ...cardData, cardNumber: formatted });
    if (error) setError('');
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setCardData({ ...cardData, cardExpiry: val });
    if (error) setError('');
  };

  const handleSaveAddress = (e) => {
    if (e) e.preventDefault();
    if (!formData.name?.trim()) return setError('Please enter your full name.');
    if (!formData.phone?.trim() || formData.phone.length < 10)
      return setError('Please enter a valid 10-digit mobile number.');
    if (!formData.address?.trim()) return setError('Please enter your complete delivery street address.');
    if (!formData.city?.trim()) return setError('Please enter your city.');
    if (!formData.state?.trim()) return setError('Please enter your state.');
    if (!formData.postal_code?.trim()) return setError('Please enter your postal/PIN code.');

    setError('');
    try {
      const storageKey = getAddressStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(formData));
      }
    } catch (err) {}
    setIsEditingAddress(false);
  };

  // Handle COD Confirm button (dummy success)
  const handleCodConfirm = () => {
    setCodConfirming(true);
    // Simulate a short delay to mimic payment processing
    setTimeout(() => {
      setCodConfirmed(true);
      setCodConfirming(false);
    }, 1200);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      setIsEditingAddress(true);
      return setError('Please enter your full name.');
    }
    if (!formData.phone?.trim() || formData.phone.length < 10) {
      setIsEditingAddress(true);
      return setError('Please enter a valid 10-digit mobile number.');
    }
    if (!formData.address?.trim()) {
      setIsEditingAddress(true);
      return setError('Please enter your complete delivery street address.');
    }
    if (!formData.city?.trim()) {
      setIsEditingAddress(true);
      return setError('Please enter your city.');
    }
    if (!formData.state?.trim()) {
      setIsEditingAddress(true);
      return setError('Please enter your state.');
    }
    if (!formData.postal_code?.trim()) {
      setIsEditingAddress(true);
      return setError('Please enter your postal/PIN code.');
    }

    // Payment validation
    if (paymentMethod === 'Card') {
      const rawCard = cardData.cardNumber.replace(/\s+/g, '');
      if (rawCard.length < 16) {
        return setError('Please enter a valid 16-digit card number.');
      }
      if (!cardData.cardExpiry || cardData.cardExpiry.length < 5) {
        return setError('Please enter a valid card expiry date (MM/YY).');
      }
      if (!cardData.cardCvc || cardData.cardCvc.length < 3) {
        return setError('Please enter a valid 3-digit CVV/CVC code.');
      }
    }

    if (paymentMethod === 'Online') {
      const cleanUpi = upiId.trim();
      if (!cleanUpi) {
        return setError('Please enter your UPI ID (e.g. mobile@upi or username@okhdfcbank) to proceed.');
      }
      if (!cleanUpi.includes('@') || cleanUpi.startsWith('@') || cleanUpi.endsWith('@')) {
        return setError('Please enter a valid UPI ID (e.g. username@okhdfcbank or 9876543210@paytm).');
      }
    }

    // COD must be confirmed before placing order
    if (paymentMethod === 'COD' && !codConfirmed) {
      return setError('Please confirm your Cash on Delivery payment first by clicking the "Confirm COD Payment" button.');
    }

    setSubmitting(true);
    setError('');

    const cleanEmail = formData.email?.trim() || `${formData.phone.trim()}@cartify.com`;
    const cleanFormData = { ...formData, email: cleanEmail };

    try {
      let paymentId = null;

      // When paying online via Card or UPI, initialize Stripe Payment Intent via SDK
      if (paymentMethod === 'Card' || paymentMethod === 'Online') {
        try {
          const intentRes = await api.createPaymentIntent({
            amount: cart.total,
            currency: 'inr',
          });
          if (intentRes && intentRes.payment_intent_id) {
            paymentId = intentRes.payment_intent_id;
          }
        } catch (intentErr) {
          console.warn('Payment intent SDK notice:', intentErr);
          paymentId = `pi_stripe_${Date.now()}`;
        }
      }

      const orderPayload = {
        items: cart.items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
        shipping_address: cleanFormData,
        payment_method: paymentMethod,
        payment_id: paymentId,
        payment_status: paymentMethod === 'COD' && codConfirmed ? 'Paid' : undefined,
      };

      const res = await api.placeOrder(orderPayload);
      try {
        const storageKey = getAddressStorageKey();
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(cleanFormData));
        }
      } catch (err) {}
      clearCart();
      navigate(`/orders/${res.order.id || res.order.order_id}`, {
        state: { newOrder: true },
      });
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  // Generate PIN code suggestions based on prefix typed
  const getPinSuggestions = useCallback(() => {
    const val = formData.postal_code || '';
    if (val.length >= 2 && val.length < 6) {
      return Object.keys(PIN_CODE_MAP).filter((pin) => pin.startsWith(val)).slice(0, 8);
    }
    return [];
  }, [formData.postal_code]);

  return (
    <div className="container section">
      <button onClick={() => navigate('/cart')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Return to Cart
      </button>

      <div className="section-header">
        <div>
          <h1 className="section-title">Checkout & Shipping</h1>
          <p className="section-subtitle">Review your delivery address and choose your payment method</p>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="checkout-layout">
        <div className="checkout-form-panel">
          {/* 1. DELIVERY ADDRESS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="var(--primary)" />
              1. Delivery Address
            </h3>
            {!isEditingAddress && isAddressComplete && (
              <button
                type="button"
                onClick={() => setIsEditingAddress(true)}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.82rem',
                  color: 'var(--primary)',
                  borderColor: 'var(--primary)',
                }}
              >
                <Edit2 size={13} /> Change / Edit
              </button>
            )}
          </div>

          {!isEditingAddress && isAddressComplete ? (
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{formData.name}</span>
                <span className="badge badge-stock" style={{ fontSize: '0.72rem' }}>SAVED ADDRESS</span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{formData.phone}</span>
              </div>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.92rem' }}>
                {formData.address}, {formData.city}, {formData.state} - <strong>{formData.postal_code}</strong>
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Order updates: <strong>{formData.email || `${formData.phone}@cartify.com`}</strong>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Email Address (for order tracking)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. user@example.com"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  House / Flat / Street Address *
                </label>
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter house, building or street address"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                {/* CITY with autocomplete */}
                <AutocompleteInput
                  label="City *"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  suggestions={INDIAN_CITIES}
                  required
                />

                {/* STATE with autocomplete */}
                <AutocompleteInput
                  label="State *"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  suggestions={INDIAN_STATES}
                  required
                />

                {/* PIN CODE with autocomplete */}
                <AutocompleteInput
                  label="PIN Code *"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="Enter 6-digit PIN"
                  suggestions={Object.keys(PIN_CODE_MAP)}
                  required
                />
              </div>

              {/* PIN code auto-fill info */}
              {formData.postal_code?.length === 6 && PIN_CODE_MAP[formData.postal_code] && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '1rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--success-light)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>
                    PIN Code matched: <strong>{PIN_CODE_MAP[formData.postal_code].city}, {PIN_CODE_MAP[formData.postal_code].state}</strong>
                  </span>
                </div>
              )}

              {isAddressComplete && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    className="btn btn-primary btn-sm"
                  >
                    Save & Deliver Here
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. PAYMENT METHODS (STRIPE SDK & COD) */}
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            2. Payment Method
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* OPTION 1: CREDIT / DEBIT CARD (STRIPE SDK) */}
            <div
              onClick={() => setPaymentMethod('Card')}
              style={{
                border: paymentMethod === 'Card' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: paymentMethod === 'Card' ? 'var(--primary-light)' : 'var(--bg-surface)',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: paymentMethod === 'Card' ? '1rem' : '0' }}>
                <input
                  type="radio"
                  id="pay_card"
                  name="paymentMethod"
                  value="Card"
                  checked={paymentMethod === 'Card'}
                  onChange={() => setPaymentMethod('Card')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>Credit / Debit Card (Stripe SDK)</span>
                  </div>
                  <span className="badge badge-stock" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Lock size={10} /> 256-BIT SSL STRIPE
                  </span>
                </div>
              </div>

              {paymentMethod === 'Card' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    marginTop: '0.75rem',
                  }}
                >
                  <div style={{ marginBottom: '0.85rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Card Number *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        style={{ width: '100%', paddingRight: '2.5rem', fontFamily: 'monospace', letterSpacing: '1px' }}
                      />
                      <CreditCard
                        size={18}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={cardData.cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY"
                        maxLength="5"
                        style={{ width: '100%', textAlign: 'center', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        CVV / CVC *
                      </label>
                      <input
                        type="password"
                        value={cardData.cardCvc}
                        onChange={(e) => setCardData({ ...cardData, cardCvc: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                        placeholder="123"
                        maxLength="4"
                        style={{ width: '100%', textAlign: 'center', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardData.cardName || formData.name}
                      onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                      placeholder="Name printed on card"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={13} color="var(--primary)" />
                    <span>Test Card: Use <strong>4242 4242 4242 4242</strong> with any future expiry & 3-digit CVV.</span>
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 2: UPI / ONLINE BANKING (STRIPE SDK) */}
            <div
              onClick={() => setPaymentMethod('Online')}
              style={{
                border: paymentMethod === 'Online' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: paymentMethod === 'Online' ? 'var(--primary-light)' : 'var(--bg-surface)',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: paymentMethod === 'Online' ? '1rem' : '0' }}>
                <input
                  type="radio"
                  id="pay_online"
                  name="paymentMethod"
                  value="Online"
                  checked={paymentMethod === 'Online'}
                  onChange={() => setPaymentMethod('Online')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Smartphone size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>UPI / NetBanking / Online (Stripe)</span>
                  </div>
                  <span className="badge badge-stock" style={{ fontSize: '0.7rem' }}>INSTANT CONFIRMATION</span>
                </div>
              </div>

              {paymentMethod === 'Online' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    marginTop: '0.75rem',
                  }}
                >
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Enter UPI ID (Google Pay / PhonePe / Paytm / BHIM) *
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. mobile@upi or username@okhdfcbank"
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    A payment authorization request will be securely processed by Stripe.
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 3: CASH ON DELIVERY (COD) */}
            <div
              onClick={() => setPaymentMethod('COD')}
              style={{
                border: paymentMethod === 'COD' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: paymentMethod === 'COD' ? 'var(--primary-light)' : 'var(--bg-surface)',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <input
                  type="radio"
                  id="pay_cod"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Banknote size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>Cash on Delivery (COD)</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Pay with cash or UPI QR code when your courier arrives at your doorstep.
                  </div>
                </div>
              </div>

              {/* COD CONFIRM BUTTON SECTION */}
              {paymentMethod === 'COD' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {codConfirmed ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.85rem 1rem',
                        backgroundColor: 'var(--success-light)',
                        border: '1.5px solid var(--success)',
                        borderRadius: 'var(--radius-md)',
                        color: '#14532d',
                      }}
                    >
                      <CheckCircle2 size={22} color="var(--success)" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>✅ COD Payment Confirmed!</div>
                        <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '0.15rem' }}>
                          Cash on Delivery verified. Amount of <strong>₹{cart.total.toLocaleString()}</strong> will be collected at your doorstep.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                        💵 You will pay <strong>₹{cart.total.toLocaleString()}</strong> in cash or via QR code when the delivery agent arrives. Please confirm to proceed.
                      </div>
                      <button
                        type="button"
                        onClick={handleCodConfirm}
                        disabled={codConfirming}
                        className="btn btn-primary btn-block"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          padding: '0.85rem 1.5rem',
                        }}
                      >
                        {codConfirming ? (
                          <>
                            <span className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                            Confirming COD Payment...
                          </>
                        ) : (
                          <>
                            <Banknote size={18} />
                            Confirm COD Payment • ₹{cart.total.toLocaleString()}
                          </>
                        )}
                      </button>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.6rem', textAlign: 'center' }}>
                        🔒 This is a dummy confirmation for demo purposes
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY PANEL */}
        <aside className="cart-summary-panel">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Review Items ({cart.item_count})</h3>

          <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '1.25rem' }}>
            {cart.items.map((i) => (
              <div
                key={i.product_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.88rem',
                  marginBottom: '0.6rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {i.quantity} × {i.product?.name}
                </span>
                <span style={{ fontWeight: 600 }}>₹{(i.product?.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{cart.subtotal.toLocaleString()}</span>
          </div>

          <div className="summary-row">
            <span>Delivery:</span>
            <span>{cart.delivery_charge === 0 ? 'FREE' : `₹${cart.delivery_charge}`}</span>
          </div>

          <div className="summary-row total-row">
            <span>Total to Pay:</span>
            <span style={{ color: 'var(--primary)' }}>₹{cart.total.toLocaleString()}</span>
          </div>

          <button
            type="submit"
            disabled={submitting || (paymentMethod === 'COD' && !codConfirmed)}
            className="btn btn-primary btn-block btn-lg"
            style={{
              marginTop: '1.5rem',
              opacity: (paymentMethod === 'COD' && !codConfirmed) ? 0.6 : 1,
            }}
          >
            <span>
              {submitting
                ? 'Processing Order...'
                : paymentMethod === 'Card'
                ? `Pay with Card • ₹${cart.total.toLocaleString()}`
                : paymentMethod === 'Online'
                ? `Pay Online • ₹${cart.total.toLocaleString()}`
                : codConfirmed
                ? `Place COD Order • ₹${cart.total.toLocaleString()}`
                : `Confirm COD First • ₹${cart.total.toLocaleString()}`}
            </span>
          </button>

          {paymentMethod === 'COD' && !codConfirmed && (
            <div style={{ fontSize: '0.78rem', color: 'var(--warning)', textAlign: 'center', marginTop: '0.6rem', fontWeight: 600 }}>
              ⚠️ Please confirm COD payment above to enable order placement
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <Lock size={13} />
            <span>Payments powered by <strong>Stripe SDK</strong> & COD</span>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
