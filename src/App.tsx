import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './store/AppContext';
import { ShoppingBag, Star, User, Home as HomeIcon, Coins, MessageSquare, ChevronLeft, ArrowRight, Filter, Search, Globe, MapPin, Heart, Bell, Shield, LogOut, TrendingUp, DollarSign, Key, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Product, Message, VeloNotification } from './types';
import { Language } from './lib/translations';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- Shared Components ---

const SearchModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { products } = useApp();
  const [query, setQuery] = useState('');
  
  const results = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl bg-bg-secondary border border-border rounded-[2.5rem] shadow-2xl relative overflow-hidden">
         <div className="p-8 border-b border-border flex items-center gap-4">
            <Search className="text-accent" size={24} />
            <input 
              autoFocus
              placeholder="Search the protocol..."
              className="flex-1 bg-transparent text-xl font-bold text-white focus:outline-none placeholder:text-zinc-700"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
         </div>
         <div className="p-4">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest p-4 pb-2">Artifact Suggestions</p>
            {results.length > 0 ? results.map(p => (
              <button key={p.id} onClick={onClose} className="w-full text-left p-4 rounded-2xl hover:bg-zinc-800/50 flex items-center justify-between group transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-bg-primary overflow-hidden border border-border">
                       <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <h4 className="text-white font-bold">{p.name}</h4>
                       <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{p.category}</p>
                    </div>
                 </div>
                 <span className="text-accent font-mono font-bold">${p.price}</span>
              </button>
            )) : (
              <p className="p-8 text-center text-zinc-600 italic">No artifacts matching query</p>
            )}
         </div>
      </motion.div>
    </div>
  );
};

const NotificationsPanel = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { notifications, markNotificationRead, clearNotifications, user } = useApp();
  const myNotifs = notifications.filter(n => n.userId === user?.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-md bg-bg-secondary border-l border-border shadow-2xl overflow-hidden flex flex-col">
       <div className="p-8 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Bell className="text-accent" size={20} />
             <h3 className="text-xl font-bold text-white tracking-tighter">Transmission Log</h3>
          </div>
          <button onClick={clearNotifications} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-red-500">Purge Log</button>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {myNotifs.length > 0 ? myNotifs.map(n => (
            <div key={n.id} onClick={() => markNotificationRead(n.id)} className={cn("p-6 rounded-[2rem] border transition-all cursor-pointer relative", n.isRead ? "bg-bg-primary border-border opacity-60" : "bg-accent/5 border-accent/20")}>
               <div className="flex justify-between items-start mb-2">
                  <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border", n.type === 'order' ? "text-green-500 border-green-500/20" : "text-blue-500 border-blue-500/20")}>{n.type}</span>
                  <span className="text-[9px] text-zinc-600 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
               </div>
               <h4 className="text-white font-bold text-sm mb-1">{n.title}</h4>
               <p className="text-zinc-500 text-xs leading-relaxed">{n.message}</p>
               {!n.isRead && <div className="absolute top-6 right-6 w-2 h-2 bg-accent rounded-full" />}
            </div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
               <Bell size={48} className="mb-4" />
               <p className="font-black uppercase tracking-widest text-xs font-mono italic">No transmissions found</p>
            </div>
          )}
       </div>
       <div className="p-6 border-t border-border">
          <button onClick={onClose} className="w-full bg-accent text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs">Acknowledge</button>
       </div>
    </div>
  );
};

const Messaging = () => {
  const { user, messages, users, sendMessage } = useApp();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [text, setText] = useState('');

  if (!user) return null;

  const contacts = users.filter(u => u.id !== user.id);
  const activeChatMessages = messages.filter(m => 
    (m.senderId === user.id && m.receiverId === selectedUser) || 
    (m.senderId === selectedUser && m.receiverId === user.id)
  ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 h-[calc(100vh-12rem)] flex gap-6">
       <div className="w-80 bg-bg-secondary border border-border rounded-[2.5rem] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border">
             <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <MessageSquare size={18} className="text-accent" /> Active Nodes
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
             {contacts.map(contact => (
               <button 
                 key={contact.id} 
                 onClick={() => setSelectedUser(contact.id)}
                 className={cn(
                   "w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left",
                   selectedUser === contact.id ? "bg-accent/10 border border-accent/20" : "hover:bg-bg-primary border border-transparent"
                 )}
               >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 capitalize">
                     {contact.email.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-white font-bold text-sm truncate">{contact.email.split('@')[0]}</p>
                     <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{contact.role}</p>
                  </div>
                  {contact.pgpPublicKey && <Lock size={10} className="text-accent opacity-40" />}
               </button>
             ))}
          </div>
       </div>

       <div className="flex-1 bg-bg-secondary border border-border rounded-[2.5rem] flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              <div className="p-6 border-b border-border flex items-center justify-between bg-accent/5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-accent capitalize">
                       {users.find(u => u.id === selectedUser)?.email.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-white tracking-tight">{users.find(u => u.id === selectedUser)?.email}</h3>
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Protocol Active</span>
                       </div>
                    </div>
                 </div>
                 {users.find(u => u.id === selectedUser)?.pgpPublicKey && (
                   <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg">
                      <Lock size={12} className="text-accent" />
                      <span className="text-[9px] font-black text-accent uppercase tracking-widest">E2E Encrypted</span>
                   </div>
                 )}
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                 {activeChatMessages.map(msg => (
                   <div key={msg.id} className={cn("flex flex-col max-w-[70%]", msg.senderId === user.id ? "ml-auto items-end" : "mr-auto items-start")}>
                      <div className={cn("p-4 rounded-2xl text-xs leading-relaxed font-mono whitespace-pre-wrap break-words", msg.senderId === user.id ? "bg-accent text-black font-bold" : "bg-bg-primary border border-border text-zinc-300")}>
                         {msg.content}
                      </div>
                      <span className="text-[9px] text-zinc-600 mt-2 flex items-center gap-1">
                         {new Date(msg.timestamp).toLocaleTimeString()}
                         {msg.isEncrypted && <Lock size={8} />}
                      </span>
                   </div>
                 ))}
                 {activeChatMessages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <Lock size={48} className="mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">Initialize secure transmission session</p>
                   </div>
                 )}
              </div>
              <div className="p-6 border-t border-border bg-bg-primary/50">
                 <form 
                   onSubmit={(e) => {
                     e.preventDefault();
                     if (!text) return;
                     sendMessage(selectedUser, text);
                     setText('');
                   }}
                   className="flex gap-4"
                 >
                    <input 
                      placeholder="Transmit message..."
                      className="flex-1 bg-bg-secondary border border-border rounded-xl p-4 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <button className="bg-accent text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg shadow-accent/20">Transmit</button>
                 </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20">
               <MessageSquare size={80} className="mb-6" />
               <p className="text-xl font-black uppercase tracking-[0.3em]">Selection Required</p>
               <p className="text-xs mt-2 italic font-mono">Select a node from the registry to begin encrypted synthesis</p>
            </div>
          )}
       </div>
    </div>
  );
};

const WishlistView = () => {
  const { user, products, toggleWishlist } = useApp();
  const wishlistItems = products.filter(p => user?.wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
       <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">Node <span className="text-accent italic">Wishlist.</span></h1>
          <p className="text-zinc-600 text-sm font-mono mt-2 uppercase tracking-widest">Cached artifacts for future integration</p>
       </div>

       {wishlistItems.length === 0 ? (
         <div className="py-40 text-center bg-bg-secondary/30 rounded-[3rem] border border-dashed border-border flex flex-col items-center">
            <Heart size={48} className="text-zinc-800 mb-6" />
            <p className="text-zinc-600 font-bold uppercase tracking-widest">No artifacts cached in wishlist</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map(p => (
              <div key={p.id} className="bg-bg-secondary border border-border p-6 rounded-[2.5rem] relative group">
                 <button onClick={() => toggleWishlist(p.id)} className="absolute top-8 right-8 z-10 p-3 bg-red-500/20 text-red-500 rounded-full border border-red-500/20 hover:scale-110 transition-transform">
                    <Heart size={16} fill="currentColor" />
                 </button>
                 <div className="aspect-square bg-bg-primary rounded-2xl overflow-hidden mb-6">
                    <img src={p.image} className="w-full h-full object-cover grayscale opacity-60" />
                 </div>
                 <h4 className="text-white font-bold text-xl mb-1">{p.name}</h4>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-accent font-black uppercase tracking-widest">{p.category}</span>
                    <span className="text-white font-mono font-bold">${p.price}</span>
                 </div>
              </div>
            ))}
         </div>
       )}
    </div>
  );
};

const Navbar = ({ onViewChange, currentView }: { onViewChange: (v: string) => void, currentView: string }) => {
  const { user, t, language, setLanguage, logout, messages, notifications } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadMessages = messages.filter(m => m.receiverId === user?.id && !m.isRead).length;
  const unreadNotifs = notifications.filter(n => n.userId === user?.id && !n.isRead).length;
  
  if (!user) return null;

  return (
    <>
    <nav className="sticky top-0 z-50 w-full bg-bg-secondary/80 backdrop-blur-md border-b border-border px-4 md:px-8 h-16 flex items-center justify-between">
      <div 
        className="flex items-center gap-4 md:gap-6 cursor-pointer group" 
        onClick={() => onViewChange('home')}
      >
        <span className="text-white font-bold text-lg md:text-xl tracking-tighter uppercase">Velo<span className="text-accent text-2xl md:text-xl">.</span></span>
        
        {/* Language Selector */}
        <div className="hidden sm:flex items-center gap-1 bg-zinc-900/50 border border-border rounded-lg px-2 py-1">
          <Globe size={12} className="text-zinc-500" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-[10px] font-bold text-zinc-400 focus:outline-none cursor-pointer uppercase tracking-widest"
          >
            <option value="EN">EN</option>
            <option value="RU">RU</option>
            <option value="DE">DE</option>
            <option value="FR">FR</option>
            <option value="ES">ES</option>
            <option value="JA">JA</option>
            <option value="ZH">ZH</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="hidden lg:flex items-center space-x-6 text-xs md:text-sm font-medium text-zinc-500">
          {[
            { id: 'home', label: t.marketplace, icon: null },
            { id: 'messages', label: 'Messages', icon: <MessageSquare size={14} />, badge: unreadMessages },
            { id: 'wishlist', label: 'Wishlist', icon: <Heart size={14} />, badge: 0 },
            { id: 'profile', label: t.myAccount, icon: <User size={14} /> },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "transition-colors hover:text-white flex items-center gap-2 relative",
                currentView === item.id ? "text-white" : "text-zinc-500"
              )}
            >
              {item.icon}
              {item.label}
              {item.badge ? <span className="absolute -top-2 -right-3 bg-accent text-black text-[8px] font-black px-1 rounded-full">{item.badge}</span> : null}
            </button>
          ))}
          
          {user?.role === 'reseller' && (
            <button 
              onClick={() => onViewChange('shop')}
              className={cn(
                "transition-colors hover:text-accent flex items-center gap-2",
                currentView === 'shop' ? "text-accent" : "text-zinc-500"
              )}
            >
              <ShoppingBag size={14} /> <span className="hidden sm:inline">Shop</span>
            </button>
          )}

          {user?.isAdmin && (
            <button 
              onClick={() => onViewChange('admin')}
              className={cn(
                "transition-colors hover:text-red-500 flex items-center gap-2",
                currentView === 'admin' ? "text-red-500" : "text-zinc-500"
              )}
            >
              <Shield size={14} /> <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-4 border-l border-border">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 text-zinc-500 hover:text-white transition-colors">
             <Search size={18} />
          </button>
          
          <button onClick={() => setIsNotifOpen(true)} className="p-2 text-zinc-500 hover:text-white transition-colors relative">
             <Bell size={18} />
             {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
          </button>

          <div className="bg-zinc-900 rounded-full px-3 md:px-4 py-1 md:py-1.5 flex items-center space-x-1 md:space-x-2 border border-zinc-800">
            <div className="w-4 h-4 md:w-5 md:h-5 bg-accent rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold text-black">$</div>
            <span className="text-accent font-mono font-bold text-xs md:text-base tracking-tight">
              {user?.veloCoins.toLocaleString()}
            </span>
          </div>
          <button 
             onClick={logout}
             className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
    <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    <NotificationsPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

const Auth = () => {
  const { register, language, setLanguage, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [role, setRole] = useState<'buyer' | 'reseller'>('buyer');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !passcode) return;
    setIsLoading(true);
    await register(email, password, passcode, role);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-bg-secondary border border-border p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative"
      >
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 mb-6">
            <Globe className="text-accent" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter mb-2">Velo<span className="text-accent">.</span>Market</h1>
          <p className="text-zinc-500 text-xs uppercase font-bold tracking-[0.2em] mb-6">{t.auth.subtitle}</p>
          
          <div className="flex items-center justify-center gap-2 bg-zinc-900/50 border border-border rounded-xl px-4 py-2 w-fit mx-auto">
            <Globe size={14} className="text-accent" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-[10px] font-black text-white focus:outline-none cursor-pointer uppercase tracking-[0.2em]"
            >
              <option value="EN">English</option>
              <option value="RU">Русский</option>
              <option value="DE">Deutsch</option>
              <option value="FR">Français</option>
              <option value="ES">Español</option>
              <option value="JA">日本語</option>
              <option value="ZH">中文</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">{t.auth.email}</label>
            <input 
              type="email" 
              placeholder="e.g. user@protocol.io"
              className="w-full bg-bg-primary border border-border rounded-2xl p-5 text-white focus:outline-none focus:border-accent transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">{t.auth.password} (min 6 chars)</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-bg-primary border border-border rounded-2xl p-5 text-white focus:outline-none focus:border-accent transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">{t.auth.passcode}</label>
            <input 
              type="text" 
              placeholder="Vault key..."
              className="w-full bg-bg-primary border border-border rounded-2xl p-5 text-white focus:outline-none focus:border-accent transition-colors font-mono"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">{t.auth.identity}</label>
            <div className="flex gap-4">
              <button 
                type="button"
                disabled={isLoading}
                onClick={() => setRole('buyer')}
                className={cn(
                  "flex-1 p-6 rounded-[2rem] border transition-all text-center group",
                  role === 'buyer' ? "bg-accent/10 border-accent text-accent" : "bg-bg-primary border-border text-zinc-500 hover:border-zinc-700"
                )}
              >
                <div className="font-bold text-sm mb-1">{t.auth.buyer}</div>
                <div className="text-[9px] uppercase tracking-widest opacity-60">{t.auth.buyerDesc}</div>
              </button>
              <button 
                type="button"
                disabled={isLoading}
                onClick={() => setRole('reseller')}
                className={cn(
                  "flex-1 p-6 rounded-[2rem] border transition-all text-center group",
                  role === 'reseller' ? "bg-accent/10 border-accent text-accent" : "bg-bg-primary border-border text-zinc-500 hover:border-zinc-700"
                )}
              >
                <div className="font-bold text-sm mb-1">{t.auth.reseller}</div>
                <div className="text-[9px] uppercase tracking-widest opacity-60">{t.auth.resellerDesc}</div>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-accent text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-xs hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 transition-all shadow-xl shadow-accent/10 mt-4 h-16 flex items-center justify-center"
          >
            {isLoading ? t.auth.generating : t.auth.connect}
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] text-zinc-700 uppercase tracking-widest">
          {t.auth.disclaimer}
        </p>
      </motion.div>
    </div>
  );
};

// --- Pages ---

const Home = ({ onProductSelect }: { onProductSelect: (id: string) => void }) => {
  const { products, t, user, toggleWishlist } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [country, setCountry] = useState('all');
  const [city, setCity] = useState('all');

  const categories = products.map(p => p.category);
  const countries = products.map(p => p.country);
  const cities = products.filter(p => country === 'all' || p.country === country).map(p => p.city);

  const uniqueCategories = ['all', ...new Set(categories)];
  const uniqueCountries = ['all', ...new Set(countries)];
  const uniqueCities = ['all', ...new Set(cities)];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                         product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesCountry = country === 'all' || product.country === country;
    const matchesCity = city === 'all' || product.city === city;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesCountry && matchesCity;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16"
    >
      <div className="mb-12 md:mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-light text-white tracking-tighter mb-4">{t.nextDimension.split(' ')[0]} <span className="text-accent italic">{t.nextDimension.split(' ').slice(1).join(' ')}.</span></h1>
          <p className="text-zinc-500 max-w-lg text-base md:text-lg leading-relaxed">{t.heroSubtitle}</p>
        </div>
        
        <div className="w-full lg:w-96 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            className="w-full bg-bg-secondary border border-border rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent/50 transition-colors placeholder:text-zinc-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 p-4 md:p-6 bg-bg-secondary rounded-[2rem] border border-border">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-2">{t.filters.category}</label>
          <select 
            className="bg-bg-primary border border-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent/50"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {uniqueCategories.map(c => <option key={c} value={c}>{c === 'all' ? t.filters.all : c}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-2 flex justify-between">
            <span>{t.filters.price}</span>
            <span className="text-accent font-mono text-[9px]">${priceRange[0]} - ${priceRange[1]}</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="1000" 
            step="10"
            className="accent-accent h-2 mt-2 md:mt-4"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-2 flex items-center gap-1">
            <Globe size={10} /> {t.filters.origin}
          </label>
          <select 
            className="bg-bg-primary border border-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent/50"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setCity('all');
            }}
          >
            {uniqueCountries.map(c => <option key={c} value={c}>{c === 'all' ? t.filters.all : c}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-2 flex items-center gap-1">
            <MapPin size={10} /> {t.filters.sector}
          </label>
          <select 
            className="bg-bg-primary border border-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent/50"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {uniqueCities.map(c => <option key={c} value={c}>{c === 'all' ? t.filters.all : c}</option>)}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="py-32 text-center bg-bg-secondary/30 rounded-[3rem] border border-dashed border-border">
          <Search size={48} className="mx-auto text-zinc-800 mb-4" />
          <p className="text-zinc-600 font-bold uppercase tracking-widest">No matching artifacts found</p>
          <button 
            onClick={() => {
              setSearch('');
              setCategory('all');
              setPriceRange([0, 1000]);
              setCountry('all');
              setCity('all');
            }}
            className="mt-6 text-accent text-xs font-bold uppercase tracking-widest hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts.map((product) => (
            <motion.div 
              layout
              key={product.id}
              whileHover={{ y: -8 }}
              className="group cursor-pointer relative"
              onClick={() => onProductSelect(product.id)}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                className={cn(
                  "absolute top-4 right-4 z-20 p-2.5 rounded-xl border transition-all",
                  user?.wishlist.includes(product.id) ? "bg-accent border-accent text-black" : "bg-black/40 backdrop-blur border-white/10 text-white/40 hover:text-white"
                )}
              >
                <Heart size={14} fill={user?.wishlist.includes(product.id) ? "currentColor" : "none"} />
              </button>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-bg-secondary border border-border mb-6">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-black/60 backdrop-blur text-[10px] text-white px-2 py-1 rounded-md border border-white/10 uppercase tracking-widest font-bold flex items-center gap-1">
                      <Globe size={10} /> {product.country}
                   </div>
                   <div className="bg-black/60 backdrop-blur text-[10px] text-white px-2 py-1 rounded-md border border-white/10 uppercase tracking-widest font-bold flex items-center gap-1">
                      <MapPin size={10} /> {product.city}
                   </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl inline-block shadow-2xl">
                    <span className="text-white font-mono font-bold">${product.price}</span>
                  </div>
                </div>
                {product.isFeatured && (
                   <div className="absolute top-6 left-6 rotate-[-15deg] origin-top-left -translate-x-2 -translate-y-2">
                       <div className="bg-accent text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/20 border-2 border-black/20">
                          ELITE
                       </div>
                   </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 px-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-black">{product.category}</span>
                <h3 className="font-bold text-lg text-white tracking-tight">{product.name}</h3>
                <p className="text-zinc-500 text-sm">{product.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const ProductDetail = ({ productId, onBack, onContactSeller }: { productId: string, onBack: () => void, onContactSeller: (sellerId: string) => void }) => {
  const { products, buyProduct, getReviewsForProduct, user, users, toggleWishlist, t } = useApp();
  const product = products.find(p => p.id === productId);
  const reviews = getReviewsForProduct(productId);
  const seller = users.find(u => u.id === product?.sellerId);

  if (!product) return null;

  const chartData = [
    { name: 'Node-1', price: product.price * 1.2 },
    { name: 'Node-2', price: product.price * 1.15 },
    { name: 'Node-3', price: product.price * 1.3 },
    { name: 'Node-4', price: product.price * 1.1 },
    { name: 'Final', price: product.price },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16"
    >
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {t.catalog}
        </button>
        <button 
          onClick={() => toggleWishlist(product.id)}
          className={cn(
             "p-3 rounded-xl border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest leading-none",
             user?.wishlist.includes(product.id) ? "bg-accent border-accent text-black" : "bg-bg-secondary border-border text-zinc-500 hover:text-white"
          )}
        >
           <Heart size={14} fill={user?.wishlist.includes(product.id) ? "currentColor" : "none"} />
           {user?.wishlist.includes(product.id) ? 'Cached In Node' : 'Cache Artifact'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 mb-20 md:mb-32">
        <div className="rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-bg-secondary border border-border aspect-square relative shadow-2xl">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="px-4 py-1 rounded-full border border-accent/30 bg-accent/5 text-[10px] text-accent font-black uppercase tracking-[0.2em] w-fit">
              {t.product.pioneer}
            </div>
            {seller && (
               <div className="px-4 py-1 rounded-full border border-border bg-bg-secondary text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Star size={10} className="text-accent" /> Node Reputation: {seller.reputation}%
               </div>
            )}
          </div>
          <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter mb-4 md:mb-6">{product.name}</h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-8 md:mb-12 leading-relaxed font-light">{product.description}</p>
          
          <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
            <span className="text-3xl md:text-5xl font-bold text-white tracking-tighter">${product.price}</span>
            <div className="h-8 md:h-10 w-[1px] bg-border"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Protocol Value</span>
              <span className="text-zinc-600 line-through font-mono text-sm md:text-base">${Math.round(product.price * 1.2)}</span>
            </div>
          </div>

          <div className="flex gap-4">
             <button 
               onClick={() => buyProduct(product.id)}
               className="flex-1 bg-white text-black py-5 md:py-6 rounded-2xl font-black md:text-lg tracking-tight hover:bg-zinc-200 transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3"
             >
               <span>{t.product.purchase}</span>
               <ArrowRight size={20} />
             </button>
             {seller && seller.id !== user?.id && (
                <button 
                  onClick={() => onContactSeller(seller.id)}
                  className="px-6 bg-bg-secondary border border-border text-white rounded-2xl hover:bg-zinc-800 transition-colors"
                  title="Contact Seller"
                >
                   <MessageSquare size={24} />
                </button>
             )}
          </div>

          <div className="mt-6 md:mt-8 flex items-center gap-3 text-[10px] md:text-xs text-accent font-bold uppercase tracking-widest">
            <Coins size={16} />
            <span>+50 ${t.veloCoins} {t.product.bounty}</span>
          </div>
        </div>
      </div>

      <div className="mb-20 md:mb-32">
         <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-8">Value <span className="text-accent italic">Trajectory.</span></h2>
         <div className="h-[300px] md:h-[400px] w-full bg-bg-secondary border border-border rounded-[3rem] p-8 md:p-12 overflow-hidden relative">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData}>
                  <Line type="monotone" dataKey="price" stroke="#ff4757" strokeWidth={3} dot={{ fill: '#ff4757', r: 6 }} activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }} />
                  <CartesianGrid stroke="#27272a" strokeDasharray="5 5" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                  <Tooltip 
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#ff4757', fontWeight: 'bold' }}
                    labelStyle={{ color: '#52525b', fontSize: '10px', textTransform: 'uppercase' }}
                  />
               </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="mt-20 md:mt-40">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-16 border-b border-border pb-8 md:pb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{t.product.publicRecord}</h2>
            <p className="text-zinc-500 text-sm md:text-base">{t.product.analysisSubtitle}</p>
          </div>
          <div className="flex items-center gap-4 bg-bg-secondary w-fit px-6 py-3 rounded-2xl border border-border">
            <div className="flex text-accent">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <span className="font-mono font-bold text-white text-lg md:text-xl">{reviews.length}</span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20 md:py-32 bg-bg-secondary/50 rounded-[2rem] md:rounded-[3rem] border border-zinc-800/50">
             <MessageSquare size={40} className="mx-auto text-zinc-800 mb-6" />
             <p className="text-zinc-600 font-bold text-xs md:text-sm uppercase tracking-widest">{t.product.analysisPlaceholder}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {reviews.map(review => (
              <div key={review.id} className="p-8 md:p-10 bg-bg-secondary border border-border rounded-[2rem] md:rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center gap-1 mb-4 md:mb-6">
                  {[...Array(5)].map((StarReview, i) => (
                    <Star 
                      key={i} 
                      size={12}
                      className={i < review.rating ? "text-accent fill-accent" : "text-zinc-800"} 
                    />
                  ))}
                </div>
                <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 md:mb-10 font-light italic">"{review.comment}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <User size={14} className="text-zinc-500" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-bold text-white">Identity Verified</div>
                    <div className="text-[9px] uppercase text-zinc-600 font-mono tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Profile = ({ onSelectProductToReview }: { onSelectProductToReview: (id: string) => void }) => {
  const { user, products, reviews, orders, transactions, submitCryptoPayment, createDispute, addDisputeMessage, t } = useApp();
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [txId, setTxId] = useState('');
  const [amount, setAmount] = useState(100);
  const [disputeOpen, setDisputeOpen] = useState<string | null>(null);
  const [showPayload, setShowPayload] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  
  if (!user) return null;

  const purchasedProducts = products.filter(p => user.purchases.includes(p.id));
  const productsToReview = purchasedProducts.filter(p => !reviews.some(r => r.productId === p.id && r.userId === user.id));

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId) return;
    submitCryptoPayment(txId, amount);
    setTxId('');
    setShowBuyCoins(false);
  };

  const handleDispute = (orderId: string) => {
    createDispute(orderId, disputeReason);
    setDisputeOpen(null);
    setDisputeReason('');
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* SIDEBAR: PROTOCOL_TASKS */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border bg-bg-secondary flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Operational_Tasks</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-6 rounded-[2rem] bg-bg-primary border border-border">
              <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">Pending_Analysis</h3>
              <div className="space-y-3">
                {productsToReview.length > 0 ? productsToReview.map(product => (
                  <button 
                    key={product.id} 
                    className="w-full p-4 rounded-xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-all text-left flex items-start gap-3 group"
                    onClick={() => onSelectProductToReview(product.id)}
                  >
                    <div className="mt-1"><Star size={10} className="text-accent" /></div>
                    <div>
                      <p className="text-[11px] font-bold text-white group-hover:text-accent transition-colors leading-tight">{product.name}</p>
                      <p className="text-[9px] text-accent mt-1 font-mono uppercase tracking-tighter">+50 VELO_CREDIT</p>
                    </div>
                  </button>
                )) : (
                  <p className="text-[10px] text-zinc-700 italic border-t border-zinc-800/50 pt-4 px-1">Network fully synchronized.</p>
                )}
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-bg-primary border border-border">
              <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">Reputation_Rank</h3>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white font-mono leading-none">{user.reputation}%</span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest pb-1">Verified</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 rounded-full mt-4 overflow-hidden">
                <div className="bg-accent h-full transition-all duration-1000" style={{ width: `${user.reputation}%` }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-auto hidden lg:block p-8 border-t border-border bg-black/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-zinc-600">
              <span>Sync_Status</span>
              <span className="text-accent">Nominal</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-zinc-600">
              <span>Identity_Lock</span>
              <span className="text-white">Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN: COMMAND_CENTER */}
      <main className="flex-1 bg-bg-primary overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12 pb-32">
          
          {/* SECTION: IDENTITY_PROTOCOL */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded text-[8px] font-black text-accent uppercase tracking-widest">Protocol.01</div>
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Identity_Protocol</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-bg-secondary border border-border p-8 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex flex-col items-center text-center relative gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-border flex items-center justify-center text-accent text-3xl font-black uppercase ring-4 ring-bg-primary shadow-2xl">
                    {user.email.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{user.email.split('@')[0]}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1">U-{user.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-zinc-900 border border-border rounded-full text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none flex items-center">
                      {user.role}
                    </span>
                    <span className="px-3 py-1 bg-accent/5 border border-accent/20 rounded-full text-[8px] font-black text-accent uppercase tracking-widest leading-none flex items-center">
                      Level.0{Math.floor(user.reputation / 20) + 1}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-bg-secondary border border-border p-8 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">PGP_Vault_Credential</h4>
                    <button 
                      onClick={() => {
                        if (user.pgpPublicKey) {
                          navigator.clipboard.writeText(user.pgpPublicKey);
                          toast.success('Public Key copied to clipboard');
                        }
                      }}
                      className="p-2 bg-bg-primary rounded-xl border border-border text-zinc-500 hover:text-accent transition-colors"
                    >
                      <Key size={14} />
                    </button>
                  </div>
                  <div className="bg-black/40 p-5 rounded-2xl border border-zinc-800 font-mono text-[10px] text-zinc-500 overflow-x-auto whitespace-pre leading-relaxed h-[120px] custom-scrollbar">
                    {user.pgpPublicKey || 'ENCRYPTION_KEY_NOT_INITIALIZED'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: ASSET_MANAGEMENT */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded text-[8px] font-black text-accent uppercase tracking-widest">Protocol.02</div>
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Asset_Management</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-accent p-8 rounded-[2.5rem] flex flex-col justify-between shadow-2xl relative group">
                <div className="absolute top-4 right-4 text-black/20 group-hover:scale-110 transition-transform"><Coins size={40} /></div>
                <div>
                  <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-1">Velo_Credit_Balance</p>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-black text-black font-mono tracking-tighter">{user.veloCoins.toLocaleString()}</span>
                    <span className="text-xs font-black text-black/60 uppercase self-end pb-1.5">$V</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBuyCoins(!showBuyCoins)}
                  className="mt-8 w-full bg-black text-white hover:bg-zinc-900 border border-black/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Acquire Credits
                </button>
              </div>

              <div className="md:col-span-2 bg-bg-secondary border border-border p-8 rounded-[2.5rem] grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col p-4 bg-bg-primary rounded-2xl border border-border hover:border-accent/30 transition-colors">
                  <span className="text-xl font-black text-white font-mono">{orders.length}</span>
                  <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-1">Total_Acquisitions</span>
                </div>
                <div className="flex flex-col p-4 bg-bg-primary rounded-2xl border border-border hover:border-accent/30 transition-colors">
                  <span className="text-xl font-black text-accent font-mono">{reviews.length}</span>
                  <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-1">Data_Submissions</span>
                </div>
                <div className="flex flex-col p-4 bg-bg-primary rounded-2xl border border-border hover:border-accent/30 transition-colors">
                  <span className="text-xl font-black text-white font-mono">{transactions.filter(t => t.status === 'approved').length}</span>
                  <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-1">Network_Syncs</span>
                </div>
                <div className="flex flex-col p-4 bg-bg-primary rounded-2xl border border-border hover:border-accent/30 transition-colors">
                  <span className="text-xl font-black text-accent font-mono">{user.purchases.length}</span>
                  <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-1">Artifact_Vault</span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showBuyCoins && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden bg-bg-secondary border border-accent/20 rounded-[2.5rem] p-8 md:p-10"
                >
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">Crypto Asset Acquisition</h3>
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Protocol: Direct Transfer → Velo Credits</p>
                    </div>

                    <div className="bg-black/50 border border-zinc-800 p-6 rounded-2xl font-mono text-xs text-accent break-all text-center relative group">
                      <p className="text-[8px] text-zinc-700 uppercase mb-2">Network_Destination</p>
                      <span className="block mb-2">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
                          toast.success('Wallet address copied');
                        }}
                        className="text-[9px] text-zinc-600 uppercase hover:text-white"
                      >
                        [ Copy_Address ]
                      </button>
                    </div>

                    <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-zinc-600 tracking-widest ml-1">Asset_Amount ($V)</label>
                        <input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full bg-bg-primary border border-border rounded-xl p-4 text-white focus:outline-none focus:border-accent font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-zinc-600 tracking-widest ml-1">Transaction_TXID</label>
                        <input 
                          type="text" 
                          placeholder="0x..."
                          value={txId}
                          onChange={(e) => setTxId(e.target.value)}
                          className="w-full bg-bg-primary border border-border rounded-xl p-4 text-white focus:outline-none focus:border-accent font-mono text-sm placeholder:text-zinc-800"
                          required
                        />
                      </div>
                      <button type="submit" className="md:col-span-2 w-full bg-accent text-black font-black py-4 rounded-xl uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-xl shadow-accent/5">
                        Broadcast Payment Signal
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* SECTION: ACQUISITION_ARCHIVE */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded text-[8px] font-black text-accent uppercase tracking-widest">Protocol.03</div>
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Acquisition_Archive</h2>
            </div>

            <div className="space-y-4">
              {orders.length > 0 ? [...orders].reverse().map(order => {
                const product = products.find(p => p.id === order.productId);
                return (
                  <div key={order.id} className="bg-bg-secondary border border-border p-6 md:p-8 rounded-[2rem] hover:border-zinc-800 transition-all group">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-32 h-32 md:h-32 rounded-2xl overflow-hidden bg-bg-primary grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all border border-border">
                        <img src={product?.image} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-bold text-white transition-colors">{product?.name || 'Unknown Artifact'}</h4>
                            <p className="text-[9px] text-zinc-600 font-mono tracking-tighter mt-1 uppercase">ID: {order.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-white font-mono leading-none">${order.price}</p>
                            <div className={cn(
                              "inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mt-2 border",
                              order.status === 'completed' ? "bg-accent/5 border-accent/20 text-accent" : 
                              order.status === 'disputed' ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-500" : "bg-red-500/5 border-red-500/20 text-red-500"
                            )}>
                              {order.status}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-zinc-800/50">
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] text-zinc-500 font-mono uppercase">{new Date(order.date).toLocaleDateString()}</span>
                            <span className="text-[9px] text-zinc-700 font-mono uppercase">{new Date(order.date).toLocaleTimeString()}</span>
                          </div>
                          
                          <div className="flex gap-6">
                            {order.status === 'completed' && (
                              <button 
                                onClick={() => setDisputeOpen(disputeOpen === order.id ? null : order.id)}
                                className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors"
                              >
                                {disputeOpen === order.id ? 'Abort_Dispute' : 'Init_Dispute'}
                              </button>
                            )}
                            {order.status === 'completed' && product?.digitalFile && (
                              <button 
                                onClick={() => setShowPayload(showPayload === order.id ? null : order.id)}
                                className={cn(
                                  "text-[9px] font-black uppercase tracking-widest transition-colors",
                                  showPayload === order.id ? "text-white" : "text-accent hover:text-white"
                                )}
                              >
                                [ {showPayload === order.id ? 'Lock_Archive' : 'Access_Payload'} ]
                              </button>
                            )}
                            {order.status === 'disputed' && (
                              <button 
                                onClick={() => setDisputeOpen(disputeOpen === order.id ? null : order.id)}
                                className={cn(
                                  "text-[9px] font-black uppercase tracking-widest transition-colors",
                                  disputeOpen === order.id ? "text-white" : "text-yellow-500 hover:text-white"
                                )}
                              >
                                [ {disputeOpen === order.id ? 'Close_Logs' : 'Open_Dispute_Logs'} ]
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {/* Sub-panels for payload and disputes */}
                      {showPayload === order.id && product?.digitalFile && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-6">
                          <div className="p-8 rounded-[2rem] bg-accent/5 border border-accent/20">
                            <div className="flex items-center gap-3 mb-4">
                              <Shield size={14} className="text-accent" />
                              <p className="text-[10px] font-black text-accent uppercase tracking-widest">DECRYPTED_PAYLOAD_DATA</p>
                            </div>
                            <div className="bg-black/50 p-6 rounded-2xl border border-accent/10 font-mono text-xs text-white break-all select-all leading-relaxed shadow-inner">
                              {product.digitalFile}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {order.status === 'disputed' && disputeOpen === order.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-6">
                          <div className="p-8 rounded-[2rem] bg-bg-primary border border-zinc-800">
                             <div className="flex justify-between items-center mb-6">
                                <h5 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Encrypted_Dispute_Transmission</h5>
                                <span className="text-[9px] text-zinc-600 font-mono">STATUS: ACTIVE_ARBITRATION</span>
                             </div>

                             <div className="h-64 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                                {order.disputeMessages?.map(msg => (
                                   <div key={msg.id} className={cn(
                                     "p-4 rounded-2xl border max-w-[85%]",
                                     msg.senderId === user.id ? "ml-auto bg-accent/5 border-accent/20 text-accent" : "mr-auto bg-bg-secondary border-border text-zinc-400"
                                   )}>
                                      <div className="flex justify-between gap-4 mb-2 pb-2 border-b border-white/5">
                                         <span className="text-[9px] font-black uppercase tracking-widest">{msg.senderRole}</span>
                                         <span className="text-[8px] opacity-40 font-mono">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed">{msg.text}</p>
                                   </div>
                                ))}
                             </div>

                             <div className="relative">
                               <input 
                                 placeholder="Transmit signal to arbitrator..."
                                 onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value) {
                                       addDisputeMessage(order.id, e.currentTarget.value);
                                       e.currentTarget.value = '';
                                    }
                                 }}
                                 className="w-full bg-bg-secondary border border-border p-4 pr-12 rounded-xl text-white text-xs focus:outline-none focus:border-accent"
                               />
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-accent opacity-50"><ArrowRight size={16} /></div>
                             </div>
                          </div>
                        </motion.div>
                      )}

                      {order.status === 'completed' && disputeOpen === order.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-6">
                          <div className="p-8 rounded-[2rem] bg-red-950/20 border border-red-900/40 space-y-6">
                            <div>
                              <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Initialization_Protocol: Dispute</h5>
                              <p className="text-xs text-zinc-500">Provide analysis of protocol failure or artifact defect.</p>
                            </div>
                            <textarea 
                              placeholder="Technical details of the dispute..."
                              className="w-full bg-black/40 border border-red-900/30 rounded-2xl p-6 text-sm text-white h-32 focus:outline-none focus:border-red-500 font-light resize-none"
                              value={disputeReason}
                              onChange={(e) => setDisputeReason(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => setDisputeOpen(null)} className="bg-zinc-900 text-zinc-500 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border hover:text-white transition-colors">Abort_Signal</button>
                              <button onClick={() => handleDispute(order.id)} className="bg-red-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20">Submit_Conflict_Log</button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }) : (
                <div className="py-24 text-center bg-bg-secondary/30 rounded-[3rem] border border-dashed border-border flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-800"><Shield size={24} /></div>
                  <p className="text-zinc-700 text-[10px] uppercase font-black tracking-[0.2em]">Archive_Null: No records found</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

const ShopPanel = () => {
  const { products, user, orders, updateProduct, deleteProduct, addDisputeMessage } = useApp();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [tab, setTab] = useState<'artifacts' | 'conflicts'>('artifacts');

  if (!user || user.role !== 'reseller') return <div className="p-20 text-center font-black uppercase tracking-widest">Unauthorized: Reseller protocol required</div>;

  const myProducts = products.filter(p => p.sellerId === user.id);
  const mySales = orders.filter(o => myProducts.some(p => p.id === o.productId));
  const myDisputes = orders.filter(o => o.status === 'disputed' && myProducts.some(p => p.id === o.productId));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 pb-48">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 border-b border-border pb-8 md:pb-12 gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tighter">Shop <span className="text-accent italic">Panel.</span></h1>
          <p className="text-zinc-600 text-xs md:text-sm font-mono mt-2 uppercase tracking-widest">Manage your digital artifacts and analyze performance</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setTab(tab === 'artifacts' ? 'conflicts' : 'artifacts')}
            className="flex-1 md:flex-none bg-zinc-900 border border-border text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
          >
            {tab === 'artifacts' ? <Filter size={14} className="text-red-500" /> : <ShoppingBag size={14} />}
            {tab === 'artifacts' ? `Conflicts (${myDisputes.length})` : 'Catalog'}
          </button>
          <button 
            onClick={() => setEditingProduct({ id: Math.random().toString(36).substr(2, 9), name: '', description: '', price: 0, image: '', category: '', country: '', city: '', sellerId: user.id })}
            className="flex-1 md:flex-none bg-accent text-black px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-accent/10"
          >
            Add New Product
          </button>
        </div>
      </div>

      {tab === 'artifacts' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 px-1">Your Artifacts</h3>
            {myProducts.length === 0 ? (
              <div className="py-20 text-center bg-bg-secondary/30 rounded-[3rem] border border-dashed border-border">
                <p className="text-zinc-700 text-[10px] uppercase font-black tracking-[0.2em]">No products deployed yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myProducts.map(p => (
                  <div key={p.id} className="bg-bg-secondary border border-border p-6 rounded-[2.5rem] group hover:border-zinc-800 transition-colors">
                    <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-bg-primary">
                      <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-1">{p.name}</h4>
                    <div className="flex justify-between items-end">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">${p.price}</div>
                      <div className="flex gap-2">
                         <button onClick={() => setEditingProduct(p)} className="p-2 text-zinc-400 hover:text-white"><ArrowRight size={16} /></button>
                         <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-900 hover:text-red-500"><Filter size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
             <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 px-1">Sales Stream</h3>
             <div className="bg-bg-secondary border border-border rounded-[2.5rem] p-8">
                <div className="mb-8">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-3xl font-black text-white tracking-tighter">${mySales.reduce((sum, o) => sum + o.price, 0).toLocaleString()}</p>
                </div>
                <div className="space-y-4">
                  {mySales.length > 0 ? mySales.map(sale => (
                    <div key={sale.id} className="flex justify-between items-center bg-bg-primary/50 p-4 rounded-xl border border-border">
                      <div>
                        <p className="text-[10px] font-bold text-white uppercase truncate max-w-[100px]">U-{sale.userId.slice(0, 6)}</p>
                        <p className="text-[9px] text-zinc-600 font-mono">{new Date(sale.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-accent font-black text-sm">+${sale.price}</span>
                    </div>
                  )) : (
                    <p className="text-[10px] text-zinc-700 italic uppercase tracking-widest">Awaiting first conversion...</p>
                  )}
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] mb-4 px-1">Conflict Arbitration Queue</h3>
           {myDisputes.length === 0 ? (
             <div className="py-24 text-center bg-bg-secondary/30 rounded-[3rem] border border-dashed border-border">
                <p className="text-zinc-700 text-[10px] uppercase font-black tracking-[0.2em]">All conflicts resolved</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-8">
                {myDisputes.map(dispute => {
                  const product = products.find(p => p.id === dispute.productId);
                  return (
                    <div key={dispute.id} className="bg-bg-secondary border border-red-900/20 rounded-[2.5rem] p-8 md:p-12">
                       <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
                          <div>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Conflict Source</p>
                            <h4 className="text-2xl font-bold text-white tracking-tight">{product?.name} Artifact</h4>
                            <p className="text-[9px] text-zinc-700 font-mono mt-1">U-{dispute.userId}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Asset Value</p>
                             <p className="text-2xl font-black text-white tracking-tighter">${dispute.price}</p>
                          </div>
                       </div>
                       
                       <div className="bg-bg-primary p-6 rounded-2xl border border-border mb-10">
                          <p className="text-[10px] font-black text-red-500 uppercase mb-3">Buyer's Subjective Statement</p>
                          <p className="text-zinc-300 text-sm leading-relaxed italic">"{dispute.disputeReason}"</p>
                       </div>

                       <div className="flex flex-col h-[350px]">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Encrypted Transmission Log</p>
                          <div className="flex-1 bg-black/30 border border-border rounded-xl p-4 overflow-y-auto space-y-4 mb-4 text-[10px] font-mono">
                             {dispute.disputeMessages?.map(msg => (
                                <div key={msg.id} className={cn("p-3 rounded-lg border max-w-[80%]", msg.senderId === user.id ? "ml-auto bg-accent/5 border-accent/20 text-accent" : "mr-auto bg-bg-secondary border-border text-zinc-500")}>
                                   <div className="flex justify-between gap-4 mb-1">
                                      <span className="font-black uppercase">{msg.senderRole}</span>
                                      <span className="opacity-40">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                   </div>
                                   <p>{msg.text}</p>
                                </div>
                             ))}
                          </div>
                          <div className="relative">
                             <input 
                               placeholder="Transmit evidence to arbitrator..."
                               onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.currentTarget.value) {
                                     addDisputeMessage(dispute.id, e.currentTarget.value);
                                     e.currentTarget.value = '';
                                  }
                               }}
                               className="w-full bg-bg-primary border border-border p-4 pr-12 rounded-xl text-white text-xs focus:outline-none focus:border-accent"
                             />
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-accent opacity-50"><ArrowRight size={16} /></div>
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
           )}
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-bg-secondary border border-border w-full max-w-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl relative my-auto">
             <div className="mb-10">
               <h2 className="text-3xl font-bold text-white tracking-tighter">Product Configuration</h2>
               <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-1">Specify artifact parameters</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Artifact Name</label>
                  <input 
                    placeholder="Product designation..." 
                    value={editingProduct.name}
                    className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent"
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Protocol Description</label>
                  <textarea 
                    placeholder="Explain the features and value proposition..." 
                    className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white h-24 focus:outline-none focus:border-accent resize-none text-sm"
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                   <input placeholder="Technology..." value={editingProduct.category} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Price ($)</label>
                   <input type="number" value={editingProduct.price} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Country</label>
                   <input value={editingProduct.country} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" onChange={(e) => setEditingProduct({...editingProduct, country: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">City</label>
                   <input value={editingProduct.city} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" onChange={(e) => setEditingProduct({...editingProduct, city: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Image URL</label>
                   <input placeholder="https://..." value={editingProduct.image} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1">Digital Payload (Sent after purchase)</label>
                   <textarea 
                    placeholder="Download links, license keys, or secret files..." 
                    className="w-full bg-bg-primary border border-accent/20 p-4 rounded-xl text-accent focus:outline-none focus:border-accent/60 resize-none h-20 text-sm font-mono"
                    value={editingProduct.digitalFile || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, digitalFile: e.target.value})}
                  />
                </div>
             </div>
             <div className="flex gap-4 mt-10">
              <button onClick={() => setEditingProduct(null)} className="flex-1 bg-zinc-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border border-border">Abort</button>
              <button 
                onClick={() => { 
                  updateProduct(editingProduct); 
                  setEditingProduct(null); 
                }} 
                className="flex-1 bg-accent text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-accent/10"
              >
                Commit Changes
              </button>
             </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
const AdminPanel = () => {
  const { 
    products, user, users, orders, transactions, reviews, 
    approveTransaction, rejectTransaction, updateProduct, 
    deleteProduct, toggleAdmin, updateUserProfile,
    addDisputeMessage, resolveDispute, toggleReviewVisibility 
  } = useApp();
  const [tab, setTab] = useState<'transactions' | 'products' | 'disputes' | 'users' | 'reviews'>('transactions');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');

  if (!user?.isAdmin) return <div className="p-20 text-center font-black uppercase tracking-widest">Access Denied: Protocol Violation Detected</div>;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Admin777LoL') {
      setIsUnlocked(true);
      toast.success('Command Access Granted');
    } else {
      toast.error('Invalid Credential Pulse');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-bg-secondary border border-border p-8 md:p-12 rounded-[3.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-accent/20"></div>
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-accent/5 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={24} className="text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tighter mb-2">Command Authorization Required</h2>
            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Security Protocol Level-4</p>
          </div>
          
          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest ml-1">Access Credential</label>
              <input 
                type="password" 
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-2xl p-5 text-white focus:outline-none focus:border-accent text-center font-mono tracking-widest"
                autoFocus
              />
            </div>
            <button type="submit" className="w-full bg-accent text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-xs hover:bg-white transition-all shadow-xl shadow-accent/10">
              Initialize Access
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 pb-48">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 border-b border-border pb-8 md:pb-12 gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tighter">Command <span className="text-accent italic">Control.</span></h1>
          <p className="text-zinc-600 text-xs md:text-sm font-mono mt-2 uppercase tracking-widest">Central Oversight & Protocol Governance</p>
        </div>
        <button onClick={toggleAdmin} className="w-full md:w-auto bg-zinc-900 border border-border text-zinc-600 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">
          Relinquish Authority
        </button>
      </div>

      <div className="flex gap-2 md:gap-4 mb-8 md:mb-12 overflow-x-auto pb-4 no-scrollbar">
        {[
          { id: 'transactions', label: 'Signals', icon: <Coins size={14} /> },
          { id: 'economy', label: 'Economy', icon: <DollarSign size={14} /> },
          { id: 'products', label: 'Artifacts', icon: <ShoppingBag size={14} /> },
          { id: 'disputes', label: 'Conflicts', icon: <Filter size={14} /> },
          { id: 'reviews', label: 'Audits', icon: <MessageSquare size={14} /> },
          { id: 'users', label: 'Nodes', icon: <User size={14} /> }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id as any)}
            className={cn(
              "flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              tab === t.id ? "bg-accent text-black shadow-lg shadow-accent/20" : "bg-bg-secondary text-zinc-600 border border-border hover:border-zinc-700"
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="bg-bg-secondary border border-border rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        {tab === 'transactions' && (
          <div className="space-y-6 md:space-y-10 relative">
            <h3 className="text-white font-bold mb-4 md:mb-8 flex items-center gap-3 text-lg md:text-xl tracking-tight">
              <Coins size={20} className="text-accent" /> Pending Signals
            </h3>
            {transactions.filter(tx => tx.status === 'pending').length === 0 ? (
              <p className="text-zinc-700 font-mono text-[10px] uppercase italic tracking-widest py-10 border border-dashed border-border rounded-[2rem] text-center">No inbound signals detected</p>
            ) : (
              transactions.filter(tx => tx.status === 'pending').map(tx => (
                <div key={tx.id} className="bg-bg-primary border border-border p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between gap-6 md:gap-8 hover:border-zinc-800 transition-colors">
                  <div className="space-y-4 flex-1">
                    <div className="space-y-1">
                      <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Protocol Proof (TXID)</p>
                      <p className="text-accent font-mono text-[10px] md:text-xs break-all bg-black/30 p-3 rounded-lg border border-accent/10 select-all">{tx.txId}</p>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                       <div>
                         <p className="text-zinc-600 text-[9px] font-black uppercase">Value extraction</p>
                         <p className="text-white font-black text-lg md:text-xl tracking-tighter">{tx.amount.toLocaleString()} $VELO</p>
                       </div>
                       <div className="h-6 md:h-8 w-px bg-border"></div>
                       <div>
                         <p className="text-zinc-600 text-[9px] font-black uppercase">Node ID</p>
                         <p className="text-zinc-400 font-mono text-[10px] md:text-xs">U-{tx.userId.slice(0, 8)}</p>
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => rejectTransaction(tx.id)} className="flex-1 md:flex-none px-6 md:px-8 py-3 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all">Deny</button>
                    <button onClick={() => approveTransaction(tx.id)} className="flex-1 md:flex-none px-6 md:px-8 py-3 bg-accent text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-accent/10">Authorize</button>
                  </div>
                </div>
              ))
            )}
            
            <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-border">
              <h4 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-6">Historical Log</h4>
              <div className="space-y-3 opacity-60">
                 {transactions.filter(tx => tx.status !== 'pending').map(tx => (
                   <div key={tx.id} className="text-[10px] font-mono text-zinc-500 flex flex-col sm:flex-row justify-between gap-2 bg-black/20 p-3 rounded-xl border border-zinc-900">
                      <div className="flex items-center gap-3">
                        <span className={tx.status === 'approved' ? 'text-accent' : 'text-red-500'}>●</span>
                        <span className="truncate max-w-[200px]">{tx.txId}</span>
                      </div>
                      <span className="font-bold flex items-center gap-2">
                        {tx.amount} $VELO <span className={tx.status === 'approved' ? 'text-accent' : 'text-red-500'}>{tx.status.toUpperCase()}</span>
                      </span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'economy' && (
          <div className="space-y-6 md:space-y-10 relative">
             <h3 className="text-white font-bold mb-4 md:mb-8 flex items-center gap-3 text-lg md:text-xl tracking-tight">
               <DollarSign size={20} className="text-accent" /> Protocol Economics
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                   { label: 'Total Supply', value: users.reduce((acc, u) => acc + u.veloCoins, 0), icon: <Coins size={18} /> },
                   { label: 'Gross Volume', value: orders.reduce((acc, o) => acc + o.total, 0), icon: <TrendingUp size={18} /> },
                   { label: 'Avg Transaction', value: orders.length ? Math.round(orders.reduce((acc, o) => acc + o.total, 0) / orders.length) : 0, icon: <DollarSign size={18} /> },
                ].map((stat, i) => (
                   <div key={i} className="bg-bg-primary border border-border p-8 rounded-[2.5rem]">
                      <div className="flex items-center gap-3 text-accent mb-4 opacity-50">
                         {stat.icon}
                         <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <p className="text-4xl font-bold text-white tracking-tighter">${stat.value.toLocaleString()}</p>
                   </div>
                ))}
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-bg-primary border border-border p-8 rounded-[3rem]">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">High Value Signals</p>
                   <div className="space-y-3">
                      {orders.sort((a,b) => b.total - a.total).slice(0, 5).map(o => (
                         <div key={o.id} className="flex items-center justify-between p-4 bg-bg-secondary border border-border rounded-xl">
                            <div className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                  <TrendingUp size={12} />
                               </div>
                               <p className="text-white text-xs font-mono font-bold">U-{o.userId.slice(0, 8)}</p>
                            </div>
                            <span className="text-accent font-mono font-black py-1 px-3 bg-accent/5 rounded-lg text-xs">${o.total}</span>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="bg-bg-primary border border-border p-8 rounded-[3rem]">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Currency Distribution</p>
                   <div className="space-y-3">
                      {users.sort((a,b) => b.veloCoins - a.veloCoins).slice(0, 5).map(u => (
                         <div key={u.id} className="flex items-center justify-between p-4 bg-bg-secondary border border-border rounded-xl">
                            <div className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-[10px]">
                                  {u.email.charAt(0).toUpperCase()}
                               </div>
                               <p className="text-white text-xs font-bold truncate max-w-[120px]">{u.email}</p>
                            </div>
                            <span className="text-white font-mono font-black text-xs">{u.veloCoins.toLocaleString()} $VLO</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-12 relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white tracking-tight">Artifact Catalog</h3>
              <button 
                onClick={() => setEditingProduct({ id: Math.random().toString(36).substr(2, 9), name: '', description: '', price: 0, image: '', category: '', country: '', city: '' })}
                className="bg-accent text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
              >
                Inject Artifact
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-bg-primary border border-border p-6 rounded-[2rem] flex items-center justify-between hover:border-zinc-800 transition-colors">
                  <div className="flex items-center gap-6">
                    <img src={p.image} className="w-16 h-16 rounded-2xl object-cover grayscale opacity-50" />
                    <div>
                      <h4 className="text-white font-bold">{p.name}</h4>
                      <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-[0.2em] mt-1">${p.price} | {p.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProduct(p)} className="p-3 text-zinc-600 hover:text-white transition-colors"><ArrowRight size={16} /></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-3 text-red-500 hover:text-red-400 transition-colors"><Filter size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            {editingProduct && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-bg-secondary border border-border w-full max-w-2xl p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                   <div className="mb-10">
                     <h2 className="text-3xl font-bold text-white tracking-tighter">Modify Artifact Protocol</h2>
                     <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-1">Direct system manipulation enabled</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Artifact Designation</label>
                        <input 
                          placeholder="Designation..." 
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                          className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Technical Specification</label>
                        <textarea 
                          placeholder="Analysis & specifications..." 
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                          className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white h-32 focus:outline-none focus:border-accent resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Valuation ($)</label>
                         <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Resource Category</label>
                         <input placeholder="Computing/Audio/etc" value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Origin Country</label>
                         <input value={editingProduct.country} onChange={(e) => setEditingProduct({...editingProduct, country: e.target.value})} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Origin City</label>
                         <input value={editingProduct.city} onChange={(e) => setEditingProduct({...editingProduct, city: e.target.value})} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Seller Identity</label>
                         <input placeholder="U-ID or admin" value={editingProduct.sellerId} onChange={(e) => setEditingProduct({...editingProduct, sellerId: e.target.value})} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Visual Asset URL</label>
                         <input placeholder="https://..." value={editingProduct.image} onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})} className="w-full bg-bg-primary border border-border p-4 rounded-xl text-white focus:outline-none focus:border-accent" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[9px] font-black text-accent uppercase tracking-widest ml-1">Digital Payload</label>
                         <textarea placeholder="Secret strings/links..." value={editingProduct.digitalFile || ''} onChange={(e) => setEditingProduct({...editingProduct, digitalFile: e.target.value})} className="w-full bg-bg-primary border border-accent/20 p-4 rounded-xl text-accent font-mono text-sm h-20 focus:outline-none focus:border-accent/60 outline-none" />
                      </div>
                   </div>
                   <div className="flex gap-4 mt-12">
                    <button onClick={() => setEditingProduct(null)} className="flex-1 bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-border">Abort</button>
                    <button onClick={() => { updateProduct(editingProduct); setEditingProduct(null); }} className="flex-1 bg-accent text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-accent/10">Commit Proto-Change</button>
                   </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {tab === 'disputes' && (
          <div className="space-y-10 relative">
             <h3 className="text-xl font-bold text-white tracking-tight border-b border-border pb-6 flex items-center gap-3">
               <Filter size={20} className="text-accent" /> Active Arbitration Cases
             </h3>
             {orders.filter(o => o.status === 'disputed').length === 0 ? (
               <div className="py-20 text-center border border-dashed border-border rounded-[2rem] bg-bg-primary/50">
                  <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em]">Zero active conflicts detected</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-10">
                 {orders.filter(o => o.status === 'disputed').map(order => {
                   const product = products.find(p => p.id === order.productId);
                   const buyer = users.find(u => u.id === order.userId);
                   const seller = users.find(u => u.id === product?.sellerId);
                   return (
                     <div key={order.id} className="bg-bg-primary border border-border rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-accent/5">
                           <div>
                             <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Arbitration ID: {order.id}</p>
                             <h4 className="text-white font-bold text-lg">{product?.name} Artifact</h4>
                           </div>
                           <div className="flex gap-3">
                              <button 
                                onClick={() => resolveDispute(order.id, 'dismiss')}
                                className="px-6 py-3 bg-zinc-900 border border-border text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800"
                              >
                                Dismiss Dispute
                              </button>
                              <button 
                                onClick={() => resolveDispute(order.id, 'refund')}
                                className="px-6 py-3 bg-red-600/20 border border-red-600/30 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600/30"
                              >
                                Grant Refund
                              </button>
                           </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                           <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-bg-secondary p-4 rounded-2xl border border-border">
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Buyer Node</p>
                                    <p className="text-white text-xs font-mono">{buyer?.email}</p>
                                 </div>
                                 <div className="bg-bg-secondary p-4 rounded-2xl border border-border">
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Seller Node</p>
                                    <p className="text-white text-xs font-mono">{seller?.email || 'System'}</p>
                                 </div>
                              </div>
                              <div className="bg-bg-secondary p-6 rounded-2xl border border-border">
                                 <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-3">Claim Reason</p>
                                 <p className="text-zinc-300 text-sm leading-relaxed italic">"{order.disputeReason || 'No reason specified'}"</p>
                              </div>
                           </div>
                           <div className="flex flex-col h-[400px]">
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Transmission Log</p>
                              <div className="flex-1 bg-bg-secondary border border-border rounded-2xl p-4 overflow-y-auto space-y-4 mb-4 font-mono text-[10px]">
                                 {order.disputeMessages?.map(msg => (
                                    <div key={msg.id} className={cn(
                                       "p-3 rounded-lg border max-w-[80%]",
                                       msg.senderRole === 'admin' ? "ml-auto bg-accent/10 border-accent/20 text-accent" : "mr-auto bg-bg-primary border-border text-zinc-400"
                                    )}>
                                       <div className="flex justify-between gap-4 mb-1">
                                          <span className="font-black uppercase tracking-widest">{msg.senderRole}</span>
                                          <span className="opacity-40">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                       </div>
                                       <p className="leading-relaxed">{msg.text}</p>
                                    </div>
                                 ))}
                                 {(!order.disputeMessages || order.disputeMessages.length === 0) && (
                                    <p className="text-zinc-800 text-center py-20 italic">No message artifacts logged</p>
                                 )}
                              </div>
                              <div className="relative">
                                 <input 
                                   placeholder="Transmit arbiter directive..."
                                   onKeyDown={(e) => {
                                      if (e.key === 'Enter' && e.currentTarget.value) {
                                         addDisputeMessage(order.id, e.currentTarget.value);
                                         e.currentTarget.value = '';
                                      }
                                   }}
                                   className="w-full bg-bg-primary border border-border p-4 pr-12 rounded-xl text-white text-xs focus:outline-none focus:border-accent"
                                 />
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-accent opacity-50">
                                    <ArrowRight size={16} />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-10">
             <h3 className="text-xl font-bold text-white tracking-tight border-b border-border pb-6 flex items-center gap-3">
               <MessageSquare size={20} className="text-accent" /> Feedback Audit
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map(review => {
                  const product = products.find(p => p.id === review.productId);
                  return (
                    <div key={review.id} className={cn(
                      "bg-bg-primary border border-border p-8 rounded-[2.5rem] relative group transition-all",
                      review.hidden && "opacity-40 grayscale"
                    )}>
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex gap-1 text-accent">
                             {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />)}
                          </div>
                          <button 
                            onClick={() => toggleReviewVisibility(review.id)}
                            className="text-[9px] font-black uppercase text-zinc-500 hover:text-white transition-colors border border-border px-3 py-1 rounded-full"
                          >
                            {review.hidden ? 'Restore' : 'Hide Signal'}
                          </button>
                       </div>
                       <p className="text-zinc-300 text-sm italic mb-6 font-light leading-relaxed">"{review.comment}"</p>
                       <div className="flex items-center justify-between pt-6 border-t border-border">
                          <div className="text-[10px] text-zinc-600 font-mono">
                             Artifact: <span className="text-zinc-400 font-bold">{product?.name}</span>
                          </div>
                          <div className="text-[10px] text-zinc-800 font-mono">
                             U-{review.userId.slice(0, 6)}
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-10">
             <div className="flex justify-between items-center border-b border-border pb-6">
               <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                 <User size={20} className="text-accent" /> Grid Node Directory
               </h3>
               <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">{users.length} Active Nodes</span>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {users.map(u => (
                  <div key={u.id} className="bg-bg-primary border border-border p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-border flex items-center justify-center text-zinc-700 font-black">
                           ID
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                              <h4 className="text-white font-bold">{u.email}</h4>
                              {u.isAdmin && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase border border-red-500/20 rounded-md">Master</span>}
                           </div>
                           <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-widest mt-1">U-{u.id} | Protocol: {u.role}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8 w-full md:w-auto">
                        <div className="text-right flex-1 md:flex-none">
                           <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-widest mb-1">Coin Balance</p>
                           <input 
                             type="number"
                             value={u.veloCoins}
                             onChange={(e) => updateUserProfile({...u, veloCoins: Number(e.target.value)})}
                             className="bg-bg-secondary border border-border text-accent font-black text-right rounded-lg px-3 py-1 w-24 focus:outline-none focus:border-accent"
                           />
                        </div>
                        <select 
                          value={u.role}
                          onChange={(e) => updateUserProfile({...u, role: e.target.value as any})}
                          className="bg-bg-secondary border border-border text-white text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-1 focus:outline-none"
                        >
                           <option value="buyer">Buyer</option>
                           <option value="reseller">Reseller</option>
                        </select>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ReviewSubmission = ({ productId, onSubmit }: { productId: string, onSubmit: () => void }) => {
  const { products, submitReview, t } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const product = products.find(p => p.id === productId);

  if (!product) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-24"
    >
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8 text-center md:text-left">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-bg-secondary rounded-3xl border border-border flex items-center justify-center p-1 shadow-2xl">
           <img src={product.image} className="w-full h-full object-cover rounded-2xl opacity-80" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{product.name}</h2>
          <p className="text-zinc-500 font-mono text-[10px] md:text-xs mt-1 uppercase tracking-widest">Post-Purchase Evaluation Protocol</p>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="mb-8 md:mb-12">
          <label className="block text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 md:mb-6 px-1">Satisfaction Metric</label>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                onClick={() => setRating(star)}
                className={cn(
                  "w-11 h-11 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all",
                  star <= rating 
                    ? "bg-accent border-accent text-black scale-110 shadow-lg shadow-accent/20" 
                    : "bg-bg-primary border-border text-zinc-700 hover:border-zinc-600"
                )}
              >
                <Star size={20} md:size={24} fill={star <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 md:mb-12">
          <label className="block text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 px-1">Detailed Analysis</label>
          <textarea 
            placeholder="Document your findings regarding build quality and performance..."
            className="w-full h-40 md:h-48 bg-bg-primary border border-border rounded-3xl p-6 md:p-8 text-sm md:text-base text-zinc-300 placeholder:text-zinc-800 focus:outline-none focus:border-accent/50 transition-colors resize-none font-light leading-relaxed mb-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row justify-between items-center px-1 gap-2">
             <span className="text-[9px] md:text-[10px] text-zinc-700 font-mono tracking-wider italic uppercase">Character minimum: 5 tokens</span>
             <span className="text-[9px] md:text-[10px] text-zinc-700 font-mono tracking-wider uppercase">0X-{comment.length.toString(16).toUpperCase()}</span>
          </div>
        </div>

        <button 
          onClick={() => {
            if (comment.trim().length < 5) {
               toast.error('Insufficient data. Please expand your analysis.');
               return;
            }
            submitReview(productId, rating, comment);
            onSubmit();
          }}
          className="w-full bg-white text-black py-5 md:py-6 rounded-2xl font-black md:text-lg tracking-tight hover:bg-zinc-200 transition-all shadow-2xl active:scale-[0.98] flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3"
        >
          <span className="text-sm md:text-lg">Transmit Review</span>
          <span className="text-[9px] md:text-xs font-bold text-zinc-400 font-mono tracking-tighter uppercase">+50 ${t.veloCoins} Bounty</span>
        </button>
      </div>
    </motion.div>
  );
};

const TrendingSection = ({ onSelect }: { onSelect: (id: string) => void }) => {
   const { products } = useApp();
   const trending = products.slice(0, 3);

   return (
     <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12">
        <div className="flex items-center gap-3 mb-8">
           <TrendingUp className="text-accent" size={20} />
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Trending Artifacts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {trending.map((p, i) => (
             <motion.div 
               key={p.id} 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               onClick={() => onSelect(p.id)}
               className="bg-bg-secondary border border-border p-6 rounded-[2rem] flex items-center gap-6 cursor-pointer hover:bg-zinc-800/40 transition-colors group"
             >
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border shrink-0">
                   <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100" />
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="text-white font-bold truncate">{p.name}</h4>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{p.category}</p>
                   <div className="flex items-center justify-between mt-2">
                      <span className="text-accent font-mono font-black py-1 px-2 bg-accent/10 rounded-lg text-[10px]">${p.price}</span>
                      <ArrowRight size={14} className="text-zinc-700 group-hover:text-accent transition-colors" />
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
     </div>
   );
};

// --- Main App Logic ---

function AppContent() {
  const { user } = useApp();
  const [view, setView] = useState<'home' | 'detail' | 'profile' | 'review' | 'admin' | 'shop' | 'messages' | 'wishlist'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null);

  if (!user) return <Auth />;

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    setView('detail');
  };

  const handleReviewSelect = (id: string) => {
    setReviewingProductId(id);
    setView('review');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-zinc-300 font-sans selection:bg-accent/20 selection:text-accent flex flex-col overflow-x-hidden">
      <Navbar onViewChange={setView as any} currentView={view} />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TrendingSection onSelect={handleProductSelect} />
              <Home onProductSelect={handleProductSelect} />
            </motion.div>
          )}
          {view === 'detail' && selectedProductId && (
            <motion.div key="detail">
              <ProductDetail 
                productId={selectedProductId} 
                onBack={() => setView('home')} 
                onContactSeller={(sellerId) => {
                  // In a real app we might open the specific thread
                  setView('messages');
                }}
              />
            </motion.div>
          )}
          {view === 'profile' && (
            <motion.div key="profile">
              <Profile 
                onSelectProductToReview={handleReviewSelect} 
              />
            </motion.div>
          )}
          {view === 'review' && reviewingProductId && (
            <motion.div key="review">
              <ReviewSubmission 
                productId={reviewingProductId} 
                onSubmit={() => setView('profile')} 
              />
            </motion.div>
          )}
          {view === 'admin' && (
             <motion.div key="admin">
                <AdminPanel />
             </motion.div>
          )}
          {view === 'shop' && (
             <motion.div key="shop">
                <ShopPanel />
             </motion.div>
          )}
          {view === 'messages' && (
             <motion.div key="messages">
                <Messaging />
             </motion.div>
          )}
          {view === 'wishlist' && (
             <motion.div key="wishlist">
                <WishlistView />
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-bg-secondary border-t border-border px-8 flex items-center justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
        <div className="flex items-center space-x-6">
          <span className="flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> Node Status: Syncing</span>
          <span>Latency: 18ms</span>
          <span>Encryption: AES-256</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Engine: PHP 8.2</span>
          <span className="opacity-30">|</span>
          <span>Protocol: VLO-WAVE</span>
        </div>
      </footer>
      
      <Toaster 
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '16px',
            padding: '16px 24px',
          },
        }}
        position="bottom-right" 
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
