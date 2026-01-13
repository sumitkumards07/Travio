import { useState } from 'react';
import { Plane, Train, Bus, Car, Search, Calendar, MapPin, ArrowLeftRight } from 'lucide-react';
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
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 md:p-8 mb-8 border border-slate-100 relative overflow-hidden">

            {/* Decorative Background Blob */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-50 rounded-full blur-3xl z-0"></div>

            {/* Tabs */}
            <div className="flex justify-between md:justify-start md:gap-8 mb-8 relative z-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center gap-2 pb-2 text-xs font-bold transition-all relative ${activeTab === tab.id ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <div className={`p-3 rounded-2xl transition-all shadow-sm ${activeTab === tab.id ? 'bg-blue-50' : 'bg-white border border-gray-100'
                            }`}>
                            {tab.icon}
                        </div>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Inputs */}
            <div className="space-y-4 relative z-10">
                <div className="bg-slate-50 rounded-2xl p-1 border border-slate-100 relative">

                    {/* From */}
                    <div className="p-4 cursor-pointer hover:bg-white rounded-xl transition-colors">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">From</label>
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-300" />
                            <select
                                className="w-full bg-transparent font-display font-bold text-lg text-gray-800 outline-none appearance-none"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                            >
                                <option value="">Select Origin</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative h-[1px] bg-gray-200 mx-4">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-sm border border-gray-100">
                            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>

                    {/* To */}
                    <div className="p-4 cursor-pointer hover:bg-white rounded-xl transition-colors">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">To</label>
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-300" />
                            <select
                                className="w-full bg-transparent font-display font-bold text-lg text-gray-800 outline-none appearance-none"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                            >
                                <option value="">Select Destination</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Date */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Departure</label>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-300" />
                        <input
                            type="date"
                            className="bg-transparent font-display font-bold text-lg text-gray-800 outline-none w-full"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className="btn-primary w-full mt-6 py-4 text-lg flex items-center justify-center gap-2 group relative z-10"
            >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Find Best Route
            </button>

        </div>
    );
};

export default SearchHero;
