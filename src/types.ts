export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  country: string;
  city: string;
  sellerId: string;
  digitalFile?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  hidden?: boolean;
}

export type OrderStatus = 'completed' | 'disputed' | 'refunded';

export interface DisputeMessage {
  id: string;
  senderId: string;
  senderRole: 'buyer' | 'reseller' | 'admin';
  text: string;
  timestamp: string;
}

export interface Order {
  id: string;
  productId: string;
  userId: string;
  price: number;
  date: string;
  status: OrderStatus;
  disputeReason?: string;
  disputeMessages?: DisputeMessage[];
}

export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  txId: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  veloCoins: number;
  purchases: string[]; // Keep for legacy but use orders for history
  isAdmin: boolean;
  role: 'buyer' | 'reseller';
  pgpPublicKey?: string;
  pgpPrivateKey?: string;
}

export interface AppState {
  products: Product[];
  user: UserProfile | null;
  reviews: Review[];
  orders: Order[];
  transactions: Transaction[];
}
