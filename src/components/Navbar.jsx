import { Map, User } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
            <div className="container mx-auto px-4 max-w-2xl h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <Map className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold font-display tracking-tight text-blue-600">Travio</span>
                </div>

                <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <User className="w-5 h-5" />
                    </div>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
