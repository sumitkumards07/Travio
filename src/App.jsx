import { useState } from 'react';
import Navbar from './components/Navbar';
import SearchHero from './components/SearchHero';
import ResultCard from './components/ResultCard';
import AiSuggestion from './components/AiSuggestion';
import HotelCard from './components/HotelCard';
import { Home, Building2, User, Plane, Train, Bus, Car, ArrowLeft, Search } from 'lucide-react';
import { searchMockData, mockRoutes, cities } from './lib/mockData';
import { findAiSuggestions } from './lib/aiLogic';

function App() {
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

  const handleSearch = async (params) => {
    setLoading(true);
    setSearchParams(params);
    setView('results');
    setResults([]);
    setAiSuggestion(null);

    const directOptions = await searchMockData(params.from, params.to);
    setResults(directOptions);

    if (params.mode === 'flight' && directOptions.length > 0) {
      const cheapestDirect = directOptions.sort((a, b) => a.price - b.price)[0];
      const suggestion = await findAiSuggestions(params.from, params.to, cheapestDirect.price);
      setAiSuggestion(suggestion);
    }

    setLoading(false);
  };

  const getFromCity = () => cities.find(c => c.id === searchParams?.from);
  const getToCity = () => cities.find(c => c.id === searchParams?.to);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">

      {/* VIEW: HOME */}
      {view === 'home' && (
        <>
          <Navbar />
          <div className="pt-16">
            <SearchHero onSearch={handleSearch} />

            {/* Best Deals Section */}
            <div className="px-5 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-display font-bold text-gray-900">Best Deals Today</h2>
                <button className="text-blue-600 text-xs font-bold">View all</button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {[
                  { city: 'Paris, France', price: '₹45,000', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=60' },
                  { city: 'Tokyo, Japan', price: '₹89,000', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=60' },
                  { city: 'Dubai, UAE', price: '₹32,000', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=60' },
                ].map((deal, i) => (
                  <div key={i} className="min-w-[160px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="relative h-28">
                      <img src={deal.img} className="w-full h-full object-cover" alt={deal.city} />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5">
                        <span className="text-orange-500">★</span> 4.8
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-gray-900">{deal.city}</h3>
                      <p className="text-[10px] text-gray-400 mb-2">Round Trip • Economy</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 line-through">₹80,000</span>
                          <div className="text-sm font-bold text-blue-600">{deal.price}</div>
                        </div>
                        <button className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Book</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div className="px-5 mt-6">
              <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Recent Searches</h2>
              {[{ from: 'Boston', to: 'Miami', date: '24 Oct', travelers: '1 Passenger' }].map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plane className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{s.from} to {s.to}</h3>
                    <p className="text-[10px] text-gray-400">{s.date} • {s.travelers}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* VIEW: RESULTS */}
      {view === 'results' && (
        <div className="bg-white min-h-screen">
          {/* Results Header */}
          <div className="bg-white shadow-sm sticky top-0 z-50 px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-3">
              <button onClick={() => setView('home')} className="p-1">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-display font-bold text-gray-900 flex items-center gap-1">
                  {getFromCity()?.code || 'NYC'} <span className="text-gray-400 text-sm">✈</span> {getToCity()?.code || 'LON'}
                </h1>
                <p className="text-[10px] text-gray-400">Sep 14 • 2 Travellers • Economy</p>
              </div>
              <button className="p-2">
                <Search className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Date Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {['Tue 12', 'Wed 13', 'Thu 14', 'Fri 15'].map((d, i) => (
                <button
                  key={i}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${i === 2 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {d}<br /><span className={i === 2 ? 'text-emerald-400' : 'text-gray-400'}>₹{(320 + i * 30).toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-gray-50">
            {['Filter', 'Stops', 'Airline', 'Duration'].map((f, i) => (
              <button key={i} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${i === 2 ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'
                }`}>
                {f === 'Filter' ? '⚙ ' : ''}{f} {f !== 'Filter' ? '▼' : ''}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="px-4 py-4">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-bold text-gray-400">Finding best connections...</p>
              </div>
            ) : (
              <>
                {aiSuggestion && <AiSuggestion suggestion={aiSuggestion} />}
                {results.length > 0 ? (
                  results.map((r, idx) => <ResultCard key={idx} result={r} isCheapest={idx === 0} />)
                ) : (
                  <div className="text-center py-10 text-gray-400">No direct routes found.</div>
                )}
              </>
            )}
          </div>

          {/* Compare Flights FAB */}
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-bold">
            Compare Flights <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">(1)</span> →
          </div>
        </div>
      )}

      {/* VIEW: STAYS */}
      {view === 'stays' && (
        <div className="pt-16 px-4">
          <Navbar />
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-4 mt-4">Stays for you</h1>
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {['Near Airport', '5 Star', 'Budget', 'Villas'].map(f => (
              <button key={f} className="whitespace-nowrap px-4 py-2 bg-white border border-gray-100 rounded-full text-xs font-bold text-gray-600 shadow-sm">
                {f}
              </button>
            ))}
          </div>
          {mockRoutes.filter(r => r.type === 'hotel').map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
        <div className="flex justify-between items-center max-w-md mx-auto h-16">
          <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' || view === 'results' ? 'text-blue-600' : 'text-gray-400'}`}>
            <Plane className="w-5 h-5" />
            <span className="text-[10px] font-bold">Flights</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <Train className="w-5 h-5" />
            <span className="text-[10px] font-bold">Trains</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <Bus className="w-5 h-5" />
            <span className="text-[10px] font-bold">Buses</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <Car className="w-5 h-5" />
            <span className="text-[10px] font-bold">Cabs</span>
          </button>
        </div>
      </div>

    </div>
  );
}

export default App;
