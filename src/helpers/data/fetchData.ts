import type { User, Payment, TokenMessages, UserRole, Bookings, Category, Message, Notification, Review, Space, ServiceProviderProfile, 
    Listing, ListingImages, ErrorResponse} from "map-hybrid-types-server";
import type {RegisterFormProps, LoginFormProps} from '../types/localTypes';

const AUTH_API = import.meta.env.VITE_AUTH_API || 'http://localhost:3000/api';
const MEDIA_API = import.meta.env.VITE_MEDIA_API || 'http://localhost:3001/api';
const UPLOAD_API = import.meta.env.VITE_UPLOAD_API || 'http://localhost:3002/api';
const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3002/uploads';

const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

const getAuthHeader = (): HeadersInit => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    }; 
};
async function fetching<T>(
    baseUrl: string,
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeader(),
                ...options.headers,
            },
        });
        if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
// Auth API calls
const authApi = {
    //Registering api call
    Register: async (userData: RegisterFormProps | Partial<UserRole>) => {
        const response = await fetching<{token: string}>(AUTH_API, '/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        localStorage.setItem('authToken', response.token);
        return response;
    },
    //Login api call
    Login: async (loginData: LoginFormProps) => {
        const response = await fetching<{token: string}>(AUTH_API, '/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData),
        });
        localStorage.setItem('authToken', response.token);
        return response;
    },
    //Logout api call
    Logout: (): void => {
        localStorage.removeItem('authToken');
    },

    //Fetch the current user's profile data
    fetchCurrentUser: async (): Promise<User> => {
        return fetching<User>(AUTH_API, '/users/profile', {
            method: 'GET',
        });
    },

    //Fetch the current user's payments history
    fetchPaymentsHistory: async (): Promise<Payment[]> => {
        return fetching<Payment[]>(AUTH_API, '/payments/history', {
            method: 'GET',
        });
    },
    //IMplemting serviceproviders and consumers registration with different endpoints, for example:
    registerServiceProvider: async (providerData: Partial<ServiceProviderProfile>): Promise<{token: string}> => {
        const response = await fetching<{token: string}>(AUTH_API, '/auth/register/provider', {
            method: 'POST',
            body: JSON.stringify(providerData),
        });
        localStorage.setItem('authToken', response.token);
        return response;
    },
    registerConsumer: async (consumerData: Partial<User>): Promise<{token: string}> => {
        const response = await fetching<{token: string}>(AUTH_API, '/auth/register/consumer', {
            method: 'POST',
            body: JSON.stringify(consumerData),
        });
        localStorage.setItem('authToken', response.token);
        return response;
    },
    //Payment processing api call
    createPayment: async (paymentData: Partial<Payment>): Promise<Payment> => {
        return fetching<Payment>(AUTH_API, '/payments/process', {
            method: 'POST',
            body: JSON.stringify(paymentData),
        });
    },
    getPaymentToken: async (paymentData: Partial<Payment>): Promise<TokenMessages> => {
        return fetching<TokenMessages>(AUTH_API, '/payments/process', {
            method: 'POST',
            body: JSON.stringify(paymentData),
        });
    },
    updatePayemntStatus: async (paymentId: number, status: string): Promise<Payment> => {
        return fetching<Payment>(AUTH_API, `/payments/update/${paymentId}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },
    cancelPayment: async (paymentId: number): Promise<Payment> => {
        return fetching<Payment>(AUTH_API, `/payments/cancel/${paymentId}`, {
            method: 'POST',
        });
    },
    refundPayment: async (paymentId: number): Promise<Payment> => {
        return fetching<Payment>(AUTH_API, `/payments/refund/${paymentId}`, {
            method: 'POST',
        });
    },
    
};

// user's profile related API calls
const userApi = {
    //Fetching a user's profile by username
    fetchUserProfile: async (username: string): Promise<User> => {
        return fetching<User>(AUTH_API, `/users/${username}`, {
            method: 'GET',
        });
    },
    //Todo: Adding roles for editing profiles, users can only edit their own profile, but admin can edit any user's profile.
    //Todo: adding profile updating from normal user to service provider

    //Updating a user's profile by username, (auth Required  and own profile only)
    editingProfile: async (username: string, profileData: Partial<User>): Promise<User> => {
        return fetching<User>(AUTH_API, `/users/${username}`, {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },
    //Searching users by username or email, with pagination support
    searchUsers: async (query: string, page: number = 1, limit: number = 10): Promise<{users: User[], total: number}> => {
        return fetching<{users: User[], total: number}>(AUTH_API, `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
            method: 'GET',
        });
    }
};
//Media-api endpoints 
    // Media-api server has 6 contollers: categories, messages, notifications, reviews, spaces and serviceProviderProfiles. We can implement their API calls here as well, for example:
    // - fetching all categories: fetching<Category[]>(MEDIA_API, '/categories', { method: 'GET' });
    // - fetching messages for a user: fetching<Message[]>(MEDIA_API, '/messages', { method: 'GET' });
    // - fetching notifications for a user: fetching<Notification[]>(MEDIA_API, '/notifications', { method: 'GET' });
    // - fetching reviews for a space: fetching<Review[]>(MEDIA_API, '/reviews?spaceId=123', { method: 'GET' });
    // - fetching spaces and their filters: fetching<Space[]>(MEDIA_API, '/spaces?location=Helsinki&maxPrice=20', { method: 'GET' });
    // - fetching service provider profile by username: fetching<ServiceProviderProfile>(MEDIA_API, '/service-provider-profiles/johndoe', { method: 'GET' });
const mediaApi = {
    fetchCategories: async (): Promise<Category[]> => {
        return fetching<Category[]>(MEDIA_API, '/categories', {
            method: 'GET',
        });
    },
//Todo: adding Listing

    fetchBookings: async (): Promise<Bookings[]> => {
        return fetching<Bookings[]>(MEDIA_API, '/bookings', {
            method: 'GET',
        });
    },
    createBooking: async (bookingData: Partial<Bookings>): Promise<Bookings> => {
        return fetching<Bookings>(MEDIA_API, '/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },
    updateBookingStatus: async (bookingId: number, status: string): Promise<Bookings> => {
        return fetching<Bookings>(MEDIA_API, `/bookings/${bookingId}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },
    cancelBooking: async (bookingId: number): Promise<Bookings> => {
        return fetching<Bookings>(MEDIA_API, `/bookings/${bookingId}/cancel`, {
            method: 'POST',
        });
    },
    fetchMessages: async (): Promise<Message[]> => {
        return fetching<Message[]>(MEDIA_API, '/messages', {
            method: 'GET',
        });
    },
    fetchNotifications: async (): Promise<Notification[]> => {
        return fetching<Notification[]>(MEDIA_API, '/notifications', { 
            method: 'GET',
        });
    },
    fetchReviews: async (spaceId: number): Promise<Review[]> => {
        return fetching<Review[]>(MEDIA_API, `/reviews?spaceId=${spaceId}`, {
            method: 'GET',
        });
    },
    //Updating rewview, auth required and only the review owner can update their review + admin can update any review
    //Todo: Adding roles for updating and deleting reviews, rewiew owner and admin can update and delete reviews, but regular users cannot delete other users' reviews.
   updateReview: async (reviewId: number, reviewData: Partial<Review>): Promise<Review> => {
        return fetching<Review>(MEDIA_API, `/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData),
        });
    },
    deleteReview: async (reviewId: number): Promise<void> => {
        await fetching<void>(MEDIA_API, `/reviews/${reviewId}`, {
            method: 'DELETE',
        });
    },
};
//Upload-server API calls for uploading images and files, for example:
const uploadApi = {
    //Todo: Adding roles for uploading and managing spaces, only service providers can upload and manage their spaces, regular users cannot upload spaces.
    uploadImage: async (file: File): Promise<ListingImages> => {
        const formData = new FormData();
        formData.append('image', file);
        return fetching<ListingImages>(UPLOAD_API, '/upload/image', {
            method: 'POST',
            body: formData,
        });
    },
    uploadSpace: async (spaceData: Partial<Space>): Promise<Space> => {
        return fetching<Space>(UPLOAD_API, '/upload/space', {
            method: 'POST',
            body: JSON.stringify(spaceData),
        });
    },
    SpaceListing: async (listingData: Partial<Listing>): Promise<Listing> => {
        return fetching<Listing>(UPLOAD_API, '/upload/listing', {
            method: 'POST',
            body: JSON.stringify(listingData),
        });
    },
    updateSpace: async (spaceId: number, spaceData: Partial<Space>): Promise<Space> => {
        return fetching<Space>(UPLOAD_API, `/upload/space/${spaceId}`, {
            method: 'PUT',
            body: JSON.stringify(spaceData),
        });
    },
    deleteSpace: async (spaceId: number): Promise<void> => {
        await fetching<void>(UPLOAD_API, `/upload/space/${spaceId}`, {
            method: 'DELETE',
        });
    },
};
//Upload-urls for accessing uploaded images and files, for example:
const getUploadUrl = (filename: string): string => {
    return `${UPLOADS_URL}/${filename}`;
};

export {authApi, userApi, mediaApi, uploadApi, getUploadUrl};