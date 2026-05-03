import type { User, Payment, ServiceProviderProfile, Space, Listing, ListingImages, Message, Review, Bookings, Category, Notification } from 'map-hybrid-types-server';
import type { ReactNode } from 'react';

//  Auth Form Props 
type LoginFormProps = {
    onLogin: (username: User['username'], password: User['password']) => void;
}

type RegisterFormProps = {
    onRegister: (Firstname: string, Lastname: string, email: User['email'], username: User['username'], password: User['password']) => void;
}

// API data types 
type LoginData = {
    username: User['username'];
    password: User['password'];
};

//Payment types
type PaymentsComponentsProps = {
  payments: Payment[];
}

type RegisterData = {
    Firstname: string;
    Lastname: string;
    email: User['email'];
    username: User['username'];
    password: User['password'];
    role?: 'consumer' | 'provider';
};

type AuthUser = Pick<User, 'id' | 'Firstname' | 'Lastname' | 'username' | 'email' | 'role' | 'password'>;
type AuthContextType = {
  user: User | ServiceProviderProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  loginSuccess: (loginData: LoginData) => Promise<void>;
  registerSuccess: (registerData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  editUser: (updatedData: Partial<User | ServiceProviderProfile>) => void;
};


//  Space / Listing Display 
type SpaceCardProps = {
    space: Pick<Space, 'id' | 'title' | 'location' | 'price_per_hour'> & { owner_id?: number; price_per_day?: number };
    listing?: Pick<Listing, 'availability'>;
    ownerName: User['username'];
    rating: Review['rating'];
    reviewText?: string;
    image?: ListingImages['image_url'];
    onClick?: (spaceId: Space['id']) => void;
    onEdit?: (spaceId: Space['id']) => void;
    onDelete?: (spaceId: Space['id']) => void;
    canEdit?: boolean;
    canDelete?: boolean;
}

//  Messages 
type MessageThread = {
    id: Message['id'];
    otherUser: Pick<User, 'id' | 'username'>;
    lastMessage: Message['content'];
    lastMessageAt: Message['created_at'];
    unreadCount: number;
}

//  Bookings 
type BookingDisplay = Pick<Bookings, 'id' | 'start_time' | 'end_time' | 'status'> & {
    spaceTitle: Space['title'];
    spaceLocation: Space['location'];
}

//  Settings 
type SettingsPageProps = {
    userRole: User['role'];
}

//  Search 
type SearchFilters = {
    query: string;
    category?: Category['id'];
    maxPrice?: Space['price_per_hour'];
}
interface MainUserProviderProps {
  children: ReactNode;
}
type localNotification = Pick<Notification, 'id' | 'type' | 'content' | 'is_read' | 'created_at'> & {
  senderName: string;
  senderId: number;
  reiceiverId: number;
};
// Type guard: check if user is a User (has username/role) vs ServiceProviderProfile
function isUser(u: User | ServiceProviderProfile | null | undefined): u is User {
  return u != null && 'username' in u;
}

// Safe accessor for display name from the union
function getUserDisplayName(u: User | ServiceProviderProfile | null | undefined): string {
  if (!u) return '';
  if ('Firstname' in u) return u.Firstname || u.username;
  return u.business_name || '';
}
type ImageUploadingProps = {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedFormats?: string;
  isUploading?: boolean;
}
type UseImageUploadOptions = {
  listingId?: number;
  maxFiles?: number;
  onUploadComplete?: () => void;
}

export type {
    LoginFormProps,
    RegisterFormProps,
    LoginData,
    RegisterData,
    SpaceCardProps,
    MessageThread,
    BookingDisplay,
    SettingsPageProps,
    SearchFilters,
    AuthUser,
    AuthContextType,
    MainUserProviderProps,
    ImageUploadingProps,
    UseImageUploadOptions,
    PaymentsComponentsProps,
    localNotification,

};

export { isUser, getUserDisplayName };
