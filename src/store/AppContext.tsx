import React, { createContext, useContext, useState } from 'react';
import { Product, UserProfile, Review, Order, Transaction, Message, VeloNotification } from '../types';
import { translations, Language } from '../lib/translations';
import toast from 'react-hot-toast';
import * as openpgp from 'openpgp';

interface AppContextType {
  products: Product[];
  user: UserProfile | null;
  users: UserProfile[];
  reviews: Review[];
  orders: Order[];
  transactions: Transaction[];
  messages: Message[];
  notifications: VeloNotification[];
  language: Language;
  t: typeof translations.EN;
  setLanguage: (lang: Language) => void;
  buyProduct: (productId: string) => void;
  submitReview: (productId: string, rating: number, comment: string) => void;
  getReviewsForProduct: (productId: string) => Review[];
  createDispute: (orderId: string, reason: string) => void;
  submitCryptoPayment: (txId: string, amount: number) => void;
  register: (email: string, password: string, passcode: string, role: 'buyer' | 'reseller') => Promise<void>;
  logout: () => void;
  // Admin & Seller methods
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleAdmin: () => void;
  updateUserProfile: (profile: UserProfile) => void;
  addDisputeMessage: (orderId: string, text: string) => void;
  resolveDispute: (orderId: string, decision: 'refund' | 'dismiss') => void;
  toggleReviewVisibility: (id: string) => void;
  // New Methods
  toggleWishlist: (productId: string) => void;
  sendMessage: (receiverId: string, content: string, subject?: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (userId: string, type: VeloNotification['type'], title: string, message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Velo-Pod Pro',
    description: 'High-fidelity audio with active noise cancellation and ergonomic design.',
    price: 199,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Audio',
    country: 'Switzerland',
    city: 'Zurich',
    sellerId: 'admin',
    isFeatured: true,
    digitalFile: 'VELO-POD-LICENSE-12345'
  },
  {
    id: '2',
    name: 'X-Chronos Watch',
    description: 'A minimalist timepiece that blends classic aesthetic with smart features.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    category: 'Accessories',
    country: 'Japan',
    city: 'Tokyo',
    sellerId: 'admin',
    isFeatured: true,
    digitalFile: 'CHRONOS-SMART-FIRMWARE-v2.1'
  },
  {
    id: '3',
    name: 'Neon Horizon Desk Mat',
    description: 'Sleek, spill-resistant surface with vibrant edge-lit RGB illumination.',
    price: 45,
    image: 'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?w=800&q=80',
    category: 'Gaming',
    country: 'South Korea',
    city: 'Seoul',
    sellerId: 'admin',
    digitalFile: 'RGB-PROFILE-NEON-PRESET'
  },
  {
    id: '4',
    name: 'Polar Shift Mouse',
    description: 'Ultralight performance mouse with laser-precision sensor.',
    price: 89,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    category: 'Computing',
    country: 'USA',
    city: 'Austin',
    sellerId: 'admin',
    digitalFile: 'MACRO-POLAR-SHIFT-DRIVERS'
  }
];

const MOCK_USERS: UserProfile[] = [
  { id: 'u1', email: 'admin@velo.io', veloCoins: 5000, purchases: [], isAdmin: true, role: 'reseller', wishlist: [], reputation: 100 },
  { id: 'u2', email: 'buyer1@protocol.io', veloCoins: 120, purchases: [], isAdmin: false, role: 'buyer', wishlist: [], reputation: 85 },
  { id: 'u3', email: 'reseller1@market.io', veloCoins: 450, purchases: [], isAdmin: false, role: 'reseller', wishlist: [], reputation: 92 },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<VeloNotification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [language, setLanguage] = useState<Language>('EN');

  const register = async (email: string, password: string, passcode: string, role: 'buyer' | 'reseller') => {
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (!passcode) {
      toast.error('Secret passcode is required.');
      return;
    }

    const toastId = toast.loading('Generating PGP Protocol Keys...');
    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 2048,
        userIDs: [{ name: email, email: email }],
        passphrase: password // Using password as passphrase for key
      });

      const newUser: UserProfile = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        veloCoins: 100,
        purchases: [],
        isAdmin: email.includes('admin'),
        role,
        pgpPublicKey: publicKey,
        pgpPrivateKey: privateKey,
        wishlist: [],
        reputation: 0
      };

      setUser(newUser);
      setUsers(prev => [...prev, newUser]);
      toast.success(`Welcome to Velo Market! PGP Keys Generated.`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PGP keys.', { id: toastId });
    }
  };

  const logout = () => {
    setUser(null);
    toast.success('Logged out.');
  };

  const t = translations[language];

  // Helper for adding notifications
  const addNotification = (userId: string, type: VeloNotification['type'], title: string, message: string) => {
    const newNotif: VeloNotification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const buyProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || !user) return;

    if (user.veloCoins < product.price) {
      toast.error('Insufficient VeloCoins');
      return;
    }

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      productId,
      userId: user.id,
      price: product.price,
      date: new Date().toISOString(),
      status: 'completed'
    };

    setOrders(prev => [...prev, newOrder]);
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        veloCoins: prev.veloCoins - product.price,
        purchases: [...prev.purchases, productId]
      };
    });

    addNotification(user.id, 'order', 'Purchase Successful', `You acquired ${product.name}`);
    addNotification(product.sellerId, 'order', 'Artifact Sold', `Your artifact ${product.name} has been retrieved by a curator`);
    
    toast.success(`Purchased ${product.name}!`);
  };

  const toggleWishlist = (productId: string) => {
    if (!user) {
      toast.error('Login to build a wishlist');
      return;
    }
    const isWishlisted = user.wishlist.includes(productId);
    const newWishlist = isWishlisted 
      ? user.wishlist.filter(id => id !== productId)
      : [...user.wishlist, productId];
    
    setUser(prev => prev ? { ...prev, wishlist: newWishlist } : null);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, wishlist: newWishlist } : u));
    
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const sendMessage = async (receiverId: string, content: string, subject?: string) => {
    if (!user) return;
    const receiver = users.find(u => u.id === receiverId);
    if (!receiver) return;

    let finalContent = content;
    let isEncrypted = false;

    // Encrypt if receiver has public key
    if (receiver.pgpPublicKey) {
       try {
          const message = await openpgp.createMessage({ text: content });
          const publicKey = await openpgp.readKey({ armoredKey: receiver.pgpPublicKey });
          const encrypted = await openpgp.encrypt({
            message,
            encryptionKeys: publicKey,
          });
          finalContent = encrypted as string;
          isEncrypted = true;
       } catch (err) {
          console.error('Encryption failed, sending cleartext', err);
       }
    }

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      receiverId,
      subject,
      content: finalContent,
      timestamp: new Date().toISOString(),
      isRead: false,
      isEncrypted
    };

    setMessages(prev => [newMessage, ...prev]);
    addNotification(receiverId, 'message', 'New Transmission', `Secure message received from node ${user.id.slice(0, 4)}`);
    toast.success(isEncrypted ? 'Encrypted transmission sent' : 'Message sent');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    if (!user) return;
    setNotifications(prev => prev.filter(n => n.userId !== user.id));
  };

  const submitReview = (productId: string, rating: number, comment: string) => {
    if (!user) return;

    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      userId: user.id,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    setReviews(prev => {
      const updatedReviews = [...prev, newReview];
      
      // Calculate Seller Reputation
      const product = products.find(p => p.id === productId);
      if (product) {
        const seller = users.find(u => u.id === product.sellerId);
        if (seller) {
          const sellerProductIds = products.filter(p => p.sellerId === seller.id).map(p => p.id);
          const sellerReviews = updatedReviews.filter(r => sellerProductIds.includes(r.productId));
          const avgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
          const newReputation = Math.round(avgRating * 20); // 5 stars = 100%

          setUsers(prevUsers => prevUsers.map(u => u.id === seller.id ? { ...u, reputation: newReputation } : u));
        }
      }
      
      return updatedReviews;
    });
    
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        veloCoins: prev.veloCoins + 50
      };
    });

    toast.success('Review submitted! You earned +50 VeloCoins!');
  };

  const getReviewsForProduct = (productId: string) => {
    return reviews.filter(r => r.productId === productId);
  };

  const createDispute = (orderId: string, reason: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'disputed', disputeReason: reason } : order
    ));
    toast.success('Dispute opened successfully.');
  };

  const submitCryptoPayment = (txId: string, amount: number) => {
    if (!user) return;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      amount,
      txId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [...prev, newTx]);
    toast.success('Transaction submitted for validation!');
  };

  const approveTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    
    // Update target user's coins
    setUsers(prev => prev.map(u => u.id === tx.userId ? { ...u, veloCoins: u.veloCoins + tx.amount } : u));
    
    // Sync current user if it's the one receiving coins
    if (user && tx.userId === user.id) {
        setUser(prev => prev ? { ...prev, veloCoins: prev.veloCoins + tx.amount } : null);
    }
    toast.success('Transaction approved!');
  };

  const rejectTransaction = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
    toast.error('Transaction rejected.');
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => {
        const exists = prev.find(p => p.id === product.id);
        if (exists) {
            return prev.map(p => p.id === product.id ? product : p);
        }
        return [...prev, product];
    });
    toast.success('Product updated.');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted.');
  };

  const toggleAdmin = () => {
    setUser(prev => prev ? { ...prev, isAdmin: !prev.isAdmin } : null);
    if (user) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u));
    }
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUsers(prev => prev.map(u => u.id === profile.id ? profile : u));
    if (user && user.id === profile.id) {
      setUser(profile);
    }
    toast.success('User updated.');
  };

  const addDisputeMessage = (orderId: string, text: string) => {
    if (!user) return;
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderRole: user.isAdmin ? 'admin' : user.role,
      text,
      timestamp: new Date().toISOString()
    };
    
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, disputeMessages: [...(order.disputeMessages || []), newMessage] } 
        : order
    ));
  };

  const resolveDispute = (orderId: string, decision: 'refund' | 'dismiss') => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        if (decision === 'refund') {
          // Refund logic: add coins back to buyer
          setUsers(uPrev => uPrev.map(u => u.id === order.userId ? { ...u, veloCoins: u.veloCoins + order.price } : u));
          if (user && user.id === order.userId) {
            setUser(u => u ? { ...u, veloCoins: u.veloCoins + order.price } : null);
          }
          return { ...order, status: 'refunded' };
        } else {
          return { ...order, status: 'completed' };
        }
      }
      return order;
    }));
    toast.success(`Dispute resolved: ${decision}`);
  };

  const toggleReviewVisibility = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r));
    toast.success('Review visibility toggled.');
  };

  return (
    <AppContext.Provider value={{ 
      products, 
      user, 
      users,
      reviews, 
      orders,
      transactions,
      language,
      t,
      setLanguage,
      buyProduct, 
      submitReview,
      getReviewsForProduct,
      createDispute,
      submitCryptoPayment,
      register,
      logout,
      approveTransaction,
      rejectTransaction,
      updateProduct,
      deleteProduct,
      toggleAdmin,
      updateUserProfile,
      addDisputeMessage,
      resolveDispute,
      toggleReviewVisibility,
      toggleWishlist,
      sendMessage,
      markNotificationRead,
      clearNotifications,
      addNotification,
      messages,
      notifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
