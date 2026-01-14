import { useState } from 'react';
import { Plane, Train, Bus, Car, Search, Calendar, Users, MapPin, ChevronDown } from 'lucide-react';
import { cities } from '../lib/mockData';

const SearchHero = ({ onSearch }) => {
    const [activeTab, setActiveTab] = useState('flight');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');

    const tabs = [
        { id: 'flight', label: 'Flights', icon: <Plane className="w-5 h-5" /> },
        { id: 'train', label: 'Trains', icon: <Train className="w-5 h-5" /> },
        { id: 'bus', label: 'Buses', icon: <Bus className="w-5 h-5" /> },
        { id: 'cab', label: 'Cabs', icon: <Car className="w-5 h-5" /> },
    ];

    const handleSubmit = () => {
        if (from && to) {
            onSearch({ from, to, date, mode: activeTab });
        }
    };

    return (
        <div className="relative">
            {/* Hero Background */}
            <div className="h-72 bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60"
                    alt="Travel"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50"></div>

                <div className="relative z-10 px-5 pt-6">
                    <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">EXPLORE THE WORLD</p>
                    <h1 className="text-white text-3xl font-display font-bold leading-tight">
                        Where will <span className="text-blue-400">travio</span> take you?
                    </h1>
                </div>
            </div>

            {/* Floating Search Card */}
            <div className="relative z-20 -mt-36 mx-4">
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-300/50 p-5">
                    {/* Tabs */}
                    <div className="flex justify-between border-b border-gray-100 pb-4 mb-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center gap-1.5 text-[11px] font-bold transition-all ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                                    }`}
                            >
                                <div className={`p-2.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                    {tab.icon}
                                </div>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* From Field */}
                    <div className="mb-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">From</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <select
                                className="flex-1 bg-transparent font-semibold text-gray-900 outline-none appearance-none text-sm"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                            >
                                <option value="">New York (JFK)</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* To Field */}
                    <div className="mb-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">To</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <select
                                className="flex-1 bg-transparent font-semibold text-gray-900 outline-none appearance-none text-sm"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                            >
                                <option value="">Destination</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Date & Travelers Row */}
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Depart</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    className="flex-1 bg-transparent font-semibold text-gray-900 outline-none text-sm"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Travelers</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-gray-900 text-sm">1 Adult</span>
                            </div>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
                    >
                        <Search className="w-5 h-5" />
                        Find Cheapest Rates
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchHero;
