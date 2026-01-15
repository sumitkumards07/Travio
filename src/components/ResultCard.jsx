import { Plane, Train, Bus, Car, ExternalLink, Clock, Zap, TrendingUp } from 'lucide-react';
import { providers } from '../lib/mockData';
import { getFlightComparisonLinks } from '../lib/flightAffiliates';
import { getBusComparisonLinks, isFlixBusRoute } from '../lib/busComparison';

const ResultCard = ({ result, isCheapest, allProviders = [] }) => {
    const getIcon = (mode) => {
        switch (mode) {
            case 'flight': return <Plane className="w-4 h-4" />;
            case 'train': return <Train className="w-4 h-4" />;
            case 'bus': return <Bus className="w-4 h-4" />;
            case 'cab': return <Car className="w-4 h-4" />;
            default: return <Plane className="w-4 h-4" />;
        }
    };

    const getModeColor = (mode) => {
        switch (mode) {
            case 'flight': return 'from-blue-500 to-blue-600';
            case 'train': return 'from-orange-500 to-orange-600';
            case 'bus': return 'from-purple-500 to-purple-600';
            case 'cab': return 'from-green-500 to-green-600';
            default: return 'from-blue-500 to-blue-600';
        }
    };

    // Get provider booking URL - preferring deep link with route info
    const getProviderUrl = (operator, from, to) => {
        const provider = providers[operator];
        if (!provider) return '#';

        // Use deep link if available, otherwise fallback to homepage
        if (provider.getDeepLink) {
            return provider.getDeepLink(from, to);
        }
        return provider.url || '#';
    };

    // Get other providers for same route
    const otherProviders = allProviders
        .filter(p => p.operator !== result.operator)
        .slice(0, 2);

    // Get affiliate comparison links for flights
    const flightLinks = result.mode === 'flight'
        ? getFlightComparisonLinks(result.from, result.to)
        : [];

    // Get bus comparison links (FlixBus, RedBus, AbhiBus)
    const busLinks = result.mode === 'bus'
        ? getBusComparisonLinks(result.from, result.to)
        : [];

    return (
        <div className={`bg-white rounded-2xl p-4 mb-3 border transition-all hover:shadow-lg hover:-translate-y-0.5 ${isCheapest ? 'border-emerald-200 shadow-md shadow-emerald-100' : 'border-gray-100 shadow-sm'
            } relative`}>

            {/* Cheapest Deal Badge */}
            {isCheapest && (
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Best Price
                </div>
            )}

            {/* Header: Operator + Price */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 bg-gradient-to-br ${getModeColor(result.mode)} rounded-xl flex items-center justify-center text-white shadow-md`}>
                        {getIcon(result.mode)}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{result.operator}</h3>
                        <p className="text-[10px] text-gray-400 font-medium">
                            {result.mode === 'flight' && `${result.aircraft || 'A320'}`}
                            {result.mode === 'train' && `${result.trainName || ''} • ${result.class || '3A'}`}
                            {result.mode === 'bus' && `${result.busType || 'AC Sleeper'}`}
                            {result.mode === 'cab' && `${result.cabType || 'Sedan'}`}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">₹{result.price.toLocaleString()}</div>
                    <p className="text-[10px] text-gray-400">per person</p>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-between mb-4 px-1">
                {/* Departure */}
                <div className="text-left">
                    <div className="text-lg font-bold text-gray-900">{result.startTime || '10:00'}</div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">{result.from}</div>
                </div>

                {/* Journey Path */}
                <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium mb-1">
                        <Clock className="w-3 h-3" />
                        {result.duration}
                    </div>
                    <div className="w-full h-[2px] bg-gray-100 relative flex items-center rounded-full">
                        <div className="absolute left-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                        <div className="absolute left-1/2 -translate-x-1/2 bg-white px-1.5">
                            {getIcon(result.mode)}
                        </div>
                        <div className="absolute right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow"></div>
                    </div>
                    <div className="text-[10px] text-emerald-500 font-bold mt-1">
                        {result.stops === 0 ? 'Non-stop' : `${result.stops} stop${result.stops > 1 ? 's' : ''}`}
                    </div>
                </div>

                {/* Arrival */}
                <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{result.endTime || '12:15'}</div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">{result.to}</div>
                </div>
            </div>

            {/* Aviasales Compare Section (for flights only) */}
            {result.mode === 'flight' && flightLinks.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-bold text-orange-900">Compare on Other Sites</span>
                        <span className="text-[8px] bg-orange-200 text-orange-700 px-1.5 py-0.5 rounded-full font-bold ml-auto">
                            💰 Earn Rewards
                        </span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {flightLinks.map((link, idx) => (
                            <a
                                key={idx}
                                href={link.link}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${link.hasAffiliate
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:shadow-lg'
                                    : 'bg-white hover:bg-gray-50 border border-gray-100 text-gray-700'
                                    }`}
                            >
                                <span>{link.logo}</span>
                                <span className="font-semibold">{link.name}</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Bus Compare Section (FlixBus, RedBus, AbhiBus) */}
            {result.mode === 'bus' && busLinks.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Bus className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-bold text-green-900">Compare Bus Prices</span>
                        {busLinks.some(l => l.provider === 'flixbus') && (
                            <span className="text-[8px] bg-green-200 text-green-700 px-1.5 py-0.5 rounded-full font-bold ml-auto">
                                💰 FlixBus Often Cheapest!
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {busLinks.map((link, idx) => (
                            <a
                                key={idx}
                                href={link.link}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all ${link.provider === 'flixbus'
                                        ? 'bg-gradient-to-r from-green-500 to-lime-500 text-white shadow-md hover:shadow-lg'
                                        : 'bg-white hover:bg-gray-50 border border-gray-100 text-gray-700'
                                    }`}
                            >
                                <span>{link.logo}</span>
                                <div className="flex flex-col">
                                    <span className="font-semibold">{link.name}</span>
                                    {link.badge && (
                                        <span className="text-[9px] opacity-90">{link.badge}</span>
                                    )}
                                </div>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        ))}
                    </div>
                    <p className="text-[9px] text-green-600 mt-2 opacity-80">
                        💡 Tip: FlixBus is also on RedBus, but direct booking often saves ₹20-50!
                    </p>
                </div>
            )}

            {/* Other Provider Prices (if available) */}
            {otherProviders.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                    {otherProviders.map((p, idx) => (
                        <a
                            key={idx}
                            href={getProviderUrl(p.operator, result.from, result.to)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs transition-colors"
                        >
                            <span className="font-semibold text-gray-700">{p.operator}</span>
                            <span className="font-bold text-gray-900">₹{p.price.toLocaleString()}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>
                    ))}
                </div>
            )}

            {/* Footer: Compare + Book */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Compare
                </label>
                <a
                    href={getProviderUrl(result.operator, result.from, result.to)}
                    target="_blank"
                    rel="noreferrer"
                    className={`bg-gradient-to-r ${getModeColor(result.mode)} hover:opacity-90 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md`}
                >
                    Book on {result.operator}
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>

        </div>
    );
};

export default ResultCard;
