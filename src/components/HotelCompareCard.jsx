import { useState, useEffect } from 'react';
import { ExternalLink, Star, MapPin, Zap, TrendingDown, Loader2 } from 'lucide-react';
import { hotelProviders, getCheapestPrice, getProviderDeepLinks } from '../lib/hotelData';
import { convertMultipleLinks } from '../lib/travelpayouts';

const HotelCompareCard = ({ hotel }) => {
    const cheapest = getCheapestPrice(hotel);
    const providerLinks = getProviderDeepLinks(hotel);
    const maxPrice = Math.max(...hotel.prices.map(p => p.price));
    const savings = maxPrice - cheapest.price;

    const [affiliateLinks, setAffiliateLinks] = useState({});
    const [loadingLinks, setLoadingLinks] = useState(true);

    // Convert links to affiliate links on mount
    useEffect(() => {
        const convertLinks = async () => {
            setLoadingLinks(true);
            const linksToConvert = providerLinks.map(p => ({
                url: p.deepLink,
                subId: `hotel_${hotel.id}_${p.provider}`
            }));

            const converted = await convertMultipleLinks(linksToConvert);
            const linkMap = {};
            providerLinks.forEach(p => {
                linkMap[p.provider] = converted.get(p.deepLink) || p.deepLink;
            });

            setAffiliateLinks(linkMap);
            setLoadingLinks(false);
        };

        convertLinks();
    }, [hotel.id]);

    const getAffiliateLink = (provider, fallbackUrl) => {
        return affiliateLinks[provider] || fallbackUrl;
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4 hover:shadow-lg transition-all">
            {/* Hotel Image & Badge */}
            <div className="relative h-44">
                <img
                    src={hotel.image}
                    className="w-full h-full object-cover"
                    alt={hotel.name}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {hotel.badge && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg">
                            {hotel.badge}
                        </span>
                    )}
                    <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5 shadow">
                        {'★'.repeat(hotel.stars)}
                    </span>
                </div>

                {/* Affiliate Badge */}
                {!loadingLinks && Object.keys(affiliateLinks).length > 0 && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-[8px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                        💰 Earn Cashback
                    </div>
                )}

                {/* Savings Badge */}
                {savings > 1000 && (
                    <div className="absolute bottom-3 left-3 bg-emerald-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <TrendingDown className="w-3 h-3" />
                        Save ₹{savings.toLocaleString()}
                    </div>
                )}

                {/* Rating */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-lg">
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-gray-900">{hotel.rating}</span>
                        <span className="text-[10px] text-gray-400">({hotel.reviews.toLocaleString()})</span>
                    </div>
                </div>
            </div>

            {/* Hotel Info */}
            <div className="p-4">
                <h3 className="text-base font-bold text-gray-900 mb-1">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <MapPin className="w-3 h-3" />
                    {hotel.location}
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {hotel.amenities?.slice(0, 4).map((amenity, idx) => (
                        <span key={idx} className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {amenity}
                        </span>
                    ))}
                </div>

                {/* Price Comparison Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-blue-900">Compare Prices</span>
                        </div>
                        {loadingLinks && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-600">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Loading deals...
                            </div>
                        )}
                    </div>

                    {/* Provider Price Grid */}
                    <div className="space-y-2">
                        {providerLinks.sort((a, b) => a.price - b.price).map((p, idx) => {
                            const isLowest = idx === 0;
                            const affiliateUrl = getAffiliateLink(p.provider, p.deepLink);

                            return (
                                <a
                                    key={p.provider}
                                    href={affiliateUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${isLowest
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg'
                                            : 'bg-white hover:bg-gray-50 border border-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{p.providerInfo?.logo}</span>
                                        <span className={`text-xs font-semibold ${isLowest ? 'text-white' : 'text-gray-700'}`}>
                                            {p.providerInfo?.name}
                                        </span>
                                        {isLowest && (
                                            <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold">
                                                CHEAPEST
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {p.originalPrice > p.price && (
                                            <span className={`text-[10px] line-through ${isLowest ? 'text-white/60' : 'text-gray-400'}`}>
                                                ₹{p.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                        <span className={`font-bold ${isLowest ? 'text-white text-sm' : 'text-gray-900 text-sm'}`}>
                                            ₹{p.price.toLocaleString()}
                                        </span>
                                        <ExternalLink className={`w-3.5 h-3.5 ${isLowest ? 'text-white' : 'text-gray-400'}`} />
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Compare Links */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
                    {Object.entries(hotelProviders).slice(0, 3).map(([key, provider]) => {
                        const quickLink = affiliateLinks[key] || provider.searchUrl(hotel.city, hotel.name);
                        return (
                            <a
                                key={key}
                                href={quickLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition-colors"
                            >
                                <span>{provider.logo}</span>
                                Check {provider.name}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HotelCompareCard;
