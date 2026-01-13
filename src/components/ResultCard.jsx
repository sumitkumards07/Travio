import { Plane, Train, Bus, Car, ArrowRight, ExternalLink } from 'lucide-react';

const ResultCard = ({ result }) => {
    const getIcon = (mode) => {
        switch (mode) {
            case 'flight': return <Plane className="w-5 h-5" />;
            case 'train': return <Train className="w-5 h-5" />;
            case 'bus': return <Bus className="w-5 h-5" />;
            case 'cab': return <Car className="w-5 h-5" />;
            default: return <Plane className="w-5 h-5" />;
        }
    };

    return (
        <div className="bg-white rounded-[1.5rem] p-5 mb-4 border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                        {getIcon(result.mode)}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-display text-gray-900 leading-tight">{result.operator}</h3>
                        <p className="text-xs text-slate-400 font-bold mt-0.5 tracking-wide">{result.mode.toUpperCase()}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold font-display text-gray-900">₹{result.price.toLocaleString()}</div>
                    <p className="text-xs text-slate-400 font-medium">per person</p>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="text-center w-14">
                    <div className="text-lg font-bold font-display text-gray-900">{result.startTime || '--:--'}</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">{result.from}</div>
                </div>

                <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="text-xs font-medium text-slate-400 mb-2">{result.duration}</div>
                    <div className="w-full h-[2px] bg-slate-100 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                            {getIcon(result.mode)}
                        </div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    </div>
                </div>

                <div className="text-center w-14">
                    <div className="text-lg font-bold font-display text-gray-900">{result.endTime || '--:--'}</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">{result.to}</div>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                    Direct Booking
                </span>
                <a
                    href={result.link || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 text-sm flex items-center gap-2 transition-transform active:scale-95"
                >
                    Book Now <ExternalLink className="w-3 h-3" />
                </a>
            </div>

        </div>
    );
};

export default ResultCard;
