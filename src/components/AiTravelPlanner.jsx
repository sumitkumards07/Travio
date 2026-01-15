import { useState } from 'react';
import { Sparkles, MapPin, Calendar, Users, Plane, Train, Bus, Hotel, Play, ExternalLink, Clock, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { generateTravelPlan } from '../lib/aiTravelPlanner';
import { cities } from '../lib/mockData';

const TierBadge = ({ tier }) => {
    const colors = {
        'Backpacker': 'from-green-500 to-emerald-600',
        'Explorer': 'from-blue-500 to-indigo-600',
        'Luxury': 'from-amber-500 to-orange-600'
    };

    const icons = {
        'Backpacker': '🎒',
        'Explorer': '🧭',
        'Luxury': '👑'
    };

    return (
        <div className={`bg-gradient-to-r ${colors[tier.name] || 'from-gray-500 to-gray-600'} text-white px-4 py-2 rounded-xl flex items-center gap-2`}>
            <span className="text-lg">{icons[tier.name] || '✨'}</span>
            <div>
                <div className="font-bold">{tier.name}</div>
                <div className="text-xs opacity-90">{tier.tagline}</div>
            </div>
        </div>
    );
};

const DayCard = ({ day, isExpanded, onToggle }) => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-2">
        <button
            onClick={onToggle}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold flex items-center justify-center">
                    {day.day}
                </div>
                <span className="font-semibold text-gray-900">{day.title}</span>
            </div>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {isExpanded && (
            <div className="px-4 pb-4 space-y-3">
                {day.activities?.map((act, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-16 text-xs font-bold ${act.time === 'Morning' ? 'text-amber-600' :
                                act.time === 'Afternoon' ? 'text-blue-600' : 'text-purple-600'
                            }`}>
                            {act.time}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">{act.activity}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {act.place}
                            </div>
                            {act.tip && (
                                <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                                    <Lightbulb className="w-3 h-3" />
                                    {act.tip}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const TierContent = ({ tier }) => {
    const [expandedDay, setExpandedDay] = useState(1);

    return (
        <div className="space-y-4">
            {/* Estimate Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Estimated Total</div>
                <div className="text-2xl font-bold">{tier.total_estimate}</div>
                <div className="text-xs text-gray-400 mt-1">*Prices vary by season & availability</div>
            </div>

            {/* YouTube Video */}
            {tier.video && (
                <a
                    href={tier.video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block relative rounded-2xl overflow-hidden group"
                >
                    {tier.video.thumbnail ? (
                        <img src={tier.video.thumbnail} alt="Travel vlog" className="w-full h-40 object-cover" />
                    ) : (
                        <div className="w-full h-40 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                            <Play className="w-12 h-12 text-white" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-all">
                        <div className="bg-red-600 rounded-full p-3 shadow-lg">
                            <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                        📺 Watch Travel Vlog
                    </div>
                </a>
            )}

            {/* Transport & Stay */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Train className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Transport</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">{tier.transport?.mode}</div>
                    <div className="text-lg font-bold text-blue-600 mt-1">{tier.transport?.estimate}</div>
                    {tier.transport?.booking_tip && (
                        <div className="text-[10px] text-gray-500 mt-1">{tier.transport.booking_tip}</div>
                    )}
                </div>

                <div className="bg-purple-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <Hotel className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Stay</span>
                    </div>
                    {tier.accommodation?.[0] && (
                        <>
                            <div className="font-semibold text-gray-900 text-sm">{tier.accommodation[0].name}</div>
                            <div className="text-lg font-bold text-purple-600 mt-1">{tier.accommodation[0].price_per_night}/night</div>
                        </>
                    )}
                </div>
            </div>

            {/* Booking Buttons */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {tier.booking_links?.trains && (
                    <a href={tier.booking_links.trains} target="_blank" rel="noreferrer"
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200">
                        <Train className="w-3 h-3" /> Check Trains
                    </a>
                )}
                {tier.booking_links?.flights && (
                    <a href={tier.booking_links.flights} target="_blank" rel="noreferrer"
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">
                        <Plane className="w-3 h-3" /> Check Flights
                    </a>
                )}
                {tier.booking_links?.buses && (
                    <a href={tier.booking_links.buses} target="_blank" rel="noreferrer"
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200">
                        <Bus className="w-3 h-3" /> Check Buses
                    </a>
                )}
                {tier.booking_links?.hotels && (
                    <a href={tier.booking_links.hotels} target="_blank" rel="noreferrer"
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200">
                        <Hotel className="w-3 h-3" /> Check Hotels
                    </a>
                )}
            </div>

            {/* Day-wise Itinerary */}
            {tier.itinerary && tier.itinerary.length > 0 && (
                <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        Day-wise Itinerary
                    </h3>
                    {tier.itinerary.map((day) => (
                        <DayCard
                            key={day.day}
                            day={day}
                            isExpanded={expandedDay === day.day}
                            onToggle={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                        />
                    ))}
                </div>
            )}

            {/* Place Images */}
            {tier.images && tier.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {tier.images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`Place ${idx + 1}`}
                            className="w-32 h-24 rounded-lg object-cover flex-shrink-0"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const AiTravelPlanner = () => {
    const [destination, setDestination] = useState('');
    const [origin, setOrigin] = useState('DEL');
    const [days, setDays] = useState('3');
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);
    const [activeTier, setActiveTier] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');

    const loadingMessages = [
        '🔍 Searching for hidden gems...',
        '🏨 Finding the best stays...',
        '🎬 Fetching travel vlogs...',
        '✨ Creating your perfect itinerary...',
        '🗺️ Mapping out adventures...'
    ];

    const handleGenerate = async () => {
        if (!destination) return;

        setLoading(true);
        setPlan(null);

        // Cycle through loading messages
        let msgIndex = 0;
        setLoadingMessage(loadingMessages[0]);
        const interval = setInterval(() => {
            msgIndex = (msgIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[msgIndex]);
        }, 2000);

        try {
            const result = await generateTravelPlan(destination, parseInt(days), getCityName(origin));
            setPlan(result);
            setActiveTier(0);
        } catch (error) {
            console.error('Error generating plan:', error);
        } finally {
            clearInterval(interval);
            setLoading(false);
        }
    };

    const getCityName = (code) => {
        const city = cities.find(c => c.id === code);
        return city?.name || code;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 pt-16 pb-8 px-4">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                    <h1 className="text-2xl font-display font-bold text-white">AI Trip Planner</h1>
                </div>
                <p className="text-purple-200 text-sm">Get personalized itineraries for any budget</p>
            </div>

            {/* Input Form */}
            <div className="px-4 -mt-4">
                <div className="bg-white rounded-2xl shadow-lg p-4 space-y-4">
                    {/* Destination */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                            Where do you want to go?
                        </label>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                            <MapPin className="w-5 h-5 text-purple-500" />
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g., Manali, Goa, Jaipur..."
                                className="flex-1 bg-transparent outline-none text-gray-900 font-medium"
                            />
                        </div>
                    </div>

                    {/* Origin & Days */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                                From
                            </label>
                            <select
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-3 py-2 outline-none text-gray-900"
                            >
                                {cities.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                                Days
                            </label>
                            <select
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-3 py-2 outline-none text-gray-900"
                            >
                                {[2, 3, 4, 5, 7, 10, 14].map(d => (
                                    <option key={d} value={d}>{d} Days</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !destination}
                        className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${loading || !destination
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:shadow-lg'
                            }`}
                    >
                        <Sparkles className="w-5 h-5" />
                        {loading ? 'Generating...' : 'Generate AI Plan'}
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="px-4 mt-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
                    <p className="text-purple-600 font-medium animate-pulse">{loadingMessage}</p>
                </div>
            )}

            {/* Results */}
            {plan && !loading && (
                <div className="px-4 mt-6 space-y-4">
                    {/* Destination Header */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">{plan.destination}</h2>
                        <p className="text-gray-500">{plan.duration} • Best time: {plan.best_time}</p>
                    </div>

                    {/* Tier Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {plan.tiers?.map((tier, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTier(idx)}
                                className={`flex-shrink-0 transition-all ${activeTier === idx ? 'scale-105' : 'opacity-70'}`}
                            >
                                <TierBadge tier={tier} />
                            </button>
                        ))}
                    </div>

                    {/* Active Tier Content */}
                    {plan.tiers?.[activeTier] && (
                        <TierContent tier={plan.tiers[activeTier]} />
                    )}

                    {/* Local Tips */}
                    {plan.local_tips && plan.local_tips.length > 0 && (
                        <div className="bg-amber-50 rounded-2xl p-4">
                            <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4" />
                                Local Tips
                            </h3>
                            <ul className="space-y-1">
                                {plan.local_tips.map((tip, idx) => (
                                    <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                                        <span>•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AiTravelPlanner;
