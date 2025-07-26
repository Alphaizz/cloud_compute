import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Helper component for icons (using inline SVGs)
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

// Icon paths
const ICONS = {
  user: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  calendar: "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  clock: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  users: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  leaf: "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.96 16.17 11 13 17 11V8zM17 3C9.24 3 4.67 7.54 2.5 13.5c-.59 1.63-.59 3.43.0 5.16l1.89-.66c-.4-1.21-.4-2.5.0-3.7C6.58 8.33 11.37 5 17 5V3z",
  sparkles: "M12 2l2.35 5.65L20 10l-5.65 2.35L12 18l-2.35-5.65L4 10l5.65-2.35z",
  menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  email: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  location: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { session, signOut } = useAuth(); 
    const navLinks = [
        { href: "#home", label: "Home" },
        { href: "#menu", label: "Menu" },
        { href: "#reserve", label: "Reserve" },
        { href: "#contact", label: "Contact" },
    ];  

    return (
        <header className="bg-gray-900 bg-opacity-80 backdrop-blur-sm fixed top-0 left-0 right-0 z-40 shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <a href="#home" className="text-2xl font-bold text-amber-500">The Gourmet Place</a>
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <a key={link.href} href={link.href} className="text-gray-300 hover:text-amber-500 transition duration-300">{link.label}</a>
                        ))}
                        {session ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/profile" className="text-gray-300 hover:text-amber-500 transition duration-300 font-semibold">Profile</Link>
                                <button onClick={signOut} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm">Sign Out</button>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300">Login</Link>
                        )}
                    </nav>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <Icon path={isMenuOpen ? ICONS.close : ICONS.menu} className="w-8 h-8 text-white" />
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden bg-gray-900">
                    <nav className="flex flex-col items-center space-y-4 py-4">
                        {navLinks.map(link => (
                            <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-amber-500 transition duration-300 py-2">{link.label}</a>
                        ))}
                        {session ? (
                            <div className="flex flex-col items-center space-y-4 mt-2 w-full px-4">
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-amber-500 transition duration-300 py-2 font-semibold">Profile</Link>
                                <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 w-full">Sign Out</button>
                            </div>
                        ) : (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 mt-2">Login</Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default function Home() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState({
    date: '',
    time: '19:00',
    guests: 2,
  });
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservation(prev => ({ ...prev, [name]: value }));
  };

  const handleReservationSubmit = (e) => {
    e.preventDefault();
    console.log('Reservation Submitted:', reservation);
    setIsReservationModalOpen(true);
  };
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setReservation(prev => ({...prev, date: today}));
  }, []);

  const handleBookTableClick = (e) => {
    e.preventDefault();
    if (session) {
        navigate('/chat');
    } else {
        navigate('/login', { state: { from: { pathname: '/chat' } } });
    }
  };

  return (
    <div className="bg-gray-900 text-white font-sans">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
          <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{backgroundImage: "url('https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop')", opacity: 0.3}}>
          </div>
          <div className="relative z-10 text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white">
              <span className="block">Experience Culinary Excellence</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
              Reserve your table at The Gourmet Place and embark on an unforgettable dining journey.
            </p>
            <div className="mt-8">
              <a href="#reserve" onClick={handleBookTableClick} className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105">
                Book a Table with AI
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-800 p-5 rounded-full mb-4">
                            <Icon path={ICONS.leaf} className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Fresh Ingredients</h3>
                        <p className="text-gray-400">We source the finest local ingredients to create dishes that are both delicious and wholesome.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-800 p-5 rounded-full mb-4">
                             <Icon path={ICONS.sparkles} className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Cozy Ambiance</h3>
                        <p className="text-gray-400">Our restaurant offers a warm and inviting atmosphere, perfect for any occasion.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-800 p-5 rounded-full mb-4">
                            <Icon path={ICONS.user} className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Expert Chefs</h3>
                        <p className="text-gray-400">Our culinary team is dedicated to crafting creative and mouth-watering menus.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Menu Section */}
        <section id="menu" className="py-20 bg-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white">Our Menu</h2>
                    <p className="text-gray-400 mt-2">A taste of perfection.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-amber-500 border-b-2 border-amber-500 pb-2">Appetizers</h3>
                        <div className="flex justify-between"><p>Bruschetta</p><p className="font-semibold">$12</p></div>
                        <div className="flex justify-between"><p>Calamari Fritti</p><p className="font-semibold">$15</p></div>
                        <div className="flex justify-between"><p>Stuffed Mushrooms</p><p className="font-semibold">$14</p></div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-amber-500 border-b-2 border-amber-500 pb-2">Main Courses</h3>
                        <div className="flex justify-between"><p>Filet Mignon</p><p className="font-semibold">$45</p></div>
                        <div className="flex justify-between"><p>Pan-Seared Salmon</p><p className="font-semibold">$32</p></div>
                        <div className="flex justify-between"><p>Lobster Risotto</p><p className="font-semibold">$38</p></div>
                    </div>
                </div>
            </div>
        </section>

        {/* Reservation Form Section */}
        <section id="reserve" className="py-20 bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Make a Reservation</h2>
              <p className="text-gray-400 mt-2">Secure your spot in minutes.</p>
            </div>
            <form onSubmit={handleReservationSubmit} className="bg-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Icon path={ICONS.calendar} className="w-5 h-5 text-gray-500" /></span>
                    <input type="date" id="date" name="date" value={reservation.date} onChange={handleInputChange} required className="w-full bg-gray-700 border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
                  </div>
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-400 mb-2">Time</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Icon path={ICONS.clock} className="w-5 h-5 text-gray-500" /></span>
                    <select id="time" name="time" value={reservation.time} onChange={handleInputChange} required className="w-full bg-gray-700 border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 appearance-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition">
                      {Array.from({ length: 10 }, (_, i) => 17 + i).flatMap(h => [`${h}:00`, `${h}:30`]).map(t => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-400 mb-2">Guests</label>
                  <div className="relative">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Icon path={ICONS.users} className="w-5 h-5 text-gray-500" /></span>
                    <input type="number" id="guests" name="guests" min="1" max="12" value={reservation.guests} onChange={handleInputChange} required className="w-full bg-gray-700 border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-101">
                Find a Table
              </button>
            </form>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white">Contact Us</h2>
                    <p className="text-gray-400 mt-2">Get in touch with us.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <Icon path={ICONS.location} className="w-8 h-8 text-amber-500" />
                            <div>
                                <h3 className="text-xl font-semibold">Address</h3>
                                <p className="text-gray-400">123 Culinary Lane, Foodie City, 12345</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Icon path={ICONS.email} className="w-8 h-8 text-amber-500" />
                            <div>
                                <h3 className="text-xl font-semibold">Email</h3>
                                <p className="text-gray-400">contact@thegourmetplace.com</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Icon path={ICONS.phone} className="w-8 h-8 text-amber-500" />
                            <div>
                                <h3 className="text-xl font-semibold">Phone</h3>
                                <p className="text-gray-400">(123) 456-7890</p>
                            </div>
                        </div>
                    </div>
                    <form className="bg-gray-900 p-8 rounded-2xl shadow-2xl space-y-4">
                        <input type="text" placeholder="Your Name" className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" />
                        <input type="email" placeholder="Your Email" className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" />
                        <textarea placeholder="Your Message" rows="4" className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"></textarea>
                        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">Send Message</button>
                    </form>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} The Gourmet Place. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Reservation Confirmation Modal */}
      {isReservationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Reservation Received!</h3>
            <p className="text-gray-300 mb-6">
              Thank you! Your request for a table for {reservation.guests} on {reservation.date} at {reservation.time} has been received. We'll contact you shortly to confirm.
            </p>
            <button onClick={() => setIsReservationModalOpen(false)} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
