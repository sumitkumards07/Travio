import { useState } from 'react';
import { Plane, Train, Bus, Car, Search, Calendar, Users, MapPin, ChevronDown, Sparkles, ArrowLeftRight } from 'lucide-react';
import { cities } from '../lib/mockData';

const SearchHero = ({ onSearch }) => {
    const [activeTab, setActiveTab] = useState('flight');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [passengers, setPassengers] = useState(1);

    const tabs = [
        { id: 'flight', label: 'Flights', icon: <Plane className="w-5 h-5" /> },
        { id: 'train', label: 'Trains', icon: <Train className="w-5 h-5" /> },
        { id: 'bus', label: 'Buses', icon: <Bus className="w-5 h-5" /> },
        { id: 'cab', label: 'Cabs', icon: <Car className="w-5 h-5" /> },
    ];

    const handleSubmit = () => {
        if (from && to) {
            onSearch({ from, to, date, mode: activeTab, passengers });
        }
    };

    const swapCities = () => {
        const temp = from;
        setFrom(to);
        setTo(temp);
    };

    return (
        <div className="relative">
            {/* Hero Background with Gradient Overlay */}
            <div className="h-80 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <img
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60"
                    alt="Travel"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50"></div>

                <div className="relative z-10 px-5 pt-8">
                    {/* AI Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider">AI-Powered</span>
                    </div>

                    <p className="text-blue-200/80 text-xs font-semibold uppercase tracking-widest mb-1">EXPLORE THE WORLD</p>
                    <h1 className="text-white text-3xl font-display font-bold leading-tight">
                        Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">cheapest</span><br />way to travel
                    </h1>
                </div>
            </div>

            {/* Floating Search Card with Glassmorphism */}
            <div className="relative z-20 -mt-40 mx-4">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-400/30 p-5 border border-white/50">

                    {/* Mode Tabs */}
                    <div className="flex justify-between border-b border-gray-100 pb-4 mb-5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center gap-1.5 text-[11px] font-bold transition-all duration-300 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <div className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }`}>
                                    {tab.icon}
                                </div>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* From/To Fields with Swap Button */}
                    <div className="relative mb-4">
                        {/* From Field */}
                        <div className="mb-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">From</label>
                            <div className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-transparent focus-within:border-blue-200 focus-within:bg-blue-50/50">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <select
                                    className="flex-1 bg-transparent font-semibold text-gray-900 outline-none appearance-none text-sm cursor-pointer"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                >
                                    <option value="">Select city</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Swap Button */}
                        <button
                            onClick={swapCities}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-2 z-10 w-10 h-10 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:border-blue-200 transition-all active:scale-95"
                        >
                            <ArrowLeftRight className="w-4 h-4 text-gray-500 rotate-90" />
                        </button>

                        {/* To Field */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">To</label>
                            <div className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-transparent focus-within:border-blue-200 focus-within:bg-blue-50/50">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <select
                                    className="flex-1 bg-transparent font-semibold text-gray-900 outline-none appearance-none text-sm cursor-pointer"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                >
                                    <option value="">Select destination</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Date & Travelers Row */}
                    <div className="flex gap-3 mb-5">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Depart</label>
                            <div className="flex items-center gap-2 p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-transparent focus-within:border-blue-200">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                <input
                                    type="date"
                                    className="flex-1 bg-transparent font-semibold text-gray-900 outline-none text-sm"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Travelers</label>
                            <div className="flex items-center gap-2 p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                                <Users className="w-4 h-4 text-purple-500" />
                                <select
                                    className="flex-1 bg-transparent font-semibold text-gray-900 outline-none appearance-none text-sm"
                                    value={passengers}
                                    onChange={(e) => setPassengers(parseInt(e.target.value))}
                                >
                                    <option value={1}>1 Adult</option>
                                    <option value={2}>2 Adults</option>
                                    <option value={3}>3 Adults</option>
                                    <option value={4}>4 Adults</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!from || !to}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <Search className="w-5 h-5" />
                        Compare Prices
                    </button>

                    {/* Quick Stats */}
                    <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">100+</div>
                            <div className="text-[10px] text-gray-400 font-medium">Routes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">15+</div>
                            <div className="text-[10px] text-gray-400 font-medium">Providers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-emerald-500">Save 40%</div>
                            <div className="text-[10px] text-gray-400 font-medium">Avg. Savings</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchHero;
