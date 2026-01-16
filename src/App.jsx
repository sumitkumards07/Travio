import { useState } from 'react';
import Navbar from './components/Navbar';
import SearchHero from './components/SearchHero';
import ResultCard from './components/ResultCard';
import AiSuggestion from './components/AiSuggestion';
import HotelCompareCard from './components/HotelCompareCard';
import AiTravelPlanner from './components/AiTravelPlanner';
import { Plane, Train, Bus, Car, ArrowLeft, Search, Filter, SlidersHorizontal, Sparkles, TrendingDown, MapPin, Building2 } from 'lucide-react';
import { searchMockData, mockRoutes, cities, getCheapestPerMode } from './lib/mockData';
import { findAiSuggestions } from './lib/aiLogic';
import { hotels, getHotelsWithBestPrices, hotelProviders } from './lib/hotelData';
import { searchHotels } from './lib/hotelAPI';
import { searchFlights as searchFlightsAmadeus, searchHotelsAmadeus } from './lib/amadeusAPI';
import { searchFlightsReal, searchCheapestFlights } from './lib/aviasalesAPI';



function App() {
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [activeMode, setActiveMode] = useState('all');
  const [cheapestPerMode, setCheapestPerMode] = useState({});
  const [hotelResults, setHotelResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [usingRealData, setUsingRealData] = useState(false);

  const handleSearch = async (params) => {
    setLoading(true);
    setSearchParams(params);
    setView('results');
    setResults([]);
    setAiSuggestion(null);
    setActiveMode(params.mode === 'flight' ? 'all' : params.mode);
    setUsingRealData(false);

    let allResults = [];

    // Use ONLY Aviasales API for flights (Partner ID: 696077)
    if (params.mode === 'flight' || params.mode === 'all') {
      console.log('🔍 Searching Aviasales for flights...');
      try {
        const aviasalesResult = await searchFlightsReal(params.from, params.to, params.date);
        if (aviasalesResult.flights.length > 0) {
          console.log(`✅ Found ${aviasalesResult.flights.length} flights from Aviasales`);
          allResults = [...aviasalesResult.flights];
          setUsingRealData(aviasalesResult.usingRealData);
        } else {
          console.log('⚠️ Aviasales: No flights found for this route');
        }
      } catch (error) {
        console.error('❌ Aviasales API error:', error);
      }
    }

    // Get mock data for other modes (train, bus, cab)
    const mockResults = await searchMockData(params.from, params.to, params.mode === 'flight' ? null : params.mode);

    // Add mock data for non-flight modes only
    if (params.mode !== 'flight') {
      allResults = [...allResults, ...mockResults.filter(r => r.mode !== 'flight')];
    } else if (allResults.length === 0) {
      // Only use mock flights if Aviasales returned nothing
      allResults = mockResults.filter(r => r.mode === 'flight');
    }

    setResults(allResults);

    // Get cheapest per mode for quick stats
    const cheapest = await getCheapestPerMode(params.from, params.to);
    // Override with real data if available
    if (usingRealData && allResults.length > 0) {
      const cheapestFlight = allResults.filter(r => r.mode === 'flight').sort((a, b) => a.price - b.price)[0];
      if (cheapestFlight) cheapest.flight = cheapestFlight;
    }
    setCheapestPerMode(cheapest);

    // AI suggestions for flights
    if ((params.mode === 'flight' || params.mode === 'all') && allResults.length > 0) {
      const flightResults = allResults.filter(r => r.mode === 'flight');
      if (flightResults.length > 0) {
        const cheapestDirect = flightResults.sort((a, b) => a.price - b.price)[0];
        const suggestion = await findAiSuggestions(params.from, params.to, cheapestDirect.price, 'flight');
        setAiSuggestion(suggestion);
      }
    }

    setLoading(false);
  };

  const getFromCity = () => cities.find(c => c.id === searchParams?.from);
  const getToCity = () => cities.find(c => c.id === searchParams?.to);

  const filteredResults = activeMode === 'all'
    ? results
    : results.filter(r => r.mode === activeMode);

  const getResultsForMode = (mode) => results.filter(r => r.mode === mode);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">

      {/* VIEW: HOME */}
      {view === 'home' && (
        <>
          <Navbar />
          <div className="pt-16">
            <SearchHero onSearch={handleSearch} />

            {/* Quick Compare Section */}
            <div className="px-5 mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-display font-bold text-gray-900">Popular Routes</h2>
                <button className="text-blue-600 text-xs font-bold">View all</button>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {[
                  { from: 'VGA', to: 'DEL', label: 'Vijayawada → Delhi', price: '₹3,800' },
                  { from: 'BOM', to: 'DEL', label: 'Mumbai → Delhi', price: '₹3,500' },
                  { from: 'HYD', to: 'BLR', label: 'Hyderabad → Bangalore', price: '₹2,800' },
                ].map((route, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch({ from: route.from, to: route.to, mode: 'flight' })}
                    className="min-w-[180px] bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Plane className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">AI Deals</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{route.label}</h3>
                    <p className="text-xs text-gray-400">Starting from <span className="font-bold text-blue-600">{route.price}</span></p>
                  </button>
                ))}
              </div>
            </div>

            {/* Best Deals Section */}
            <div className="px-5 mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-display font-bold text-gray-900">Best Deals Today</h2>
                <button className="text-blue-600 text-xs font-bold">View all</button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {[
                  { city: 'Goa', from: 'BOM', price: '₹2,500', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=60', discount: '-40%' },
                  { city: 'Jaipur', from: 'DEL', price: '₹1,800', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=60', discount: '-35%' },
                  { city: 'Kerala', from: 'BLR', price: '₹3,200', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=60', discount: '-25%' },
                ].map((deal, i) => (
                  <div key={i} className="min-w-[160px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                    <div className="relative h-28">
                      <img src={deal.img} className="w-full h-full object-cover" alt={deal.city} />
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-full">
                        {deal.discount}
                      </div>
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5">
                        <span className="text-orange-500">★</span> 4.8
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-gray-900">{deal.city}</h3>
                      <p className="text-[10px] text-gray-400 mb-2">From {cities.find(c => c.id === deal.from)?.name}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-blue-600">{deal.price}</div>
                        <button className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="px-5 mt-8 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">AI Advantage</span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Save up to 50% with Smart Routes</h3>
                <p className="text-sm text-blue-100 opacity-90">Our AI finds cheaper alternatives by combining nearby airports with ground transport.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW: RESULTS */}
      {view === 'results' && (
        <div className="bg-gray-50 min-h-screen">
          {/* Results Header */}
          <div className="bg-white shadow-sm sticky top-0 z-50 px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-3">
              <button onClick={() => setView('home')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                  {getFromCity()?.code || 'FROM'}
                  <span className="text-gray-300">→</span>
                  {getToCity()?.code || 'TO'}
                </h1>
                <p className="text-[10px] text-gray-400">{searchParams?.date || 'Any Date'} • {searchParams?.passengers || 1} Traveller(s)</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Search className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveMode('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeMode === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                All ({results.length})
              </button>
              {[
                { mode: 'flight', icon: <Plane className="w-3.5 h-3.5" />, label: 'Flights' },
                { mode: 'train', icon: <Train className="w-3.5 h-3.5" />, label: 'Trains' },
                { mode: 'bus', icon: <Bus className="w-3.5 h-3.5" />, label: 'Buses' },
                { mode: 'cab', icon: <Car className="w-3.5 h-3.5" />, label: 'Cabs' },
              ].map(({ mode, icon, label }) => {
                const count = results.filter(r => r.mode === mode).length;
                const cheapest = cheapestPerMode[mode];
                return (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    disabled={count === 0}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${activeMode === mode
                      ? 'bg-gray-900 text-white'
                      : count === 0
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {icon}
                    {label}
                    {cheapest && (
                      <span className={`${activeMode === mode ? 'text-emerald-300' : 'text-emerald-500'}`}>
                        ₹{(cheapest.price / 1000).toFixed(1)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Compare Bar */}
          {Object.keys(cheapestPerMode).length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">Quick Compare</span>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {Object.entries(cheapestPerMode).map(([mode, option]) => (
                  <div
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className="flex-shrink-0 bg-white rounded-xl px-3 py-2 border border-blue-100 cursor-pointer hover:border-blue-300 transition-colors"
                  >
                    <div className="text-[10px] text-gray-400 capitalize">{mode}</div>
                    <div className="text-sm font-bold text-gray-900">₹{option.price.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400">{option.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar bg-white border-b border-gray-50">
            <button className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-gray-900 text-white flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
            {['Price', 'Duration', 'Departure'].map((f, i) => (
              <button
                key={i}
                className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors"
              >
                {f} ▼
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="px-4 py-4">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-bold text-gray-400">Finding best prices...</p>
                <p className="text-xs text-gray-300 mt-1">Comparing across 15+ providers</p>
              </div>
            ) : (
              <>
                {/* AI Suggestion */}
                {aiSuggestion && activeMode !== 'train' && activeMode !== 'bus' && activeMode !== 'cab' && (
                  <AiSuggestion suggestion={aiSuggestion} />
                )}

                {/* Results Count */}
                {filteredResults.length > 0 && (
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400">
                      <span className="font-bold text-gray-700">{filteredResults.length}</span> options found
                    </p>
                    <span className="text-[10px] text-gray-400">Sorted by price</span>
                  </div>
                )}

                {/* Result Cards */}
                {filteredResults.length > 0 ? (
                  filteredResults.map((r, idx) => (
                    <ResultCard
                      key={idx}
                      result={r}
                      isCheapest={idx === 0}
                      allProviders={results.filter(p => p.mode === r.mode && p.from === r.from && p.to === r.to)}
                    />
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="font-bold text-gray-400 mb-1">No routes found</p>
                    <p className="text-xs text-gray-300">Try a different route or transport mode</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW: HOTELS */}
      {view === 'stays' && (
        <div className="min-h-screen bg-gray-50 pb-24">
          <Navbar />

          {/* Hotel Search Header */}
          <div className="pt-16 px-4">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 mb-5 text-white">
              <h1 className="text-2xl font-display font-bold mb-2">Compare Hotel Prices</h1>
              <p className="text-sm text-blue-100 mb-4">Find the cheapest rates across Booking.com, Agoda, MakeMyTrip & more</p>

              {/* City Selector */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <label className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1.5 block">Select City</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-200" />
                  <select
                    className="flex-1 bg-transparent text-white font-semibold outline-none appearance-none text-sm"
                    value={selectedCity}
                    onChange={async (e) => {
                      setSelectedCity(e.target.value);
                      if (e.target.value) {
                        setLoading(true);
                        // Try Amadeus API first
                        let results = await searchHotelsAmadeus(e.target.value);
                        // Fallback to other hotel APIs
                        if (!results || results.length === 0) {
                          results = await searchHotels(e.target.value);
                        }
                        // Final fallback to mock data
                        if (!results || results.length === 0) {
                          results = await getHotelsWithBestPrices(e.target.value);
                        }
                        setHotelResults(results || []);
                        setLoading(false);
                      } else {
                        setHotelResults([]);
                      }
                    }}
                  >
                    <option value="" className="text-gray-900">Choose a city</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id} className="text-gray-900">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick City Pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
              {['DEL', 'BOM', 'BLR', 'HYD', 'GOI', 'JAI'].map(cityCode => {
                const city = cities.find(c => c.id === cityCode);
                const hotelCount = hotels.filter(h => h.cityCode === cityCode).length;
                return (
                  <button
                    key={cityCode}
                    onClick={async () => {
                      setSelectedCity(cityCode);
                      setLoading(true);
                      // Try Amadeus API first (skip if recently rate limited)
                      let results = await searchHotelsAmadeus(cityCode);
                      // Fallback to other hotel APIs
                      if (!results || results.length === 0) {
                        results = await searchHotels(cityCode);
                      }
                      // Final fallback to mock data
                      if (!results || results.length === 0) {
                        results = await getHotelsWithBestPrices(cityCode);
                      }
                      setHotelResults(results || []);
                      setLoading(false);
                    }}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCity === cityCode
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white border border-gray-100 text-gray-600 hover:border-blue-200'
                      }`}
                  >
                    {city?.name} {hotelCount > 0 && `(${hotelCount})`}
                  </button>
                );
              })}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-bold text-gray-400">Comparing prices...</p>
              </div>
            )}

            {/* Hotel Results */}
            {!loading && hotelResults.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400">
                    <span className="font-bold text-gray-700">{hotelResults.length}</span> hotels found
                  </p>
                  <span className="text-[10px] text-gray-400">Prices compared across {Object.keys(hotelProviders).length} sites</span>
                </div>
                {hotelResults.map(hotel => (
                  <HotelCompareCard key={hotel.id} hotel={hotel} />
                ))}
              </>
            )}

            {/* Empty State */}
            {!loading && !selectedCity && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-blue-300" />
                </div>
                <p className="font-bold text-gray-400 mb-1">Select a city to compare prices</p>
                <p className="text-xs text-gray-300">We'll find the best deals across all providers</p>
              </div>
            )}

            {/* No Results State */}
            {!loading && selectedCity && hotelResults.length === 0 && (
              <div className="text-center py-16">
                <p className="font-bold text-gray-400 mb-1">No hotels found in this city</p>
                <p className="text-xs text-gray-300">Try selecting a different city</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Travel Planner View */}
      {view === 'ai-planner' && (
        <AiTravelPlanner />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-between items-center max-w-md mx-auto h-16">
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'home' || view === 'results' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'home' || view === 'results' ? 'bg-blue-50' : ''}`}>
              <Plane className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Travel</span>
          </button>
          <button
            onClick={() => setView('stays')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'stays' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'stays' ? 'bg-blue-50' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-[10px] font-bold">Hotels</span>
          </button>
          <button
            onClick={() => setView('ai-planner')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'ai-planner' ? 'text-purple-600' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-xl ${view === 'ai-planner' ? 'bg-purple-50' : ''}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">AI Planner</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <div className="p-2 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </div>

    </div>
  );
}

export default App;
