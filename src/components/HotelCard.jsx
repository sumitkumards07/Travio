import { Star, MapPin } from 'lucide-react';

const HotelCard = ({ hotel }) => {
    return (
        <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100 mb-6 group cursor-pointer hover:shadow-md transition-all">
            <div className="relative h-56">
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span className="text-xs font-bold">{hotel.rating}</span>
                </div>
                {hotel.badge && (
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                        {hotel.badge}
                    </div>
                )}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold font-display text-gray-900 leading-tight">{hotel.name}</h3>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-3 h-3" /> {hotel.location}
                </p>

                <div className="flex items-center gap-2 mb-4">
                    {hotel.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-md">{tag}</span>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-end justify-between">
                    <div>
                        <p className="text-xs text-gray-400 line-through">₹{hotel.originalPrice}</p>
                        <p className="text-xl font-bold font-display text-gray-900">₹{hotel.price}<span className="text-xs font-medium text-gray-400">/night</span></p>
                    </div>

                    <button className="bg-slate-900 text-white font-bold py-2 px-6 rounded-xl hover:bg-black transition-colors text-sm">
                        View Deal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotelCard;
