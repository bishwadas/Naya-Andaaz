import {
  ActivityLog,
  Category,
  Comment,
  DashboardMetrics,
  MediaItem,
  Menu,
  Notification,
  Page,
  Post,
  SiteSettings,
  Tag,
  User,
} from '@/types';

const API_BASE = '/api';

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const text = await response.text();

  let data: any = null;
  if (isJson) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: `Invalid JSON response received: ${text.slice(0, 200)}` };
    }
  } else {
    data = { error: text.trim() ? text.slice(0, 200) : `Non-JSON response (${response.status} ${response.statusText})` };
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status} (${response.statusText})`;
    const err = new Error(errorMsg);
    (err as any).status = response.status;
    (err as any).data = data;
    throw err;
  }

  if (!isJson) {
    throw new Error(
      `Server returned non-JSON response (${response.status} ${response.statusText}) from ${response.url}`
    );
  }

  return data as T;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const method = options?.method || 'GET';
  console.log(`[API Request] ${method} ${url}`);
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  return parseApiResponse<T>(res);
}

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string; service: string }>(`${API_BASE}/health`),

  // Seed
  seedDatabase: () =>
    fetchJson<{ success: boolean; message: string }>(`${API_BASE}/seed`, {
      method: 'POST',
    }),

  // Metrics
  getDashboardMetrics: () => fetchJson<DashboardMetrics>(`${API_BASE}/metrics`),

  // Posts
  getPosts: (params?: {
    status?: string;
    categoryId?: string;
    subCategoryId?: string;
    categorySlug?: string;
    tagSlug?: string;
    authorId?: string;
    search?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    isEditorPick?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          query.set(key, String(val));
        }
      });
    }
    return fetchJson<Post[]>(`${API_BASE}/posts?${query.toString()}`);
  },

  getPostBySlug: (slug: string) => fetchJson<Post>(`${API_BASE}/posts/${slug}`),

  createPost: (data: Partial<Post>) =>
    fetchJson<Post>(`${API_BASE}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePost: (id: string, data: Partial<Post>) =>
    fetchJson<Post>(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePost: (id: string, permanent = false) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/posts/${id}?permanent=${permanent}`, {
      method: 'DELETE',
    }),

  trackPostView: (slug: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/posts/${slug}/view`, {
      method: 'POST',
    }),

  likePost: (id: string) =>
    fetchJson<{ success: boolean; likes: number }>(`${API_BASE}/posts/${id}/like`, {
      method: 'POST',
    }),

  // Categories
  getCategories: () => fetchJson<Category[]>(`${API_BASE}/categories`),

  createCategory: (data: Partial<Category>) =>
    fetchJson<Category>(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: string, data: Partial<Category>) =>
    fetchJson<Category>(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
    }),

  // Tags
  getTags: () => fetchJson<Tag[]>(`${API_BASE}/tags`),

  createTag: (data: Partial<Tag>) =>
    fetchJson<Tag>(`${API_BASE}/tags`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteTag: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/tags/${id}`, {
      method: 'DELETE',
    }),

  // Media
  getMedia: () => fetchJson<MediaItem[]>(`${API_BASE}/media`),

  createMedia: (data: Partial<MediaItem>) =>
    fetchJson<MediaItem>(`${API_BASE}/media`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadMedia: (data: Partial<MediaItem>) =>
    fetchJson<MediaItem>(`${API_BASE}/media`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteMedia: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/media/${id}`, {
      method: 'DELETE',
    }),

  // Pages
  getPages: () => fetchJson<Page[]>(`${API_BASE}/pages`),

  getPageBySlug: (slug: string) => fetchJson<Page>(`${API_BASE}/pages/${slug}`),

  createPage: (data: Partial<Page>) =>
    fetchJson<Page>(`${API_BASE}/pages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePage: (id: string, data: Partial<Page>) =>
    fetchJson<Page>(`${API_BASE}/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePage: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/pages/${id}`, {
      method: 'DELETE',
    }),

  // Users
  getUsers: () => fetchJson<User[]>(`${API_BASE}/users`),

  getUserById: (id: string) => fetchJson<User>(`${API_BASE}/users/${id}`),

  createUser: (data: Partial<User>) =>
    fetchJson<User>(`${API_BASE}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (id: string, data: Partial<User>) =>
    fetchJson<User>(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Comments
  getComments: (params?: { postId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.postId) query.set('postId', params.postId);
    if (params?.status) query.set('status', params.status);
    return fetchJson<Comment[]>(`${API_BASE}/comments?${query.toString()}`);
  },

  createComment: (data: Partial<Comment>) =>
    fetchJson<Comment>(`${API_BASE}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCommentStatus: (id: string, status: string) =>
    fetchJson<Comment>(`${API_BASE}/comments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  deleteComment: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/comments/${id}`, {
      method: 'DELETE',
    }),

  // Menus
  getMenus: () => fetchJson<Menu[]>(`${API_BASE}/menus`),

  updateMenuItems: (id: string, items: any[]) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/menus/${id}/items`, {
      method: 'PUT',
      body: JSON.stringify({ items }),
    }),

  // Settings
  getSettings: () => fetchJson<SiteSettings>(`${API_BASE}/settings`),

  updateSettings: (data: Partial<SiteSettings>) =>
    fetchJson<SiteSettings>(`${API_BASE}/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Activity & Notifications
  getActivityLogs: (limit = 20) =>
    fetchJson<ActivityLog[]>(`${API_BASE}/activity?limit=${limit}`),

  getNotifications: () => fetchJson<Notification[]>(`${API_BASE}/notifications`),

  markNotificationRead: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/notifications/${id}/read`, {
      method: 'POST',
    }),

  // Advertisements
  getAds: (location?: string) => {
    const query = location ? `?location=${location}` : '';
    return fetchJson<any[]>(`${API_BASE}/ads${query}`);
  },

  createAd: (data: any) =>
    fetchJson<any>(`${API_BASE}/ads`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAd: (id: string, data: any) =>
    fetchJson<any>(`${API_BASE}/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAd: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/ads/${id}`, {
      method: 'DELETE',
    }),

  // Newsletter
  getNewsletters: () => fetchJson<any[]>(`${API_BASE}/newsletters`),

  subscribeNewsletter: (email: string, name?: string, source?: string) =>
    fetchJson<any>(`${API_BASE}/newsletters`, {
      method: 'POST',
      body: JSON.stringify({ email, name, source }),
    }),

  // AI Assistant
  aiGenerate: (action: string, prompt: string, topic?: string) =>
    fetchJson<{ success: boolean; result: string }>(`${API_BASE}/ai`, {
      method: 'POST',
      body: JSON.stringify({ action, prompt, topic }),
    }),

  // Videos
  getVideos: () => fetchJson<any[]>(`${API_BASE}/videos`),

  createVideo: (data: any) =>
    fetchJson<any>(`${API_BASE}/videos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteVideo: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/videos/${id}`, {
      method: 'DELETE',
    }),

  // Trash
  getTrash: () => fetchJson<any[]>(`${API_BASE}/trash`),
  restoreTrashItem: (type: string, id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/trash/${type}/${id}`, {
      method: 'POST',
    }),
  permanentDeleteTrashItem: (type: string, id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/trash/${type}/${id}`, {
      method: 'DELETE',
    }),
  restoreAllTrash: () =>
    fetchJson<{ success: boolean }>(`${API_BASE}/trash`, {
      method: 'POST',
      body: JSON.stringify({ action: 'restore-all' }),
    }),
  emptyTrash: () =>
    fetchJson<{ success: boolean }>(`${API_BASE}/trash`, {
      method: 'POST',
      body: JSON.stringify({ action: 'empty' }),
    }),
};

