import type { User, Space, Listing, ListingImages, Message, Review, Bookings, Category } from 'map-hybrid-types-server';

// ===== Auth Form Props =====
type LoginFormProps = {
    onLogin: (username: User['username'], password: User['password']) => void;
}

type RegisterFormProps = {
    onRegister: (Firstname: string, Lastname: string, email: User['email'], username: User['username'], password: User['password']) => void;
}

// ===== Space / Listing Display =====
type SpaceCardProps = {
    space: Pick<Space, 'id' | 'title' | 'location' | 'price_per_hour'>;
    listing?: Pick<Listing, 'availability'>;
    ownerName: User['username'];
    rating: Review['rating'];
    reviewText?: string;
    image?: ListingImages['image_url'];
    onClick?: (spaceId: Space['id']) => void;
}

// ===== Messages =====
type MessageThread = {
    id: Message['id'];
    otherUser: Pick<User, 'id' | 'username'>;
    lastMessage: Message['content'];
    lastMessageAt: Message['created_at'];
    unreadCount: number;
}

// ===== Bookings =====
type BookingDisplay = Pick<Bookings, 'id' | 'start_time' | 'end_time' | 'status'> & {
    spaceTitle: Space['title'];
    spaceLocation: Space['location'];
}

// ===== Settings =====
type SettingsPageProps = {
    userRole: User['role'];
}

// ===== Search =====
type SearchFilters = {
    query: string;
    category?: Category['id'];
    maxPrice?: Space['price_per_hour'];
}

export type {
    LoginFormProps,
    RegisterFormProps,
    SpaceCardProps,
    MessageThread,
    BookingDisplay,
    SettingsPageProps,
    SearchFilters,
};