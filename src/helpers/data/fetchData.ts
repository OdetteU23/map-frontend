import type { User, Payment, TokenMessages, UserRole, Bookings, Category, Message, Notification, Review, Space, 
     ListingImages} from "map-hybrid-types-server";
    //ErrorResponse, Listing
import type { RegisterData, LoginData } from '../types/localTypes';

const AUTH_API = import.meta.env.VITE_AUTH_API || 'http://localhost:3000/api';
const MEDIA_API = import.meta.env.VITE_MEDIA_API || 'http://localhost:3001/api';
const UPLOAD_API = import.meta.env.VITE_UPLOAD_API || 'http://localhost:3002/api';
const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3002/uploads';

const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

const getAuthHeader = (isFormData = false): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
    //
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

// Response type matching backend's auth responses — user is the full profile minus password
type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'password'>;
};

async function fetching<T>(
    baseUrl: string,
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        const isFormData = options.body instanceof FormData;
        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeader(isFormData),
                ...options.headers,
            },
        });
        if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
// Auth API calls
const authApi = {
    // Register — backend returns { accessToken, refreshToken, user }
    Register: async (userData: RegisterData | Partial<UserRole>) => {
        const role = 'role' in userData && userData.role ? userData.role : 'consumer';
        const response = await fetching<AuthResponse>(AUTH_API, `/auth/register/${role}`, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        localStorage.setItem('authToken', response.accessToken);
        return response;
    },
    // Login — backend returns { accessToken, refreshToken, user }
    Login: async (loginData: LoginData) => {
        const response = await fetching<AuthResponse>(AUTH_API, '/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData),
        });
        localStorage.setItem('authToken', response.accessToken);
        return response;
    },
    //Logout api call
    Logout: (): void => {
        localStorage.removeItem('authToken');
    },

    // Fetch the current user's profile via GET /api/auth/me
    fetchCurrentUser: async (): Promise<User> => {
        return fetching<User>(AUTH_API, '/auth/me', {
            method: 'GET',
        });
    },

    // Alias used by AuthContext
    getNowUser: async (): Promise<User> => {
        return fetching<User>(AUTH_API, '/auth/me', {
            method: 'GET',
        });
    },

    // Fetch the current user's payments history — backend: GET /payments/history/:username
    fetchPaymentsHistory: async (username: string): Promise<Payment[]> => {
        return fetching<Payment[]>(AUTH_API, `/payments/history/${encodeURIComponent(username)}`, {
            method: 'GET',
        });
    },
    // Register as service provider — backend: POST /auth/register/provider
    registerServiceProvider: async (providerData: Partial<User>): Promise<AuthResponse> => {
        const response = await fetching<AuthResponse>(AUTH_API, '/auth/register/provider', {
            method: 'POST',
            body: JSON.stringify(providerData),
        });
        localStorage.setItem('authToken', response.accessToken);
        return response;
    },
    // Register as consumer — backend: POST /auth/register/consumer
    registerConsumer: async (consumerData: Partial<User>): Promise<AuthResponse> => {
        const response = await fetching<AuthResponse>(AUTH_API, '/auth/register/consumer', {
            method: 'POST',
            body: JSON.stringify(consumerData),
        });
        localStorage.setItem('authToken', response.accessToken);
        return response;
    },
    //Payment processing — backend: POST /payments/process
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
    // backend: PUT /payments/update/:id
    updatePayemntStatus: async (paymentId: number, status: string): Promise<Payment> => {
        return fetching<Payment>(AUTH_API, `/payments/update/${paymentId}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },
    // backend: POST /payments/cancel/:id
    cancelPayment: async (paymentId: number): Promise<Payment> => {
        return fetching<Payment>(AUTH_API, `/payments/cancel/${paymentId}`, {
            method: 'POST',
        });
    },
    // backend: POST /payments/refund/:id
    refundPayment: async (paymentId: number): Promise<Payment> => {
        return fetching<Payment>(AUTH_API, `/payments/refund/${paymentId}`, {
            method: 'POST',
        });
    },
    
};

// User's profile related API calls — backend routes: GET/PUT /users/profile/:username
const userApi = {
    // backend: GET /users/profile/:username
    fetchUserProfile: async (username: string): Promise<User> => {
        return fetching<User>(AUTH_API, `/users/profile/${encodeURIComponent(username)}`, {
            method: 'GET',
        });
    },

    // backend: PUT /users/profile/:username
    editingProfile: async (username: string, profileData: Partial<User>): Promise<User> => {
        return fetching<User>(AUTH_API, `/users/profile/${encodeURIComponent(username)}`, {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },
};

// Media-api endpoints — port 3001
const mediaApi = {
    // backend: GET /categories/:id  (no "list all" route on backend yet)
    fetchCategories: async (): Promise<Category[]> => {
        return fetching<Category[]>(MEDIA_API, '/categories', {
            method: 'GET',
        });
    },
    // backend: GET /spaces/all (list all spaces) or GET /spaces/fetch?title=...
    fetchSpaces: async (query?: string): Promise<Space[]> => {
        if (query) {
            return fetching<Space[]>(MEDIA_API, `/spaces/fetch?${query}`, {
                method: 'GET',
            });
        }
        return fetching<Space[]>(MEDIA_API, `/spaces/all`, {
            method: 'GET',
        });
    },
    // backend: GET /spaces/ (no single-space route; fetch all and filter client-side, or use /spaces/fetch)
    fetchSpaceById: async (spaceId: number): Promise<Space> => {
        return fetching<Space>(MEDIA_API, `/spaces/${spaceId}`, {
            method: 'GET',
        });
    },
    // backend: GET /spaces/owner/:ownerId
    fetchSpacesByOwner: async (ownerId: number): Promise<Space[]> => {
        return fetching<Space[]>(MEDIA_API, `/spaces/owner/${ownerId}`, {
            method: 'GET',
        });
    },
    // backend: POST /messages/send
    sendMessage: async (messageData: Partial<Message>): Promise<Message> => {
        return fetching<Message>(MEDIA_API, '/messages/send', {
            method: 'POST',
            body: JSON.stringify(messageData),
        });
    },
    // backend: GET /bookings/:id  (individual booking by id)
    fetchBookings: async (): Promise<Bookings[]> => {
        return fetching<Bookings[]>(MEDIA_API, '/bookings', {
            method: 'GET',
        });
    },
    // backend: POST /bookings/
    createBooking: async (bookingData: Partial<Bookings>): Promise<Bookings> => {
        return fetching<Bookings>(MEDIA_API, '/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },
    // backend: PUT /bookings/:id
    updateBookingStatus: async (bookingId: number, status: string): Promise<Bookings> => {
        return fetching<Bookings>(MEDIA_API, `/bookings/${bookingId}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },
    // backend: DELETE /bookings/:id
    cancelBooking: async (bookingId: number): Promise<void> => {
        await fetching<void>(MEDIA_API, `/bookings/${bookingId}`, {
            method: 'DELETE',
        });
    },
    // backend: GET /messages/fetch/:username
    fetchMessages: async (username: string): Promise<Message[]> => {
        return fetching<Message[]>(MEDIA_API, `/messages/fetch/${encodeURIComponent(username)}`, {
            method: 'GET',
        });
    },
    // backend: GET /notifications/:username (mounted at /api, so full path is /api/notifications/:username)
    fetchNotifications: async (username: string): Promise<Notification[]> => {
        return fetching<Notification[]>(MEDIA_API, `/notifications/${encodeURIComponent(username)}`, { 
            method: 'GET',
        });
    },
    // backend: GET /reviews/fetch/:spaceName
    fetchReviews: async (spaceName: string): Promise<Review[]> => {
        return fetching<Review[]>(MEDIA_API, `/reviews/fetch/${encodeURIComponent(spaceName)}`, {
            method: 'GET',
        });
    },
    // backend: PUT /reviews/edit/:id
    updateReview: async (reviewId: number, reviewData: Partial<Review>): Promise<Review> => {
        return fetching<Review>(MEDIA_API, `/reviews/edit/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData),
        });
    },
    // backend: DELETE /reviews/delete/:id
    deleteReview: async (reviewId: number): Promise<void> => {
        await fetching<void>(MEDIA_API, `/reviews/delete/${reviewId}`, {
            method: 'DELETE',
        });
    },
};

// Upload-server API calls — port 3002, routes mounted at /api/uploads
const uploadApi = {
    // backend: POST /uploads/upload
    uploadImage: async (file: File, listingId?: number): Promise<ListingImages> => {
        const formData = new FormData();
        formData.append('image', file);
        if (listingId != null) formData.append('listing_id', String(listingId));
        return fetching<ListingImages>(UPLOAD_API, '/uploads/upload', {
            method: 'POST',
            body: formData,
        });
    },
    // backend: GET /uploads/listing/:listingId
    fetchImagesByListing: async (listingId: number): Promise<ListingImages[]> => {
        return fetching<ListingImages[]>(UPLOAD_API, `/uploads/listing/${listingId}`, {
            method: 'GET',
        });
    },
    // backend: PUT /uploads/edit/:id
    updateImage: async (imageId: number, imageData: Partial<ListingImages>): Promise<ListingImages> => {
        return fetching<ListingImages>(UPLOAD_API, `/uploads/edit/${imageId}`, {
            method: 'PUT',
            body: JSON.stringify(imageData),
        });
    },
    // backend: DELETE /uploads/delete/:id
    deleteImage: async (imageId: number): Promise<void> => {
        await fetching<void>(UPLOAD_API, `/uploads/delete/${imageId}`, {
            method: 'DELETE',
        });
    },
    // These endpoints don't exist on the upload server yet — they're on the media-api spaces route
    uploadSpace: async (spaceData: Partial<Space>): Promise<Space> => {
        return fetching<Space>(MEDIA_API, '/spaces/create', {
            method: 'POST',
            body: JSON.stringify(spaceData),
        });
    },
    updateSpace: async (spaceId: number, spaceData: Partial<Space>): Promise<Space> => {
        return fetching<Space>(MEDIA_API, `/spaces/update/${spaceId}`, {
            method: 'PUT',
            body: JSON.stringify(spaceData),
        });
    },
    deleteSpace: async (spaceId: number): Promise<void> => {
        await fetching<void>(MEDIA_API, `/spaces/remove/${spaceId}`, {
            method: 'DELETE',
        });
    },
};

//Upload-urls for accessing uploaded images and files
const getUploadUrl = (filename: string): string => {
    return `${UPLOADS_URL}/${filename}`;
};

const api = {
    auth: authApi,
    user: userApi,
    media: mediaApi,
    upload: uploadApi,
    getUploadUrl,
};

export { authApi, userApi, mediaApi, uploadApi, getUploadUrl, api };
export type { AuthResponse };
//export default api;