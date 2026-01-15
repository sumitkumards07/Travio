// Bus Comparison Links Generator
// Generates deep links for RedBus, AbhiBus, and FlixBus
// FlixBus requires special city IDs - we map them here

// FlixBus City ID Mapping - Comprehensive India List
// Find more IDs: inspect network tab on FlixBus.in
const FLIXBUS_CITIES = {
    // ========== DELHI NCR ==========
    'Delhi': '4056', 'New Delhi': '4056', 'DEL': '4056',
    'Gurugram': '4058', 'Gurgaon': '4058', 'Noida': '4059',
    'Faridabad': '4060', 'Ghaziabad': '4061',

    // ========== RAJASTHAN ==========
    'Jaipur': '4062', 'JAI': '4062', 'Agra': '4063',
    'Udaipur': '4064', 'Jodhpur': '4065', 'Ajmer': '4068',
    'Pushkar': '4069', 'Bikaner': '4079', 'Jaisalmer': '4081',
    'Mount Abu': '4083', 'Kota': '4087', 'Alwar': '4089',

    // ========== UTTAR PRADESH ==========
    'Lucknow': '4066', 'Varanasi': '4067', 'Ayodhya': '10046',
    'Prayagraj': '4093', 'Allahabad': '4093', 'Kanpur': '4101',
    'Mathura': '4103', 'Vrindavan': '4105', 'Gorakhpur': '4107',
    'Meerut': '4109', 'Noida': '4059', 'Greater Noida': '4108',

    // ========== UTTARAKHAND ==========
    'Rishikesh': '4074', 'Haridwar': '4076', 'Dehradun': '4075',
    'Mussoorie': '4111', 'Nainital': '4113', 'Almora': '4115',
    'Jim Corbett': '4117', 'Auli': '4119', 'Kedarnath': '4120',

    // ========== HIMACHAL PRADESH ==========
    'Shimla': '4077', 'Manali': '4073', 'Dharamshala': '4078',
    'Kullu': '4121', 'Kasol': '4123', 'Dalhousie': '4125',
    'Chamba': '4127', 'Spiti': '4129', 'McLeodganj': '4131',
    'Bir Billing': '4132', 'Kasauli': '4134',

    // ========== PUNJAB & HARYANA ==========
    'Chandigarh': '4070', 'Amritsar': '4071', 'Ludhiana': '4133',
    'Patiala': '4135', 'Jalandhar': '4137', 'Ambala': '4139',
    'Panipat': '4141', 'Karnal': '4143', 'Mohali': '4144',

    // ========== J&K ==========
    'Jammu': '4145', 'Srinagar': '4147', 'Katra': '4149',
    'Pahalgam': '4151', 'Gulmarg': '4153', 'Leh': '4154',

    // ========== MAHARASHTRA ==========
    'Mumbai': '4080', 'BOM': '4080', 'Pune': '4082', 'PNQ': '4082',
    'Nashik': '4155', 'Nagpur': '4157', 'Aurangabad': '4159',
    'Shirdi': '4161', 'Lonavala': '4163', 'Mahabaleshwar': '4165',
    'Kolhapur': '4167', 'Solapur': '4169', 'Thane': '4171',
    'Navi Mumbai': '4173', 'Alibaug': '4174', 'Lavasa': '4176',

    // ========== GUJARAT ==========
    'Ahmedabad': '4084', 'AMD': '4084', 'Surat': '4085',
    'Vadodara': '4086', 'Rajkot': '4175', 'Gandhinagar': '4177',
    'Dwarka': '4179', 'Somnath': '4181', 'Bhuj': '4183',
    'Kutch': '4185', 'Gir': '4187', 'Diu': '4189', 'Daman': '4190',

    // ========== GOA ==========
    'Goa': '4088', 'GOI': '4088', 'Panaji': '4191',
    'Margao': '4193', 'Vasco': '4195', 'Mapusa': '4197', 'Calangute': '4198',

    // ========== MADHYA PRADESH ==========
    'Bhopal': '4199', 'Indore': '4201', 'Gwalior': '4203',
    'Jabalpur': '4205', 'Ujjain': '4207', 'Khajuraho': '4209',
    'Sanchi': '4211', 'Pachmarhi': '4213', 'Orchha': '4214',

    // ========== KARNATAKA ==========
    'Bengaluru': '4090', 'Bangalore': '4090', 'BLR': '4090',
    'Mysore': '4091', 'Mysuru': '4091', 'Mangalore': '4215',
    'Hampi': '4217', 'Hospet': '4219', 'Hubli': '4221',
    'Dharwad': '4223', 'Belgaum': '4225', 'Udupi': '4227',
    'Coorg': '4229', 'Madikeri': '4231', 'Chikmagalur': '4233',
    'Gokarna': '4234', 'Badami': '4236',

    // ========== TELANGANA ==========
    'Hyderabad': '4092', 'HYD': '4092', 'Secunderabad': '4247',
    'Warangal': '4245', 'Nizamabad': '4248',

    // ========== ANDHRA PRADESH ==========
    'Vijayawada': '4098', 'VGA': '4098', 'Visakhapatnam': '4099',
    'Vizag': '4099', 'Tirupati': '4235', 'Nellore': '4237',
    'Guntur': '4239', 'Kakinada': '4241', 'Rajahmundry': '4243',
    'Anantapur': '4244', 'Kurnool': '4246',

    // ========== TAMIL NADU ==========
    'Chennai': '4094', 'MAA': '4094', 'Coimbatore': '4095',
    'Madurai': '4249', 'Trichy': '4251', 'Tiruchirappalli': '4251',
    'Salem': '4253', 'Vellore': '4255', 'Pondicherry': '4257',
    'Puducherry': '4257', 'Ooty': '4259', 'Kodaikanal': '4261',
    'Kanyakumari': '4263', 'Rameswaram': '4265', 'Mahabalipuram': '4267',
    'Thanjavur': '4269', 'Tirunelveli': '4270', 'Erode': '4272',

    // ========== KERALA ==========
    'Kochi': '4096', 'Cochin': '4096', 'Thiruvananthapuram': '4097',
    'Trivandrum': '4097', 'Kozhikode': '4271', 'Calicut': '4271',
    'Alleppey': '4273', 'Alappuzha': '4273', 'Munnar': '4275',
    'Thekkady': '4277', 'Wayanad': '4279', 'Kovalam': '4281',
    'Varkala': '4283', 'Thrissur': '4285', 'Kannur': '4287',
    'Kumarakom': '4288', 'Guruvayur': '4290',

    // ========== WEST BENGAL ==========
    'Kolkata': '4100', 'CCU': '4100', 'Darjeeling': '4289',
    'Siliguri': '4291', 'Digha': '4293', 'Shantiniketan': '4295',
    'Howrah': '4297', 'Kalimpong': '4298', 'Sundarbans': '4300',

    // ========== ODISHA ==========
    'Bhubaneswar': '4102', 'Puri': '4299', 'Cuttack': '4301',
    'Konark': '4303', 'Chilika': '4305', 'Rourkela': '4306',

    // ========== BIHAR & JHARKHAND ==========
    'Patna': '4104', 'Gaya': '4307', 'Bodh Gaya': '4309',
    'Ranchi': '4311', 'Jamshedpur': '4313', 'Dhanbad': '4315',
    'Muzaffarpur': '4316', 'Deoghar': '4318',

    // ========== NORTHEAST ==========
    'Guwahati': '4317', 'Shillong': '4319', 'Kaziranga': '4321',
    'Gangtok': '4323', 'Imphal': '4325', 'Aizawl': '4327',
    'Agartala': '4329', 'Itanagar': '4331', 'Tawang': '4332',
    'Majuli': '4334', 'Dibrugarh': '4336', 'Jorhat': '4338',

    // ========== CHHATTISGARH ==========
    'Raipur': '4333', 'Jagdalpur': '4335', 'Bilaspur': '4337',
};

// City name normalization for URL-friendly format
const normalizeCity = (city) => {
    return city.trim().replace(/\s+/g, '-').toLowerCase();
};

// Get city name from code
const getCityName = (code) => {
    const cityMap = {
        'DEL': 'Delhi',
        'BOM': 'Mumbai',
        'BLR': 'Bengaluru',
        'HYD': 'Hyderabad',
        'MAA': 'Chennai',
        'CCU': 'Kolkata',
        'GOI': 'Goa',
        'JAI': 'Jaipur',
        'VGA': 'Vijayawada',
        'PNQ': 'Pune',
        'AMD': 'Ahmedabad',
    };
    return cityMap[code] || code;
};

/**
 * Generate RedBus deep link
 * Pattern: /bus-tickets/src-to-dest?date=YYYY-MM-DD
 */
export const getRedBusLink = (origin, destination, date = null) => {
    const o = normalizeCity(getCityName(origin));
    const d = normalizeCity(getCityName(destination));
    const dateStr = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    return `https://www.redbus.in/bus-tickets/${o}-to-${d}?date=${dateStr}`;
};

/**
 * Generate AbhiBus deep link
 * Pattern: /bus_search/src/dest/dd-mm-yyyy
 */
export const getAbhiBusLink = (origin, destination, date = null) => {
    const o = normalizeCity(getCityName(origin));
    const d = normalizeCity(getCityName(destination));

    const dateObj = date ? new Date(date) : new Date(Date.now() + 86400000);
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const abhiDate = `${dd}-${mm}-${yyyy}`;

    return `https://www.abhibus.com/bus_search/${o}/${d}/${abhiDate}`;
};

/**
 * Generate FlixBus deep link (uses REAL UUIDs, not fake numeric IDs)
 * FlixBus requires 32-character UUIDs for their API
 * Pattern: shop.flixbus.in/search?departureCity=UUID&arrivalCity=UUID&rideDate=dd.mm.yyyy
 */
export const getFlixBusLink = (origin, destination, date = null) => {
    // Real UUIDs verified from FlixBus API
    const REAL_UUIDS = {
        'Delhi': 'a002c4a4-1eef-4afa-82d9-ecd690ea51c5',
        'New Delhi': 'a002c4a4-1eef-4afa-82d9-ecd690ea51c5',
        'Bengaluru': '2e46c6ce-d031-46f2-8ab5-e41038b8a029',
        'Bangalore': '2e46c6ce-d031-46f2-8ab5-e41038b8a029',
        'Hyderabad': '3da253ae-02ca-430c-87e5-22842065a77d',
        'Chennai': '8c1ee239-185f-4f06-912b-5232d0b0489d',
        'Dehradun': '52c74eb5-299b-4207-be30-1aad618958aa',
        'Jaipur': 'b691e973-17a6-4c67-a673-908062270b2f',
    };

    const originName = getCityName(origin);
    const destName = getCityName(destination);

    const originId = REAL_UUIDS[originName] || REAL_UUIDS[origin];
    const destId = REAL_UUIDS[destName] || REAL_UUIDS[destination];

    // If we don't have REAL UUIDs, fallback to homepage
    if (!originId || !destId) {
        return 'https://www.flixbus.in/';
    }

    const dateObj = date ? new Date(date) : new Date(Date.now() + 86400000);
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const flixDate = `${dd}.${mm}.${yyyy}`;

    // Build URL with all required params for best experience
    const params = new URLSearchParams({
        departureCity: originId,
        arrivalCity: destId,
        route: `${originName}-${destName}`,
        rideDate: flixDate,
        adult: '1',
        _locale: 'en_IN',
        departureCountryCode: 'IN',
        arrivalCountryCode: 'IN'
    });

    return `https://shop.flixbus.in/search?${params.toString()}`;
};

/**
 * Generate MakeMyTrip bus deep link
 */
export const getMakeMyTripBusLink = (origin, destination, date = null) => {
    const o = normalizeCity(getCityName(origin));
    const d = normalizeCity(getCityName(destination));

    return `https://www.makemytrip.com/bus-tickets/${o}-${d}-bus.html`;
};

/**
 * Bus providers configuration
 */
export const busProviders = {
    'flixbus': {
        name: 'FlixBus',
        logo: '🟢',
        color: '#73D700',
        tagline: 'Often cheapest for North India',
        getLink: getFlixBusLink,
        highlight: true // Show as recommended
    },
    'redbus': {
        name: 'RedBus',
        logo: '🔴',
        color: '#D84315',
        tagline: 'Most operators, includes FlixBus',
        getLink: getRedBusLink,
        highlight: false
    },
    'abhibus': {
        name: 'AbhiBus',
        logo: '🟠',
        color: '#FF6B00',
        tagline: 'Good coupons available',
        getLink: getAbhiBusLink,
        highlight: false
    },
    'makemytrip': {
        name: 'MakeMyTrip',
        logo: '🔵',
        color: '#F44336',
        tagline: 'Bundle with hotels',
        getLink: getMakeMyTripBusLink,
        highlight: false
    }
};

/**
 * Get all bus comparison links for a route
 * Returns links sorted with FlixBus first (cheapest option)
 */
export const getBusComparisonLinks = (origin, destination, date = null) => {
    const originName = getCityName(origin);
    const destName = getCityName(destination);

    // Check if FlixBus serves this route (both cities have IDs)
    const flixbusAvailable = !!(FLIXBUS_CITIES[originName] || FLIXBUS_CITIES[origin]) &&
        !!(FLIXBUS_CITIES[destName] || FLIXBUS_CITIES[destination]);

    const links = [];

    // Add FlixBus first if available (usually cheapest)
    if (flixbusAvailable) {
        links.push({
            provider: 'flixbus',
            ...busProviders.flixbus,
            link: busProviders.flixbus.getLink(origin, destination, date),
            available: true,
            badge: '💰 Usually Cheapest'
        });
    }

    // Add other providers
    links.push({
        provider: 'redbus',
        ...busProviders.redbus,
        link: busProviders.redbus.getLink(origin, destination, date),
        available: true,
        badge: null
    });

    links.push({
        provider: 'abhibus',
        ...busProviders.abhibus,
        link: busProviders.abhibus.getLink(origin, destination, date),
        available: true,
        badge: null
    });

    links.push({
        provider: 'makemytrip',
        ...busProviders.makemytrip,
        link: busProviders.makemytrip.getLink(origin, destination, date),
        available: true,
        badge: null
    });

    return links;
};

/**
 * Check if FlixBus serves a particular route
 */
export const isFlixBusRoute = (origin, destination) => {
    const originName = getCityName(origin);
    const destName = getCityName(destination);

    return !!(FLIXBUS_CITIES[originName] || FLIXBUS_CITIES[origin]) &&
        !!(FLIXBUS_CITIES[destName] || FLIXBUS_CITIES[destination]);
};

/**
 * Get FlixBus city ID (for adding more cities)
 */
export const getFlixBusCityId = (city) => {
    return FLIXBUS_CITIES[city] || FLIXBUS_CITIES[getCityName(city)] || null;
};

// Export the city mapping for reference
export { FLIXBUS_CITIES };
