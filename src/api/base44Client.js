// Mock Base44 client for standalone preview mode
// This provides demo data without requiring actual authentication

const mockUser = {
  id: 'demo-user-1',
  email: 'demo@omnimind24.com',
  name: 'Demo User',
  access_level: 'admin',
  credits: 1000,
  profile_picture: null,
  email_verified: true,
  is_active: true,
  created_at: new Date().toISOString()
};

const mockOrders = [
  {
    id: 'order-1',
    title: 'Blog Post: AI in Business',
    task_type: 'blog_post',
    status: 'completed',
    output_content: 'This is a sample AI-generated blog post about artificial intelligence in modern business...',
    created_date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'order-2',
    title: 'Social Media Campaign',
    task_type: 'social_media',
    status: 'completed',
    output_content: 'Engaging social media content for your brand...',
    created_date: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'order-3',
    title: 'Email Newsletter',
    task_type: 'email',
    status: 'processing',
    output_content: null,
    created_date: new Date().toISOString()
  }
];

const mockTemplates = [
  {
    id: 'template-1',
    name: 'Professional Blog Post',
    description: 'Create engaging blog posts for your business',
    category: 'content',
    task_type: 'blog_post'
  },
  {
    id: 'template-2',
    name: 'Social Media Bundle',
    description: 'Generate content for multiple social platforms',
    category: 'social',
    task_type: 'social_media'
  },
  {
    id: 'template-3',
    name: 'Email Marketing',
    description: 'Craft compelling email campaigns',
    category: 'email',
    task_type: 'email'
  }
];

// Mock entity operations
const createMockEntity = (entityName) => ({
  list: async (_orderBy) => {
    if (entityName === 'ContentOrder') return mockOrders;
    if (entityName === 'Template') return mockTemplates;
    return [];
  },
  get: async (id) => {
    if (entityName === 'ContentOrder') return mockOrders.find(o => o.id === id);
    if (entityName === 'Template') return mockTemplates.find(t => t.id === id);
    return null;
  },
  create: async (data) => ({ id: `new-${Date.now()}`, ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async (id) => ({ success: true })
});

// Mock Base44 client
export const base44 = {
  auth: {
    me: async () => mockUser,
    redirectToLogin: (returnPath) => {
      if (import.meta.env.DEV) {
      console.log('Demo mode: Login redirect would go to:', returnPath);
      }
      // In demo mode, we don't redirect
    },
    logout: () => {
      if (import.meta.env.DEV) {
      console.log('Demo mode: Logout clicked');
      }
      window.location.reload();
    }
  },
  entities: {
    ContentOrder: createMockEntity('ContentOrder'),
    Template: createMockEntity('Template'),
    User: createMockEntity('User'),
    CreditTransaction: createMockEntity('CreditTransaction'),
    UserPreferences: createMockEntity('UserPreferences'),
    AffiliateReferral: createMockEntity('AffiliateReferral'),
    ActionItem: createMockEntity('ActionItem'),
    UserFile: createMockEntity('UserFile')
  },
  functions: {
    invoke: async (functionName, params) => {
      if (import.meta.env.DEV) {
      console.log('Demo mode: Function invoked:', functionName, params);
      }
      return { data: 'Demo function response' };
    }
  },
  from: (tableName) => ({
    select: async (fields) => {
      if (import.meta.env.DEV) {
      console.log('Demo mode: Select from', tableName);
      }
      return [];
    },
    insert: async (data) => {
      if (import.meta.env.DEV) {
      console.log('Demo mode: Insert into', tableName, data);
      }
      return { id: `new-${Date.now()}`, ...data };
    }
  })
};
