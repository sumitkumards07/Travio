import { Sparkles, Car, Train, Bus, Plane, ArrowRight, Zap, Clock } from 'lucide-react';
import { formatTotalDuration } from '../lib/aiLogic';

const AiSuggestion = ({ suggestion }) => {
    if (!suggestion) return null;

    const getConnectionIcon = (mode) => {
        switch (mode) {
            case 'cab': return <Car className="w-4 h-4" />;
            case 'train': return <Train className="w-4 h-4" />;
            case 'bus': return <Bus className="w-4 h-4" />;
            default: return <Car className="w-4 h-4" />;
        }
    };

    const getConnectionLabel = (mode) => {
        switch (mode) {
            case 'cab': return 'Cab';
            case 'train': return 'Train';
            case 'bus': return 'Bus';
            default: return 'Ground';
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 mb-6 text-white relative overflow-hidden shadow-2xl shadow-blue-900/50">

            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl shadow-lg shadow-yellow-500/30">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">AI Smart Pick</span>
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                <span className="text-[10px] font-semibold text-emerald-300">Save {suggestion.savingsPercent}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-400">₹{suggestion.savings.toLocaleString()}</div>
                        <div className="text-[10px] text-blue-200">savings</div>
                    </div>
                </div>

                <h3 className="text-xl font-display font-bold mb-2">
                    Fly from {suggestion.hubName} instead
                </h3>
                <p className="text-sm text-blue-100/80 mb-5">
                    Take a {getConnectionLabel(suggestion.connectionMode).toLowerCase()} to {suggestion.hubName}, then catch a cheaper flight
                </p>

                {/* Route Breakdown */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">

                    {/* Leg 1: Ground Connection */}
                    <div className="flex items-center gap-4 relative pb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            {getConnectionIcon(suggestion.connectionMode)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold text-purple-300 uppercase">{getConnectionLabel(suggestion.connectionMode)}</span>
                                <span className="text-[10px] text-blue-200">• {suggestion.connection.operator}</span>
                            </div>
                            <p className="text-sm font-bold">{suggestion.connection.from} → {suggestion.connection.to}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-bold text-white">₹{suggestion.connection.price.toLocaleString()}</span>
                                <span className="flex items-center gap-1 text-[10px] text-blue-200">
                                    <Clock className="w-3 h-3" />
                                    {suggestion.connection.duration}
                                </span>
                            </div>
                        </div>
                        {/* Connector Line */}
                        <div className="absolute left-5 top-12 h-6 w-px bg-gradient-to-b from-purple-400 to-blue-400"></div>
                    </div>

                    {/* Leg 2: Flight */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Plane className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold text-blue-300 uppercase">Flight</span>
                                <span className="text-[10px] text-blue-200">• {suggestion.mainOption.operator}</span>
                            </div>
                            <p className="text-sm font-bold">{suggestion.hub} → {suggestion.mainOption.to}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-bold text-white">₹{suggestion.mainOption.price.toLocaleString()}</span>
                                <span className="flex items-center gap-1 text-[10px] text-blue-200">
                                    <Clock className="w-3 h-3" />
                                    {suggestion.mainOption.duration}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Cost */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div>
                        <span className="text-[10px] text-blue-200 uppercase font-semibold">Total Cost</span>
                        <div className="text-xl font-bold">₹{suggestion.totalCost.toLocaleString()}</div>
                    </div>
                    <button className="bg-white text-blue-900 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2 active:scale-95">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiSuggestion;
