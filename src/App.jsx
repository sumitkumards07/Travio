import { useState } from 'react';
import Navbar from './components/Navbar';
import SearchHero from './components/SearchHero';
import ResultCard from './components/ResultCard';
import AiSuggestion from './components/AiSuggestion';
import HotelCard from './components/HotelCard';
import { Home, Building2, User } from 'lucide-react';
import { searchMockData, mockRoutes } from './lib/mockData';
import { findAiSuggestions } from './lib/aiLogic';

function App() {
  const [view, setView] = useState('home'); // home | results | stays
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

  // Handle Search Logic
  const handleSearch = async (params) => {
    setLoading(true);
    setSearchParams(params);
    setView('results');
    setResults([]);
    setAiSuggestion(null);

    // 1. Fetch Standard Results
    const directOptions = await searchMockData(params.from, params.to);
    setResults(directOptions);

    // 2. AI Logic (Only if flight mode)
    if (params.mode === 'flight' && directOptions.length > 0) {
      const cheapestDirect = directOptions.sort((a, b) => a.price - b.price)[0];
      const suggestion = await findAiSuggestions(params.from, params.to, cheapestDirect.price);
      setAiSuggestion(suggestion);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <Navbar />

      <main className="container mx-auto px-4 pt-20 max-w-lg md:max-w-2xl">

        {/* VIEW: HOME */}
        {view === 'home' && (
          <div className="animate-slide-up">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-6 px-1">
              Where to next?
            </h1>
            <SearchHero onSearch={handleSearch} />

            <div className="px-1">
              <h2 className="text-lg font-bold font-display mb-4">Trending Destinations</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {/* Mock Trending Cards */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[140px] h-48 rounded-2xl bg-gray-200 relative overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-150${i}548325-0d2f09d20c6a?w=400&q=60`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <span className="absolute bottom-3 left-3 text-white font-bold">Dubai</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: RESULTS */}
        {view === 'results' && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setView('home')} className="text-sm font-bold text-slate-400 hover:text-slate-600">
                &larr; Back
              </button>
              <h1 className="text-xl font-display font-bold text-slate-900">
                {searchParams?.from} to {searchParams?.to}
              </h1>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-bold text-slate-400">Finding best connections...</p>
              </div>
            ) : (
              <>
                {/* AI Suggestion */}
                {aiSuggestion && <AiSuggestion suggestion={aiSuggestion} />}

                {/* Results List */}
                {results.length > 0 ? (
                  results.map((r, idx) => <ResultCard key={idx} result={r} />)
                ) : (
                  <div className="text-center py-10 text-slate-400">No direct routes found. Try AI suggestions or nearby dates.</div>
                )}
              </>
            )}
          </div>
        )}

        {/* VIEW: STAYS */}
        {view === 'stays' && (
          <div className="animate-slide-up">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-6 px-1">
              Stays for you
            </h1>

            {/* Hotel Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
              {['Near Airport', '5 Star', 'Budget', 'Villas'].map(f => (
                <button key={f} className="whitespace-nowrap px-4 py-2 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-600 shadow-sm">
                  {f}
                </button>
              ))}
            </div>

            {mockRoutes.filter(r => r.type === 'hotel').map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
        <div className="flex justify-between items-center max-w-md mx-auto h-16">
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'home' || view === 'results' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Home className={`w-6 h-6 ${view === 'home' ? 'fill-blue-100' : ''}`} />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button
            onClick={() => setView('stays')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'stays' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Building2 className={`w-6 h-6 ${view === 'stays' ? 'fill-blue-100' : ''}`} />
            <span className="text-[10px] font-bold">Stays</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-slate-400">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Account</span>
          </button>
        </div>
      </div>

    </div>
  );
}

export default App;
