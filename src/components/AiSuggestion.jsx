import { Sparkles, ArrowRight, Car, Plane, Info } from 'lucide-react';

const AiSuggestion = ({ suggestion }) => {
    if (!suggestion) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[1.5rem] p-6 mb-6 text-white relative overflow-hidden shadow-xl shadow-blue-900/40">

            {/* Background Sparkles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-200">AI Smart Pick</span>
                </div>

                <h3 className="text-xl font-display font-bold mb-1">
                    Save ₹{suggestion.savings.toLocaleString()} via {suggestion.hub}
                </h3>
                <p className="text-sm text-blue-100 mb-6 opacity-90">
                    Flying from a nearby hub is largely cheaper than a direct flight.
                </p>

                {/* Route Breakdown */}
                <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">

                    {/* Leg 1: Connection */}
                    <div className="flex items-center gap-4 mb-4 relative">
                        <div className="p-2 bg-white/10 rounded-full">
                            <Car className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-300">Cab / Bus to {suggestion.hub}</p>
                            <p className="text-lg font-bold">₹{suggestion.routes.connection.cabPrice}</p>
                        </div>
                        <div className="absolute left-[1.3rem] top-8 h-8 w-[2px] bg-white/20 border-l border-dashed border-white/50"></div>
                    </div>

                    {/* Leg 2: Flight */}
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/10 rounded-full">
                            <Plane className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-300">Flight from {suggestion.hub}</p>
                            <p className="text-lg font-bold">₹{suggestion.routes.flight.price}</p>
                        </div>
                    </div>
                </div>

                <button className="w-full mt-5 bg-white text-blue-900 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                    View Smart Route
                </button>

            </div>
        </div>
    );
};

export default AiSuggestion;
