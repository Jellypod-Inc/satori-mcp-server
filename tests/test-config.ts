interface TestCase {
  name: string;
  params: Record<string, any>;
}

interface TestConfig {
  templates: Record<string, TestCase[]>;
}

export const testConfig: TestConfig = {
  templates: {
    'social-card': [
      {
        name: 'basic',
        params: {
          title: 'Welcome to My Blog',
          description: 'A place to share ideas and learn together',
          backgroundColor: '#2563eb',
        }
      },
      {
        name: 'long-title',
        params: {
          title: 'This is a Very Long Title That Should Still Look Good in the Social Card Template',
          description: 'Testing how the template handles longer text content',
          backgroundColor: '#dc2626',
        }
      },
      {
        name: 'no-description',
        params: {
          title: 'Title Only Card',
          backgroundColor: '#16a34a',
        }
      },
      {
        name: 'custom-colors',
        params: {
          title: 'Custom Background Color',
          description: 'Testing different color schemes',
          backgroundColor: '#7c3aed',
        }
      }
    ],
    'blog-header': [
      {
        name: 'basic',
        params: {
          title: 'Getting Started with TypeScript',
          author: 'Jane Smith',
          date: '2024-01-15',
          category: 'Programming',
        }
      },
      {
        name: 'long-title',
        params: {
          title: 'A Comprehensive Guide to Building Scalable Microservices with Node.js and Docker',
          author: 'John Doe',
          date: '2024-03-22',
          category: 'DevOps',
        }
      },
      {
        name: 'minimal',
        params: {
          title: 'Quick Tips for Clean Code',
          author: 'Alex Johnson',
          date: '2024-02-10',
        }
      },
      {
        name: 'different-category',
        params: {
          title: 'Machine Learning Fundamentals',
          author: 'Dr. Sarah Lee',
          date: '2024-04-05',
          category: 'AI/ML',
        }
      }
    ],
    'quote': [
      {
        name: 'basic',
        params: {
          quote: 'The only way to do great work is to love what you do.',
          author: 'Steve Jobs',
        }
      },
      {
        name: 'long-quote',
        params: {
          quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts. Every champion was once a contender who refused to give up.',
          author: 'Winston Churchill',
        }
      },
      {
        name: 'no-author',
        params: {
          quote: 'Be yourself; everyone else is already taken.',
        }
      },
      {
        name: 'custom-background',
        params: {
          quote: 'Innovation distinguishes between a leader and a follower.',
          author: 'Steve Jobs',
          backgroundColor: '#10b981',
        }
      }
    ]
  }
};