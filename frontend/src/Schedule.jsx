import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  ChevronDown,
  Search,
  Check,
  Info,
  Minus,
  Plus,
  Loader2 as Loader,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock
} from "lucide-react";
import PageHeader from "./components/PageHeader";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import api from "./utils/api";
import HorizontalCalendar from "./components/HorizontalCalendar";

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

const generateDaysInMonth = (month, year) => {
  const days = [];
  const date = new Date(year, month, 1);
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  while (date.getMonth() === month) {
    days.push({
      date: date.getDate(),
      day: dayNames[date.getDay()],
      full: date.toISOString().split('T')[0],
      display: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const WASTE_TYPES = [
  { id: 'plastic', name: 'Plastic', desc: 'Bottles, containers', img: '/assets/plastic.png', multiplier: 15 },
  { id: 'paper', name: 'Paper', desc: 'Cardboard, news', img: '/assets/paper.png', multiplier: 12 },
  { id: 'ewaste', name: 'E-waste', desc: 'Old electronics', img: '/assets/ewaste.png', multiplier: 50 },
  { id: 'metal', name: 'Metal', desc: 'Cans, scraps', img: '/assets/metal.png', multiplier: 30 }
];

function LocationMarker({ position, setPosition, setLocationName }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLocationName(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [position, map]);

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

  // Date & Time State
  const now = new Date();
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(now.toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [isPM, setIsPM] = useState(false);

  // Location State
  const [locationName, setLocationName] = useState('123 Green Avenue');
  const [position, setPosition] = useState({ lat: 47.6062, lng: -122.3321 }); // Seattle default
  const [view, setView] = useState("grid"); // grid or other (list)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [showPointsInfo, setShowPointsInfo] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };


  const handleAddressSearch = async () => {
    if (!locationName) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setPosition(newPos);
      } else {
        showToast("Address not found", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to search address", "error");
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const displayTime = formatTimeForSubmission(selectedTime, isPM);
      // Construct Payload
      const payload = {
        wasteTypes: [selectedWaste],
        amount,
        unit,
        scheduledDate: selectedDate, // Now "YYYY-MM-DD"
        timeSlot: displayTime,
        location: {
          address: locationName,
          coordinates: position
        },
        points: getCalculatedPoints()
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

  const formatTimeForSubmission = (time, pm) => {
    let [h, m] = time.split(':');
    h = parseInt(h);
    const suffix = pm ? 'PM' : 'AM';
    return `${h.toString().padStart(2, '0')}:${m} ${suffix}`;
  };

  const changeMonth = (offset) => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(nextMonth);
  };

  const getCalculatedPoints = () => {
    let multiplier = activeWaste.multiplier || 10;
    let weightEquivalent = amount;
    if (unit.includes('Bags')) weightEquivalent = amount * 5; // 1 bag approx 5kg
    if (unit.includes('Items')) weightEquivalent = amount * 0.5; // 1 item approx 0.5kg
    return Math.round(weightEquivalent * multiplier);
  };

  const days = generateDaysInMonth(viewDate.getMonth(), viewDate.getFullYear());
  const activeWaste = WASTE_TYPES.find(w => w.id === selectedWaste) || WASTE_TYPES[0];

  return (
    <div className="min-h-screen text-gray-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <PageHeader
            title="Join the Clean Future"
            size="text-2xl"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Waste Type */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#123524] text-white flex items-center justify-center font-normal">1</div>
                <h2 className="text-xl font-normal text-gray-900">What are we picking up?</h2>
              </div>

              {view === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {WASTE_TYPES.map(type => (
                    <div
                      key={type.id}
                      onClick={() => setSelectedWaste(type.id)}
                      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${selectedWaste === type.id ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 hover:border-green-300'
                        }`}
                    >
                      {selectedWaste === type.id && (
                        <div className="absolute top-2 right-2 bg-[#123524] text-white p-1 rounded-full z-10"><Check size={12} strokeWidth={3} /></div>
                      )}
                      <div className="h-32 bg-gray-100 relative">
                        <img src={type.img} alt={type.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <div className="font-normal text-gray-900">{type.name}</div>
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
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedWaste === type.id ? 'border-[#123524] bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={type.img} alt={type.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-normal text-gray-900">{type.name}</div>
                        <div className="text-sm text-gray-500">{type.desc}</div>
                      </div>
                      {selectedWaste === type.id && <div className="bg-[#123524] text-white p-1.5 rounded-full"><Check size={16} strokeWidth={3} /></div>}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Step 2: Amount */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#123524] text-white flex items-center justify-center font-normal">2</div>
                <h2 className="text-xl font-normal text-gray-900">How much waste?</h2>
              </div>
              <div className="backdrop-blur-md rounded-xl border border-gray-700 p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-sm text-gray-500 font-medium">Approximate Amount</label>
                  <div className="flex items-center gap-6">
                    <button onClick={() => setAmount(Math.max(1, amount - 1))} className="w-10 h-10 rounded-full bg-[#123524] text-white flex items-center justify-center"><Minus size={20} /></button>
                    <span className="text-3xl font-normal text-gray-900 w-12 text-center">{amount}</span>
                    <button onClick={() => setAmount(amount + 1)} className="w-10 h-10 rounded-full bg-[#123524] text-white flex items-center justify-center"><Plus size={20} /></button>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-sm text-gray-500 font-medium mb-2 block">Unit Type</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-lg">
                    <option>Kilograms (kg)</option>
                    <option>Bags (Standard Trash Bags)</option>
                    <option>Items (Count)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Step 3: Schedule */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#123524] text-white flex items-center justify-center font-normal">3</div>
                <h2 className="text-xl font-normal text-gray-900">When should we come?</h2>
              </div>
              <div className="backdrop-blur-md rounded-xl border border-gray-700 p-4">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 w-full">
                    <HorizontalCalendar
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                    />
                  </div>

                  <div className="flex-1 w-full space-y-4 pt-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Precision Arrival Time</label>
                    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <Clock className="text-emerald-600" size={24} />
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="bg-transparent border-none outline-none text-2xl font-normal text-gray-900 focus:ring-0 w-full"
                        />
                      </div>

                      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit mx-auto">
                        <button
                          onClick={() => setIsPM(false)}
                          className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${!isPM ? 'bg-[#123524] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >AM</button>
                        <button
                          onClick={() => setIsPM(true)}
                          className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isPM ? 'bg-[#123524] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >PM</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 4: Location (Map) */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#123524] text-white flex items-center justify-center font-normal">4</div>
                <h2 className="text-xl font-normal text-gray-900">Confirm Location</h2>
              </div>

              <div className="backdrop-blur-md rounded-xl border border-gray-700 p-2">
                <div className="p-4 border-b border-gray-50">
                  <label className="text-sm text-gray-500 font-normal uppercase tracking-widest block mb-1">Enter Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                      className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#123524] transition-colors"
                      placeholder="Type address & press Enter..."
                    />
                    <button
                      onClick={handleAddressSearch}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                      title="Search Location"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </div>

                {/* LEAFLET MAP */}
                <div className="h-64 rounded-lg overflow-hidden relative z-0">
                  <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} setLocationName={setLocationName} />
                  </MapContainer>
                </div>
                <div className="p-2 text-xs text-gray-500 text-center">Click on the map to set your pickup location.</div>
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-md rounded-xl shadow-sm border border-gray-700 p-6 sticky top-24">
              <h3 className="text-lg font-normal text-gray-900 mb-6">Pickup Summary</h3>
              <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                  <img src={activeWaste.img} alt={activeWaste.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-normal text-gray-900">{activeWaste.name} Waste</div>
                  <div className="text-sm text-gray-500 mt-1">Approx. {amount} {unit.split(' ')[0]}</div>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Calendar size={18} /></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{formatTimeForSubmission(selectedTime, isPM)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-normal text-gray-900 text-ellipsis overflow-hidden w-48 whitespace-nowrap">{locationName}</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div
                  className="bg-green-50 rounded-lg p-3 flex justify-between items-center mb-6 cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => setShowPointsInfo(!showPointsInfo)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-800">Estimated Points</span>
                    <Info size={14} className="text-green-600" />
                  </div>
                  <div className="font-normal text-green-600">{getCalculatedPoints()} Pts</div>
                </div>

                <AnimatePresence>
                  {showPointsInfo && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-white rounded-2xl shadow-xl border border-emerald-100 z-20"
                    >
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2">How it's calculated:</h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                          <span>Base Weight ({unit.split(' ')[0]})</span>
                          <span>{amount}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                          <span>{activeWaste.name} Multiplier</span>
                          <span>x{activeWaste.multiplier}</span>
                        </div>
                        {unit.includes('Bags') && (
                          <div className="flex justify-between text-[10px] text-emerald-600 font-bold">
                            <span>Bag conversion (5kg/bag)</span>
                            <span>x5</span>
                          </div>
                        )}
                        {unit.includes('Items') && (
                          <div className="flex justify-between text-[10px] text-emerald-600 font-bold">
                            <span>Item conversion (0.5kg/item)</span>
                            <span>x0.5</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-bold text-emerald-700">
                          <span>Final Total</span>
                          <span>{getCalculatedPoints()} Pts</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-[#123524] hover:bg-[#0d281a] text-white font-normal py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-green-100"
              >
                {loading ? (
                  <div className="spinner-wrapper !w-5 !h-5">
                    <div className="spinner-outer !border-2"></div>
                    <div className="spinner-inner !border-2 !border-t-white"></div>
                  </div>
                ) : 'Confirm Pickup'}
              </button>
            </div>
          </div>

        </div>
      </div >

      {/* In-website Float Message (Toast) */}
      {
        toast.show && (
          <div className={`fixed bottom-10 right-10 z-[9999] animate-bounce-in`}>
            <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${toast.type === 'success'
              ? 'bg-green-600 text-white border-green-500'
              : 'bg-red-600 text-white border-red-500'
              }`}>
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="font-normal">{toast.message}</span>
            </div>
          </div>
        )
      }

      <style dangerouslySetInnerHTML={{
        __html: `
                @keyframes bounce-in {
                    0% { transform: translateY(100px); opacity: 0; }
                    60% { transform: translateY(-10px); opacity: 1; }
                    100% { transform: translateY(0); }
                }
                .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                
                .custom-scrollbar::-webkit-scrollbar {
                  height: 4px;
                  width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(18, 53, 36, 0.1);
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
            `}} />
    </div >
  );
}
