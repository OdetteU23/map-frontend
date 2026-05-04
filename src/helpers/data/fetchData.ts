import type {
  Bookings,
  Category,
  ListingImages,
  Message,
  Notification,
  Payment,
  Review,
  Space,
  TokenMessages,
  User,
  UserRole,
} from 'map-hybrid-types-server';
import type { LoginData, RegisterData } from '../types/localTypes';

const isProduction = import.meta.env.PROD;

const resolveApiBaseUrl = (
  envValue: string | undefined,
  fallback: string,
  envName: string
): string => {
  if (envValue) {
    return envValue;
  }

  if (isProduction) {
    throw new Error(`${envName} is required in production. Set it in your Vercel environment variables.`);
  }

  return fallback;
};

const AUTH_API = resolveApiBaseUrl(import.meta.env.VITE_AUTH_API, 'http://localhost:3000/api', 'VITE_AUTH_API');
const MEDIA_API = resolveApiBaseUrl(import.meta.env.VITE_MEDIA_API, 'http://localhost:3001/api', 'VITE_MEDIA_API');
const UPLOAD_API = resolveApiBaseUrl(import.meta.env.VITE_UPLOAD_API, 'http://localhost:3002/api', 'VITE_UPLOAD_API');
const UPLOADS_URL = resolveApiBaseUrl(import.meta.env.VITE_UPLOADS_URL, 'http://localhost:3002/uploads', 'VITE_UPLOADS_URL');
const PAYMENT_API = resolveApiBaseUrl(import.meta.env.VITE_PAYMENT_API, 'http://localhost:3003/api', 'VITE_PAYMENT_API');

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const getAuthHeader = (isFormData = false): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
};

export type SpaceCreatePayload = Partial<Space> & {
  owner_id: number;
  owner_name: string;
  owner_username: string;
  owner_email: string;
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

const authApi = {
  Register: async (userData: RegisterData | Partial<UserRole>) => {
    const role = 'role' in userData && userData.role ? userData.role : 'consumer';
    const response = await fetching<AuthResponse>(AUTH_API, `/auth/register/${role}`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    localStorage.setItem('authToken', response.accessToken);
    return response;
  },

  Login: async (loginData: LoginData) => {
    const response = await fetching<AuthResponse>(AUTH_API, '/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    localStorage.setItem('authToken', response.accessToken);
    return response;
  },

  Logout: (): void => {
    localStorage.removeItem('authToken');
  },

  fetchCurrentUser: async (): Promise<User> => {
    return fetching<User>(AUTH_API, '/auth/me', {
      method: 'GET',
    });
  },

  getNowUser: async (): Promise<User> => {
    return fetching<User>(AUTH_API, '/auth/me', {
      method: 'GET',
    });
  },

  fetchPaymentsHistory: async (username: string): Promise<Payment[]> => {
    return fetching<Payment[]>(PAYMENT_API, `/payments/history/${encodeURIComponent(username)}`, {
      method: 'GET',
    });
  },

  registerServiceProvider: async (providerData: Partial<User>): Promise<AuthResponse> => {
    const response = await fetching<AuthResponse>(AUTH_API, '/auth/register/provider', {
      method: 'POST',
      body: JSON.stringify(providerData),
    });
    localStorage.setItem('authToken', response.accessToken);
    return response;
  },

  registerConsumer: async (consumerData: Partial<User>): Promise<AuthResponse> => {
    const response = await fetching<AuthResponse>(AUTH_API, '/auth/register/consumer', {
      method: 'POST',
      body: JSON.stringify(consumerData),
    });
    localStorage.setItem('authToken', response.accessToken);
    return response;
  },

  createPaymentIntent: async (paymentData: {
    amount: number;
    currency?: string;
    booking_id: number;
    user_id: number;
    payment_method?: string;
  }): Promise<{ clientSecret: string; payment: Payment }> => {
    return fetching<{ clientSecret: string; payment: Payment }>(PAYMENT_API, '/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  createPayment: async (paymentData: Partial<Payment>): Promise<Payment> => {
    return fetching<Payment>(PAYMENT_API, '/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getPaymentToken: async (paymentData: Partial<Payment>): Promise<TokenMessages> => {
    return fetching<TokenMessages>(PAYMENT_API, '/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  updatePaymentStatus: async (paymentId: number, status: string): Promise<Payment> => {
    return fetching<Payment>(PAYMENT_API, `/payments/update/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status: status }),
    });
  },

  cancelPayment: async (paymentId: number): Promise<Payment> => {
    return fetching<Payment>(PAYMENT_API, `/payments/cancel/${paymentId}`, {
      method: 'POST',
    });
  },

  refundPayment: async (paymentId: number): Promise<Payment> => {
    return fetching<Payment>(PAYMENT_API, `/payments/refund/${paymentId}`, {
      method: 'POST',
    });
  },
};

const userApi = {
  fetchUserProfile: async (username: string): Promise<User> => {
    return fetching<User>(AUTH_API, `/users/profile/${encodeURIComponent(username)}`, {
      method: 'GET',
    });
  },

  fetchUserProfileByEmail: async (email: string): Promise<User> => {
    return fetching<User>(AUTH_API, `/users/email/${encodeURIComponent(email)}`, {
      method: 'GET',
    });
  },

  editingProfile: async (username: string, profileData: Partial<User>): Promise<User> => {
    return fetching<User>(AUTH_API, `/users/profile/${encodeURIComponent(username)}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

const mediaApi = {
  fetchCategories: async (): Promise<Category[]> => {
    return fetching<Category[]>(MEDIA_API, '/categories', {
      method: 'GET',
    });
  },

  fetchSpaces: async (query?: string): Promise<Space[]> => {
    if (query) {
      return fetching<Space[]>(MEDIA_API, `/spaces/fetch?${query}`, {
        method: 'GET',
      });
    }

    return fetching<Space[]>(MEDIA_API, '/spaces/all', {
      method: 'GET',
    });
  },

  fetchSpaceById: async (spaceId: number): Promise<Space> => {
    return fetching<Space>(MEDIA_API, `/spaces/${spaceId}`, {
      method: 'GET',
    });
  },

  fetchSpacesByOwner: async (ownerId: number): Promise<Space[]> => {
    return fetching<Space[]>(MEDIA_API, `/spaces/owner/${ownerId}`, {
      method: 'GET',
    });
  },

  sendMessage: async (messageData: Partial<Message>): Promise<Message> => {
    return fetching<Message>(MEDIA_API, '/messages/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

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

  cancelBooking: async (bookingId: number): Promise<void> => {
    await fetching<void>(MEDIA_API, `/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  },

  fetchMessages: async (username: string): Promise<Message[]> => {
    return fetching<Message[]>(MEDIA_API, `/messages/fetch/${encodeURIComponent(username)}`, {
      method: 'GET',
    });
  },

  fetchNotifications: async (username: string): Promise<Notification[]> => {
    return fetching<Notification[]>(MEDIA_API, `/notifications/${encodeURIComponent(username)}`, {
      method: 'GET',
    });
  },

  createNotification: async (notificationData: Partial<Notification>): Promise<Notification> => {
    return fetching<Notification>(MEDIA_API, '/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },

  fetchReviews: async (spaceId: number): Promise<Review[]> => {
    return fetching<Review[]>(MEDIA_API, `/reviews/fetch/${spaceId}`, {
      method: 'GET',
    });
  },

  addReview: async (reviewData: {
    user_id: Review['user_id'];
    space_id: Review['space_id'];
    rating: Review['rating'];
    comment: Review['comment'];
  }): Promise<Review> => {
    return fetching<Review>(MEDIA_API, '/reviews/add', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  updateReview: async (reviewId: number, reviewData: Partial<Review>): Promise<Review> => {
    return fetching<Review>(MEDIA_API, `/reviews/edit/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await fetching<void>(MEDIA_API, `/reviews/delete/${reviewId}`, {
      method: 'DELETE',
    });
  },
};

const uploadApi = {
  uploadImage: async (file: File, listingId?: number): Promise<ListingImages> => {
    const formData = new FormData();
    formData.append('image', file);
    if (listingId != null) formData.append('listing_id', String(listingId));

    return fetching<ListingImages>(UPLOAD_API, '/uploads/upload', {
      method: 'POST',
      body: formData,
    });
  },

  fetchImagesByListing: async (listingId: number): Promise<ListingImages[]> => {
    return fetching<ListingImages[]>(UPLOAD_API, `/uploads/listing/${listingId}`, {
      method: 'GET',
    });
  },

  updateImage: async (imageId: number, imageData: Partial<ListingImages>): Promise<ListingImages> => {
    return fetching<ListingImages>(UPLOAD_API, `/uploads/edit/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(imageData),
    });
  },

  deleteImage: async (imageId: number): Promise<void> => {
    await fetching<void>(UPLOAD_API, `/uploads/delete/${imageId}`, {
      method: 'DELETE',
    });
  },

  uploadSpace: async (spaceData: SpaceCreatePayload): Promise<Space> => {
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
