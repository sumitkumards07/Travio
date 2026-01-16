import { useState, useRef, useEffect } from 'react';
import { Plane, Train, Bus, Car, Search, Calendar, Users, MapPin, ArrowLeftRight, Sparkles, X } from 'lucide-react';

// Comprehensive city list with IATA codes
const ALL_CITIES = [
    // Top 5 Major Cities (Featured)
    { id: 'DEL', name: 'Delhi', code: 'DEL', featured: true },
    { id: 'BOM', name: 'Mumbai', code: 'BOM', featured: true },
    { id: 'BLR', name: 'Bengaluru', code: 'BLR', featured: true },
    { id: 'HYD', name: 'Hyderabad', code: 'HYD', featured: true },
    { id: 'MAA', name: 'Chennai', code: 'MAA', featured: true },

    // Other Indian Cities
    { id: 'CCU', name: 'Kolkata', code: 'CCU' },
    { id: 'GOI', name: 'Goa', code: 'GOI' },
    { id: 'JAI', name: 'Jaipur', code: 'JAI' },
    { id: 'AMD', name: 'Ahmedabad', code: 'AMD' },
    { id: 'PNQ', name: 'Pune', code: 'PNQ' },
    { id: 'COK', name: 'Kochi', code: 'COK' },
    { id: 'LKO', name: 'Lucknow', code: 'LKO' },
    { id: 'VNS', name: 'Varanasi', code: 'VNS' },
    { id: 'ATQ', name: 'Amritsar', code: 'ATQ' },
    { id: 'IXC', name: 'Chandigarh', code: 'IXC' },
    { id: 'GAU', name: 'Guwahati', code: 'GAU' },
    { id: 'TRV', name: 'Thiruvananthapuram', code: 'TRV' },
    { id: 'IXE', name: 'Mangalore', code: 'IXE' },
    { id: 'VGA', name: 'Vijayawada', code: 'VGA' },
    { id: 'VTZ', name: 'Visakhapatnam', code: 'VTZ' },
    { id: 'SXR', name: 'Srinagar', code: 'SXR' },
    { id: 'IXL', name: 'Leh', code: 'IXL' },
    { id: 'IXB', name: 'Bagdogra', code: 'IXB' },
    { id: 'PAT', name: 'Patna', code: 'PAT' },
    { id: 'BBI', name: 'Bhubaneswar', code: 'BBI' },
    { id: 'IXR', name: 'Ranchi', code: 'IXR' },
    { id: 'RPR', name: 'Raipur', code: 'RPR' },
    { id: 'IDR', name: 'Indore', code: 'IDR' },
    { id: 'BHO', name: 'Bhopal', code: 'BHO' },
    { id: 'NAG', name: 'Nagpur', code: 'NAG' },
    { id: 'CJB', name: 'Coimbatore', code: 'CJB' },
    { id: 'IXM', name: 'Madurai', code: 'IXM' },
    { id: 'UDR', name: 'Udaipur', code: 'UDR' },
    { id: 'JDH', name: 'Jodhpur', code: 'JDH' },
    { id: 'DED', name: 'Dehradun', code: 'DED' },
    { id: 'IXA', name: 'Agartala', code: 'IXA' },
    { id: 'IMF', name: 'Imphal', code: 'IMF' },
    { id: 'DIB', name: 'Dibrugarh', code: 'DIB' },
    { id: 'JRH', name: 'Jorhat', code: 'JRH' },
    { id: 'SHL', name: 'Shillong', code: 'SHL' },

    // International Popular
    { id: 'DXB', name: 'Dubai', code: 'DXB' },
    { id: 'SIN', name: 'Singapore', code: 'SIN' },
    { id: 'BKK', name: 'Bangkok', code: 'BKK' },
    { id: 'KUL', name: 'Kuala Lumpur', code: 'KUL' },
    { id: 'LHR', name: 'London', code: 'LHR' },
    { id: 'JFK', name: 'New York', code: 'JFK' },
    { id: 'CDG', name: 'Paris', code: 'CDG' },
    { id: 'HKG', name: 'Hong Kong', code: 'HKG' },
    { id: 'SYD', name: 'Sydney', code: 'SYD' },
    { id: 'DOH', name: 'Doha', code: 'DOH' },
    { id: 'AUH', name: 'Abu Dhabi', code: 'AUH' },
    { id: 'MLE', name: 'Maldives', code: 'MLE' },
    { id: 'CMB', name: 'Colombo', code: 'CMB' },
    { id: 'KTM', name: 'Kathmandu', code: 'KTM' },
    { id: 'DAC', name: 'Dhaka', code: 'DAC' },
];

// Get featured cities for quick picks
const FEATURED_CITIES = ALL_CITIES.filter(c => c.featured);

// City autocomplete component
const CityInput = ({ value, onChange, placeholder, iconColor, label }) => {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCity, setSelectedCity] = useState(null);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Find city by ID or name
    useEffect(() => {
        if (value) {
            const city = ALL_CITIES.find(c => c.id === value || c.name === value);
            if (city) {
                setSelectedCity(city);
                setQuery(city.name);
            }
        }
    }, [value]);

    // Filter cities based on query
    const filteredCities = query.length > 0
        ? ALL_CITIES.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.code.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8)
        : FEATURED_CITIES;

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (city) => {
        setSelectedCity(city);
        setQuery(city.name);
        onChange(city.id);
        setShowSuggestions(false);
    };

    const handleClear = () => {
        setSelectedCity(null);
        setQuery('');
        onChange('');
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className="relative">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">{label}</label>
            <div className={`flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border ${showSuggestions ? 'border-blue-300 bg-blue-50/50' : 'border-transparent'}`}>
                <MapPin className={`w-4 h-4 ${iconColor}`} />
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent font-semibold text-gray-900 outline-none text-sm placeholder-gray-400"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                        if (!e.target.value) onChange('');
                    }}
                    onFocus={() => setShowSuggestions(true)}
                />
                {selectedCity && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        {selectedCity.code}
                    </span>
                )}
                {query && (
                    <button onClick={handleClear} className="p-1 hover:bg-gray-200 rounded-full">
                        <X className="w-3 h-3 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto">
                    {query.length === 0 && (
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                            Popular Cities
                        </div>
                    )}
                    {filteredCities.map((city) => (
                        <button
                            key={city.id}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                            onClick={() => handleSelect(city)}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">{city.code.substring(0, 2)}</span>
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-sm">{city.name}</div>
                                <div className="text-[10px] text-gray-400">{city.code} • India</div>
                            </div>
                            {city.featured && (
                                <span className="text-[9px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                                    🔥 Popular
                                </span>
                            )}
                        </button>
                    ))}
                    {filteredCities.length === 0 && (
                        <div className="px-4 py-6 text-center text-gray-400 text-sm">
                            No cities found for "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SearchHero = ({ onSearch }) => {
    const [activeTab, setActiveTab] = useState('flight');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [passengers, setPassengers] = useState(1);

    const tabs = [
        { id: 'flight', label: 'Flights', icon: <Plane className="w-5 h-5" />, price: '₹1.1k' },
        { id: 'train', label: 'Trains', icon: <Train className="w-5 h-5" />, price: '₹350' },
        { id: 'bus', label: 'Buses', icon: <Bus className="w-5 h-5" />, price: '₹450' },
        { id: 'cab', label: 'Cabs', icon: <Car className="w-5 h-5" />, price: '₹7.2k' },
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

    // Quick pick handler
    const handleQuickPick = (type, cityId) => {
        if (type === 'from') setFrom(cityId);
        else setTo(cityId);
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

                    {/* Mode Tabs with Prices */}
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
                                <span>{tab.label}</span>
                                <span className={`text-[9px] ${activeTab === tab.id ? 'text-emerald-500' : 'text-gray-300'}`}>
                                    {tab.price}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Quick City Picks */}
                    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                        {FEATURED_CITIES.map((city) => (
                            <button
                                key={city.id}
                                onClick={() => !from ? setFrom(city.id) : setTo(city.id)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${from === city.id || to === city.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {city.name}
                            </button>
                        ))}
                    </div>

                    {/* From/To Fields with Autocomplete */}
                    <div className="relative mb-4">
                        {/* From Field */}
                        <div className="mb-3">
                            <CityInput
                                value={from}
                                onChange={setFrom}
                                placeholder="Type or select city..."
                                iconColor="text-blue-500"
                                label="From"
                            />
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
                            <CityInput
                                value={to}
                                onChange={setTo}
                                placeholder="Type destination..."
                                iconColor="text-emerald-500"
                                label="To"
                            />
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
                                    min={new Date().toISOString().split('T')[0]}
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
                            <div className="text-lg font-bold text-gray-900">60+</div>
                            <div className="text-[10px] text-gray-400 font-medium">Cities</div>
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
export { ALL_CITIES, FEATURED_CITIES };
