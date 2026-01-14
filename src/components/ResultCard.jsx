import { Plane, Train, Bus, Car, ExternalLink } from 'lucide-react';

const ResultCard = ({ result, isCheapest }) => {
    const getIcon = (mode) => {
        switch (mode) {
            case 'flight': return <Plane className="w-4 h-4" />;
            case 'train': return <Train className="w-4 h-4" />;
            case 'bus': return <Bus className="w-4 h-4" />;
            case 'cab': return <Car className="w-4 h-4" />;
            default: return <Plane className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm relative">

            {/* Cheapest Deal Badge */}
            {isCheapest && (
                <div className="absolute -top-2 right-4 bg-emerald-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Cheapest Deal
                </div>
            )}

            {/* Header: Airline + Price */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {getIcon(result.mode)}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{result.operator}</h3>
                        <p className="text-[10px] text-gray-400 font-medium">{result.flightNumber || 'BA-112'} • Boeing 777</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">₹{result.price.toLocaleString()}</div>
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

                {/* Flight Path Graphic */}
                <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="text-[10px] text-gray-400 font-medium mb-1">{result.duration}</div>
                    <div className="w-full h-[1px] bg-gray-200 relative flex items-center">
                        <div className="absolute left-0 w-2 h-2 rounded-full bg-gray-300 border-2 border-white"></div>
                        <div className="absolute left-1/2 -translate-x-1/2 bg-white px-1">
                            <Plane className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="absolute right-0 w-2 h-2 rounded-full bg-gray-300 border-2 border-white"></div>
                    </div>
                    <div className="text-[10px] text-emerald-500 font-bold mt-1">Non-stop</div>
                </div>

                {/* Arrival */}
                <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{result.endTime || '12:15'}</div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">{result.to}</div>
                </div>
            </div>

            {/* Footer: Compare + Book */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Compare
                </label>
                <a
                    href={result.link || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                    Book Now
                </a>
            </div>

        </div>
    );
};

export default ResultCard;
