import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { userApi } from '../api';
import toast from 'react-hot-toast';
import {
  MapPin,
  X,
  Home,
  Briefcase,
  Dumbbell,
  Clock,
  Edit2,
  Trash2,
  Navigation,
  Check
} from 'lucide-react';

export default function LocationModal() {
  const { isLocationModalOpen, setIsLocationModalOpen, deliveryLocation, setDeliveryLocation, isAuthenticated } = useStore();
  const [selectedPreset, setSelectedPreset] = useState(deliveryLocation.label);
  const [customAddress, setCustomAddress] = useState(deliveryLocation.address);
  const [zip, setZip] = useState(deliveryLocation.zip);
  const [userAddresses, setUserAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      userApi.getAddresses()
        .then(res => setUserAddresses(res.data))
        .catch(() => {});
    }
  }, [isAuthenticated, isLocationModalOpen]);

  if (!isLocationModalOpen) return null;

  const defaultPresets = [
    {
      label: 'Home',
      iconType: 'home',
      address: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield',
      zip: '62704',
      eta: '12 - 15 mins'
    },
    {
      label: 'Work / Office',
      iconType: 'work',
      address: '500 W Monroe St, Suite 1200',
      city: 'Springfield',
      zip: '62701',
      eta: '18 - 22 mins'
    },
    {
      label: 'Gym & Fitness',
      iconType: 'gym',
      address: '1400 S MacArthur Blvd',
      city: 'Springfield',
      zip: '62704',
      eta: '15 - 20 mins'
    }
  ];

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.label);
    setCustomAddress(preset.address || preset.full_address);
    setZip(preset.zip || preset.zip_code);
    setDeliveryLocation({
      id: preset.id || null,
      label: preset.label,
      address: preset.address || preset.full_address,
      city: preset.city || 'Springfield',
      zip: preset.zip || preset.zip_code || '62704',
      eta: preset.eta || '15 mins'
    });
    toast.success(`Delivery address set to ${preset.label}`);
  };

  const handleDeleteSavedAddress = async (e, addressId) => {
    e.stopPropagation();
    try {
      await userApi.deleteAddress(addressId);
      setUserAddresses(userAddresses.filter(a => a.id !== addressId));
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to remove address');
    }
  };

  const handleStartEdit = (e, addr) => {
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setSelectedPreset(addr.label);
    setCustomAddress(addr.full_address || addr.address);
    setZip(addr.zip_code || addr.zip);
  };

  const handleSaveCustom = async (e) => {
    e.preventDefault();
    if (!customAddress.trim()) {
      toast.error('Please enter a valid address');
      return;
    }
    const label = selectedPreset === 'Custom' ? 'Custom Address' : selectedPreset;
    const newLoc = {
      label: label,
      address: customAddress,
      city: 'Springfield',
      zip: zip || '62704',
      eta: '15 - 20 mins'
    };

    if (isAuthenticated) {
      try {
        if (editingAddressId) {
          const res = await userApi.updateAddress(editingAddressId, {
            label,
            full_address: customAddress,
            city: 'Springfield',
            state: 'IL',
            zip_code: zip || '62704',
            is_default: true
          });
          setUserAddresses(userAddresses.map(a => a.id === editingAddressId ? res.data : a));
          setEditingAddressId(null);
          toast.success('Address updated successfully');
        } else {
          const res = await userApi.createAddress({
            label,
            full_address: customAddress,
            city: 'Springfield',
            state: 'IL',
            zip_code: zip || '62704',
            is_default: true
          });
          setUserAddresses([...userAddresses, res.data]);
          toast.success('New address saved to your profile');
        }
      } catch (err) {
        console.error('Failed to sync address:', err);
      }
    }

    setDeliveryLocation(newLoc);
    setIsLocationModalOpen(false);
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'work':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'gym':
        return <Dumbbell className="w-4 h-4 text-indigo-600" />;
      case 'home':
      default:
        return <Home className="w-4 h-4 text-blue-600" />;
    }
  };

  // Combine default presets + user-saved addresses
  const allPresets = [
    ...defaultPresets,
    ...userAddresses.map(a => ({
      id: a.id,
      label: a.label,
      iconType: a.label.toLowerCase().includes('work') ? 'work' : a.label.toLowerCase().includes('gym') ? 'gym' : 'home',
      full_address: a.full_address,
      address: a.full_address,
      city: a.city,
      zip: a.zip_code,
      zip_code: a.zip_code,
      eta: '12 - 15 mins'
    }))
  ];

  return (
    <div className="modal-overlay" onClick={() => setIsLocationModalOpen(false)}>
      <div
        className="liquid-glass-modal w-full max-w-lg rounded-3xl shadow-2xl p-4 sm:p-7 animate-fade-in relative max-h-[90vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsLocationModalOpen(false)}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full liquid-glass hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-sm active:scale-95"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-2 pr-10">
          <div className="w-9 h-9 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center border border-blue-200/80 flex-shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading leading-tight">Choose Delivery Destination</h2>
            <p className="text-xs text-slate-500">Pick a saved address or enter a new destination</p>
          </div>
        </div>

        {/* Preset Cards */}
        <div className="space-y-2.5 my-4 sm:my-5">
          {allPresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 transition-all duration-200 ${
                deliveryLocation.address === (p.address || p.full_address)
                  ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/30 shadow-md'
                  : 'liquid-glass hover:bg-white/90 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-blue-50/80 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200/60">
                  {renderIcon(p.iconType)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <p className="text-xs font-bold text-slate-900">{p.label}</p>
                    {deliveryLocation.address === (p.address || p.full_address) && (
                      <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{p.address || p.full_address}, {p.zip || p.zip_code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-auto">
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  {p.eta || '15 mins'}
                </span>
                {p.id && (
                  <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(e, p)}
                      title="Edit Address"
                      className="w-7 h-7 rounded-lg liquid-glass hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSavedAddress(e, p.id)}
                      title="Delete Address"
                      className="w-7 h-7 rounded-lg liquid-glass hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Address Input */}
        <form onSubmit={handleSaveCustom} className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {editingAddressId ? 'Update Delivery Address' : 'Or Enter Street Address'}
            </label>
            {editingAddressId && (
              <button
                type="button"
                onClick={() => {
                  setEditingAddressId(null);
                  setCustomAddress(deliveryLocation.address);
                }}
                className="text-[11px] font-bold text-rose-500 hover:underline"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Street address & Apt/Suite"
              value={customAddress}
              onChange={(e) => {
                setCustomAddress(e.target.value);
                setSelectedPreset('Custom');
              }}
              className="w-full text-xs font-medium px-3.5 py-2.5 bg-white/80 backdrop-blur border border-white/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Zip Code"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-24 sm:w-1/3 min-w-0 text-xs font-medium px-3 py-2.5 bg-white/80 backdrop-blur border border-white/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
            />
            <button
              type="submit"
              className="flex-1 min-w-0 btn btn-primary text-xs py-2.5 px-3 rounded-xl font-bold shadow-md shadow-blue-600/20 active:scale-95 whitespace-nowrap"
            >
              Confirm Location
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
