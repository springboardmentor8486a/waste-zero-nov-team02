import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  ChevronDown,
  Search,
  Check,
  Info,
  Minus,
  Plus,
  Loader,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import api from "./utils/api";

// Fix Leaflet Default Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "01:00 PM - 03:00 PM",
  "04:00 PM - 06:00 PM"
];

const generateCalendarDays = () => {
  const days = [];
  const start = 28;
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  for (let i = 0; i < 7; i++) {
    days.push({
      date: start + i > 31 ? start + i - 31 : start + i,
      day: dayNames[i],
      val: `Oct ${start + i > 31 ? start + i - 31 : start + i}`
    });
  }
  return days;
};

const WASTE_TYPES = [
  { id: 'plastic', name: 'Plastic', desc: 'Bottles, containers', img: '/assets/plastic.png' },
  { id: 'paper', name: 'Paper', desc: 'Cardboard, news', img: '/assets/paper.png' },
  { id: 'ewaste', name: 'E-waste', desc: 'Old electronics', img: '/assets/ewaste.png' },
  { id: 'metal', name: 'Metal', desc: 'Cans, scraps', img: '/assets/metal.png' }
];

function LocationMarker({ position, setPosition, setLocationName }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLocationName(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function Schedule() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState('plastic');
  const [amount, setAmount] = useState(5);
  const [unit, setUnit] = useState('Kilograms (kg)');
  const [selectedDate, setSelectedDate] = useState('Oct 3');
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[1]);

  // Location State
  const [locationName, setLocationName] = useState('123 Green Avenue');
  const [position, setPosition] = useState({ lat: 47.6062, lng: -122.3321 }); // Seattle default
  const [view, setView] = useState("grid"); // grid or other (list)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const days = generateCalendarDays();
  const activeWaste = WASTE_TYPES.find(w => w.id === selectedWaste) || WASTE_TYPES[0];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Construct Payload
      const payload = {
        wasteTypes: [selectedWaste],
        amount,
        unit,
        scheduledDate: selectedDate,
        timeSlot: selectedTime,
        location: {
          address: locationName,
          coordinates: position
        }
      };

      await api.post('/pickups', payload);
      showToast('Pickup Scheduled Successfully!');
      setTimeout(() => navigate('/my-pickups'), 1500); // Redirect after toast
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to schedule pickup', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-800">
      <header className="bg-white/90 backdrop-blur-md border border-white/40 sticky top-0 z-30 px-6 py-4 flex items-center justify-between mx-4 mt-2 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-[#123524] flex items-center gap-2">
            EcoWaste Scheduler
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-white drop-shadow-md">Schedule Your Waste Pickup</h1>
          <div className="flex bg-white/20 backdrop-blur p-1 rounded-xl border border-white/30">
            <button
              onClick={() => setView("grid")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'grid' ? 'bg-green-500 text-white shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-green-500 text-white shadow-md' : 'text-white hover:bg-white/10'}`}
            >
              List View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Waste Type */}
            <section className="bg-white/90 backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-green-600 text-white flex items-center justify-center font-bold shadow-lg shadow-green-200">1</div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">What are we picking up?</h2>
              </div>

              {view === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {WASTE_TYPES.map(type => (
                    <div
                      key={type.id}
                      onClick={() => setSelectedWaste(type.id)}
                      className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${selectedWaste === type.id ? 'border-green-500 ring-4 ring-green-100' : 'border-transparent hover:border-green-200 hover:shadow-lg'
                        }`}
                    >
                      {selectedWaste === type.id && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white p-1 rounded-full z-10 shadow-lg"><Check size={14} strokeWidth={3} /></div>
                      )}
                      <div className="aspect-square bg-gray-50 relative">
                        <img src={type.img} alt={type.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                        <div className="absolute bottom-3 left-3 text-white font-bold tracking-wide">{type.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {WASTE_TYPES.map(type => (
                    <div
                      key={type.id}
                      onClick={() => setSelectedWaste(type.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedWaste === type.id ? 'border-green-500 bg-green-50/50' : 'border-gray-100 bg-white hover:border-green-200 hover:shadow-md'}`}
                    >
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={type.img} alt={type.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg">{type.name}</div>
                        <div className="text-sm text-gray-500">{type.desc}</div>
                      </div>
                      {selectedWaste === type.id && <div className="bg-green-600 text-white p-2 rounded-full shadow-lg shadow-green-200"><Check size={18} strokeWidth={3} /></div>}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Step 2: Amount */}
            <section className="bg-white/90 backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-green-600 text-white flex items-center justify-center font-bold shadow-lg shadow-green-200">2</div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">How much waste?</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 flex flex-col gap-3 w-full">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">Approximate Amount</label>
                  <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <button onClick={() => setAmount(Math.max(1, amount - 1))} className="w-12 h-12 rounded-xl bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 shadow-sm transition-colors border border-gray-200"><Minus size={20} /></button>
                    <span className="text-4xl font-black text-gray-900 flex-1 text-center">{amount}</span>
                    <button onClick={() => setAmount(amount + 1)} className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center hover:bg-green-700 shadow-lg shadow-green-200 transition-colors"><Plus size={20} /></button>
                  </div>
                </div>
                <div className="flex-1 w-full flex flex-col gap-3">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest block">Unit Type</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                    <option>Kilograms (kg)</option>
                    <option>Bags (Standard Trash Bags)</option>
                    <option>Items (Count)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Step 3: Schedule */}
            <section className="bg-white/90 backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-green-600 text-white flex items-center justify-center font-bold shadow-lg shadow-green-200">3</div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">When should we come?</h2>
              </div>

              <div className="flex justify-between gap-3 overflow-x-auto pb-6 mb-2 scrollbar-hide">
                {days.map((d, i) => (
                  <button key={i} onClick={() => setSelectedDate(d.val)} className={`p-4 rounded-2xl min-w-[70px] flex flex-col items-center justify-center transition-all duration-300 border-2 ${selectedDate === d.val ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200 scale-105' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">{d.day}</span>
                    <span className="text-2xl font-black">{d.date}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} onClick={() => setSelectedTime(slot)} className={`p-4 rounded-xl border-2 text-xs font-bold transition-all duration-300 ${selectedTime === slot ? 'border-green-600 bg-green-50 text-green-700 shadow-md' : 'border-gray-100 bg-white text-gray-500 hover:border-green-200 hover:text-green-600'}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </section>

            {/* Step 4: Location (Map) */}
            <section className="bg-white/90 backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-green-600 text-white flex items-center justify-center font-bold shadow-lg shadow-green-200">4</div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Confirm Location</h2>
              </div>

              <div className="bg-gray-50 p-2 rounded-3xl border border-gray-200">
                <div className="px-6 py-4 flex justify-between items-center mb-2">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Selected Address</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <MapPin size={16} className="text-green-600" />
                      {locationName}
                    </p>
                  </div>
                  <button className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline">Change</button>
                </div>

                {/* LEAFLET MAP */}
                <div className="h-64 rounded-2xl overflow-hidden relative z-0 shadow-inner">
                  <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} setLocationName={setLocationName} />
                  </MapContainer>
                </div>
                <div className="p-3 text-[10px] text-gray-400 text-center font-medium animate-pulse">Click on the map to pin-point location</div>
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/85 backdrop-blur-md rounded-xl shadow-sm border border-white/40 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Pickup Summary</h3>
              <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                  <img src={activeWaste.img} alt={activeWaste.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{activeWaste.name} Waste</div>
                  <div className="text-sm text-gray-500 mt-1">Approx. {amount} {unit.split(' ')[0]}</div>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-gray-900">{selectedDate}</div>
                    <div className="text-xs text-gray-500">{selectedTime}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-gray-900 text-ellipsis overflow-hidden w-48 whitespace-nowrap">{locationName}</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-green-800">Estimated Points</span>
                <div className="font-bold text-green-600">{amount * 10} Pts</div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-green-200"
              >
                {loading ? <Loader className="animate-spin" /> : 'Confirm Pickup'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* In-website Float Message (Toast) */}
      {toast.show && (
        <div className={`fixed bottom-10 right-10 z-[9999] animate-bounce-in`}>
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success'
            ? 'bg-green-600 text-white border-green-500'
            : 'bg-red-600 text-white border-red-500'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
                @keyframes bounce-in {
                    0% { transform: translateY(100px); opacity: 0; }
                    60% { transform: translateY(-10px); opacity: 1; }
                    100% { transform: translateY(0); }
                }
                .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}} />
    </div>
  );
}
