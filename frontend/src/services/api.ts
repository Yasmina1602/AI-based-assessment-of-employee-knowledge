import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, pass: string) => {
    const res = await api.post('/auth/login', { username, password: pass });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },
  getCurrentUser: () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },
  getUsers: async () => {
    const res = await api.get('/auth/users');
    return res.data;
  },
  registerEmployee: async (data: any) => {
    const res = await api.post('/auth/register-employee', data);
    return res.data;
  },
  getDepartmentEmployees: async (deptId: number) => {
    const res = await api.get(`/auth/departments/${deptId}/employees`);
    return res.data;
  },
  updateUser: async (id: number, data: any) => {
    const res = await api.put(`/auth/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: number) => {
    const res = await api.delete(`/auth/users/${id}`);
    return res.data;
  },
  getRoles: async () => {
    const res = await api.get('/auth/roles');
    return res.data;
  },
  getAdmins: async () => {
    const res = await api.get('/auth/admins');
    return res.data;
  },
  createAdmin: async (data: { username: string; password: string; full_name: string; role?: string }) => {
    const res = await api.post('/auth/admins', data);
    return res.data;
  },
  updateAdmin: async (id: number, data: { username?: string; password?: string; full_name?: string; role?: string }) => {
    const res = await api.put(`/auth/admins/${id}`, data);
    return res.data;
  },
  deleteAdmin: async (id: number) => {
    const res = await api.delete(`/auth/admins/${id}`);
    return res.data;
  },
};

export const departmentService = {
  getAll: async () => {
    const res = await api.get('/departments');
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/departments', data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },
};

export const documentService = {
  getAll: async (departmentId?: number) => {
    const url = departmentId ? `/documents?department_id=${departmentId}` : '/documents';
    const res = await api.get(url);
    return res.data;
  },
  upload: async (file: File, departmentId: number, title?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('department_id', String(departmentId));
    if (title) formData.append('title', title);

    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  /**
   * "YANGILASH" (Sync & Learn):
   * AI modeli hujjatni o'rganadi, chunking, embedding saqlaydi va savollar generatsiya qiladi
   */
  sync: async (id: number) => {
    const res = await api.post(`/documents/${id}/sync`);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
};

export const questionService = {
  getAll: async (params?: { department_id?: number; question_type?: string; status?: string }) => {
    const res = await api.get('/questions', { params });
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/questions', data);
    return res.data;
  },
  approve: async (id: number) => {
    const res = await api.patch(`/questions/${id}/approve`);
    return res.data;
  },
  reject: async (id: number) => {
    const res = await api.patch(`/questions/${id}/reject`);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  },
};

export const testSessionService = {
  start: async (departmentId: number) => {
    const res = await api.post('/test-sessions/start', { department_id: departmentId });
    return res.data;
  },
  getDetails: async (id: number) => {
    const res = await api.get(`/test-sessions/${id}`);
    return res.data;
  },
  saveAnswer: async (sessionId: number, questionId: number, data: { selected_option_id?: number; answer_text?: string }) => {
    const res = await api.post(`/test-sessions/${sessionId}/answer`, {
      question_id: questionId,
      ...data,
    });
    return res.data;
  },
  logAntiCheatEvent: async (sessionId: number, eventType: string, details?: any) => {
    const res = await api.post(`/test-sessions/${sessionId}/anti-cheat-event`, {
      event_type: eventType,
      details,
    });
    return res.data;
  },
  submit: async (sessionId: number) => {
    const res = await api.post(`/test-sessions/${sessionId}/submit`);
    return res.data;
  },
  getResults: async (sessionId: number) => {
    const res = await api.get(`/test-sessions/${sessionId}/results`);
    return res.data;
  },
};

export const resultService = {
  getDashboardStats: async () => {
    const res = await api.get('/results/dashboard');
    return res.data;
  },
  getAll: async (params?: { department_id?: number; is_passed?: boolean }) => {
    const res = await api.get('/results/all', { params });
    return res.data;
  },
  getMy: async () => {
    const res = await api.get('/results/my');
    return res.data;
  },
  getLeaderboard: async (deptId?: number) => {
    const res = await api.get('/results/leaderboard', {
      params: deptId ? { department_id: deptId } : {},
    });
    return res.data;
  },
};

