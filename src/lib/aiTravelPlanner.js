// AI Travel Planner Service
// Uses Gemini AI for itinerary logic + YouTube/Unsplash for real media
// Architecture: React Frontend -> This Service -> Gemini API + Media APIs

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// The System Prompt - Strict JSON output for 3-tier travel plans
const SYSTEM_PROMPT = `You are TravioAI, an expert Indian travel planner. You create detailed, realistic travel itineraries.

IMPORTANT RULES:
1. Return ONLY valid JSON - no markdown, no extra text
2. Never make up exact prices for flights/trains - use ranges like "₹3000-5000"
3. Suggest REAL hotels and places that actually exist in India
4. Include specific visiting hours and local tips
5. Consider Indian public holidays and best seasons

OUTPUT FORMAT (strict JSON):
{
  "destination": "City Name",
  "duration": "X Days",
  "best_time": "Oct-Mar",
  "tiers": [
    {
      "name": "Backpacker",
      "tagline": "Maximum adventure, minimum spend",
      "total_estimate": "₹8,000-12,000",
      "transport": {
        "mode": "Train + Local Bus",
        "details": "Rajdhani Express (2AC) + State Bus",
        "estimate": "₹2,000-3,500",
        "booking_tip": "Book 60 days in advance on IRCTC"
      },
      "accommodation": [
        {"name": "Zostel Manali", "type": "Hostel", "price_per_night": "₹500-800", "rating": 4.2},
        {"name": "Backpacker Panda", "type": "Hostel", "price_per_night": "₹600-900", "rating": 4.0}
      ],
      "itinerary": [
        {
          "day": 1,
          "title": "Arrival & Old Manali",
          "activities": [
            {"time": "Morning", "activity": "Arrive at Manali bus stand", "place": "Manali Bus Stand", "tip": "Autos charge ₹100-150 to Old Manali"},
            {"time": "Afternoon", "activity": "Explore Old Manali cafes", "place": "Old Manali", "tip": "Try momos at Lazy Dog Lounge"},
            {"time": "Evening", "activity": "Walk along Manalsu River", "place": "Manalsu River", "tip": "Best sunset views from riverside"}
          ]
        }
      ],
      "youtube_query": "Manali budget travel vlog under 10000",
      "image_queries": ["Old Manali cafes", "Solang Valley", "Hadimba Temple"]
    },
    {
      "name": "Explorer",
      "tagline": "Comfort meets adventure",
      "total_estimate": "₹20,000-30,000",
      "transport": {...},
      "accommodation": [...],
      "itinerary": [...],
      "youtube_query": "Manali trip vlog 2024",
      "image_queries": [...]
    },
    {
      "name": "Luxury",
      "tagline": "Premium experience, no compromises",
      "total_estimate": "₹50,000-80,000",
      "transport": {...},
      "accommodation": [...],
      "itinerary": [...],
      "youtube_query": "Manali luxury resort experience",
      "image_queries": [...]
    }
  ],
  "local_tips": [
    "Carry cash - many places don't accept cards",
    "Best cafes are in Old Manali, not Mall Road"
  ],
  "emergency_contacts": {
    "police": "100",
    "tourist_helpline": "1363"
  }
}`;

/**
 * Generate AI Travel Plan using Gemini
 */
export const generateTravelPlan = async (destination, days, origin, groupSize = 1) => {
    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not configured, returning mock data');
        return getMockTravelPlan(destination, days);
    }

    const userPrompt = `Plan a ${days}-day trip to ${destination} from ${origin} for ${groupSize} person(s).
    
Consider:
- Current season and weather
- Best transport options from ${origin}
- Mix of popular and offbeat places
- Local food recommendations
- Safety tips for tourists

Create all 3 tiers (Backpacker, Explorer, Luxury) with complete day-wise itineraries.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                        { role: 'model', parts: [{ text: 'I understand. I will generate travel plans in strict JSON format with 3 tiers.' }] },
                        { role: 'user', parts: [{ text: userPrompt }] }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.9,
                        maxOutputTokens: 8192
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON in response');
        }

        const plan = JSON.parse(jsonMatch[0]);

        // Enrich with real media (YouTube + Images)
        const enrichedPlan = await enrichWithMedia(plan);

        return enrichedPlan;
    } catch (error) {
        console.error('AI Travel Plan error:', error);
        return getMockTravelPlan(destination, days);
    }
};

/**
 * Fetch YouTube video for a search query
 */
const fetchYouTubeVideo = async (query) => {
    const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
        // Fallback to search URL
        return {
            type: 'search',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            thumbnail: null
        };
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) throw new Error('YouTube API error');

        const data = await response.json();
        const video = data.items?.[0];

        if (video) {
            return {
                type: 'video',
                videoId: video.id.videoId,
                url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                thumbnail: video.snippet.thumbnails.high.url,
                title: video.snippet.title
            };
        }
    } catch (error) {
        console.error('YouTube fetch error:', error);
    }

    return {
        type: 'search',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        thumbnail: null
    };
};

/**
 * Fetch image from Unsplash
 */
const fetchUnsplashImage = async (query) => {
    const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    if (!UNSPLASH_ACCESS_KEY) {
        // Fallback to placeholder
        return `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
    }

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`,
            {
                headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` }
            }
        );

        if (!response.ok) throw new Error('Unsplash API error');

        const data = await response.json();
        const photo = data.results?.[0];

        if (photo) {
            return photo.urls.regular;
        }
    } catch (error) {
        console.error('Unsplash fetch error:', error);
    }

    return `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
};

/**
 * Enrich AI plan with real YouTube videos and images
 */
const enrichWithMedia = async (plan) => {
    for (const tier of plan.tiers || []) {
        // Fetch YouTube video for this tier
        if (tier.youtube_query) {
            tier.video = await fetchYouTubeVideo(tier.youtube_query);
        }

        // Fetch images for places
        if (tier.image_queries && tier.image_queries.length > 0) {
            tier.images = await Promise.all(
                tier.image_queries.slice(0, 3).map(q => fetchUnsplashImage(q))
            );
        }

        // Add booking links (affiliate)
        tier.booking_links = {
            trains: `https://www.irctc.co.in/`,
            flights: `https://www.aviasales.com/?marker=${import.meta.env.VITE_TRAVELPAYOUTS_MARKER || ''}`,
            buses: `https://www.redbus.in/`,
            hotels: `https://www.booking.com/`
        };
    }

    return plan;
};

/**
 * Mock travel plan for when AI is unavailable
 */
const getMockTravelPlan = (destination, days) => {
    return {
        destination: destination,
        duration: `${days} Days`,
        best_time: 'Oct-Mar',
        tiers: [
            {
                name: 'Backpacker',
                tagline: 'Maximum adventure, minimum spend',
                total_estimate: '₹8,000-15,000',
                transport: {
                    mode: 'Train + Local Bus',
                    details: 'Sleeper/3AC train recommended',
                    estimate: '₹1,500-3,000',
                    booking_tip: 'Book 60 days in advance on IRCTC'
                },
                accommodation: [
                    { name: 'Local Hostels', type: 'Hostel', price_per_night: '₹500-1,000', rating: 4.0 }
                ],
                itinerary: Array.from({ length: parseInt(days) }, (_, i) => ({
                    day: i + 1,
                    title: i === 0 ? 'Arrival & Exploration' : i === parseInt(days) - 1 ? 'Final Day & Departure' : `Day ${i + 1} Adventures`,
                    activities: [
                        { time: 'Morning', activity: 'Explore local sights', place: destination, tip: 'Start early to avoid crowds' },
                        { time: 'Afternoon', activity: 'Visit popular attractions', place: destination, tip: 'Carry water and snacks' },
                        { time: 'Evening', activity: 'Local food experience', place: destination, tip: 'Try street food safely' }
                    ]
                })),
                video: { type: 'search', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' budget travel vlog')}` },
                images: [`https://source.unsplash.com/800x600/?${encodeURIComponent(destination)}`],
                booking_links: {
                    trains: 'https://www.irctc.co.in/',
                    flights: 'https://www.aviasales.com/',
                    buses: 'https://www.redbus.in/',
                    hotels: 'https://www.booking.com/'
                }
            },
            {
                name: 'Explorer',
                tagline: 'Comfort meets adventure',
                total_estimate: '₹20,000-35,000',
                transport: { mode: 'Flight/AC Train', details: '2AC Train or Economy Flight', estimate: '₹3,000-6,000' },
                accommodation: [{ name: '3-Star Hotels', type: 'Hotel', price_per_night: '₹2,000-4,000', rating: 4.2 }],
                itinerary: [],
                video: { type: 'search', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' travel vlog')}` },
                images: [`https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},travel`],
                booking_links: { trains: 'https://www.irctc.co.in/', flights: 'https://www.aviasales.com/', hotels: 'https://www.booking.com/' }
            },
            {
                name: 'Luxury',
                tagline: 'Premium experience, no compromises',
                total_estimate: '₹50,000-100,000',
                transport: { mode: 'Flight + Private Cab', details: 'Business class or direct flights', estimate: '₹8,000-15,000' },
                accommodation: [{ name: '5-Star Resorts', type: 'Resort', price_per_night: '₹8,000-20,000', rating: 4.8 }],
                itinerary: [],
                video: { type: 'search', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination + ' luxury travel')}` },
                images: [`https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},luxury`],
                booking_links: { trains: 'https://www.irctc.co.in/', flights: 'https://www.aviasales.com/', hotels: 'https://www.booking.com/' }
            }
        ],
        local_tips: [
            'Carry cash - many places don\'t accept cards in smaller towns',
            'Download offline maps before your trip',
            'Respect local customs and dress modestly at religious sites'
        ]
    };
};

export { fetchYouTubeVideo, fetchUnsplashImage };
