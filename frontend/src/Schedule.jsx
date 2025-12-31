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
  Loader
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
      alert('Pickup Scheduled Successfully!');
      navigate('/my-pickups'); // Redirect to My Pickups
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to schedule pickup');
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-[#0f172a]">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#111827] rounded-xl shadow p-6">

        <PageHeader
          title="Schedule Pickup"
          subtitle="Manage your upcoming pickups."
        />

        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No pickups scheduled.
          </p>
=======
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
            EcoWaste Scheduler
          </div>
        </div>
        <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:text-green-600">Back to Dashboard</Link>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Your Waste Pickup</h1>
>>>>>>> Stashed changes
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Waste Type */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">1</div>
                <h2 className="text-xl font-bold text-gray-900">What are we picking up?</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {WASTE_TYPES.map(type => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedWaste(type.id)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${selectedWaste === type.id ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 hover:border-green-300'
                      }`}
                  >
                    {selectedWaste === type.id && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full z-10"><Check size={12} strokeWidth={3} /></div>
                    )}
                    <div className="h-32 bg-gray-100 relative">
                      <img src={type.img} alt={type.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 bg-white">
                      <div className="font-bold text-gray-900">{type.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Step 2: Amount */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">2</div>
                <h2 className="text-xl font-bold text-gray-900">How much waste?</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-sm text-gray-500 font-medium">Approximate Amount</label>
                  <div className="flex items-center gap-6">
                    <button onClick={() => setAmount(Math.max(1, amount - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><Minus size={20} /></button>
                    <span className="text-3xl font-bold text-gray-900 w-12 text-center">{amount}</span>
                    <button onClick={() => setAmount(amount + 1)} className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center"><Plus size={20} /></button>
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
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">3</div>
                <h2 className="text-xl font-bold text-gray-900">When should we come?</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between gap-2 overflow-x-auto pb-4 mb-4">
                  {days.map((d, i) => (
                    <button key={i} onClick={() => setSelectedDate(d.val)} className={`p-3 rounded-xl min-w-[60px] flex flex-col items-center ${selectedDate === d.val ? 'bg-green-500 text-white' : 'bg-gray-50'}`}>
                      <span className="text-xs font-medium">{d.day}</span>
                      <span className="text-lg font-bold">{d.date}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} onClick={() => setSelectedTime(slot)} className={`p-3 rounded-lg border text-xs font-bold ${selectedTime === slot ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Step 4: Location (Map) */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">4</div>
                <h2 className="text-xl font-bold text-gray-900">Confirm Location</h2>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-2">
                <div className="flex gap-2 p-2 mb-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      placeholder="Address..."
                    />
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
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
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="animate-spin" /> : 'Confirm Pickup'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
