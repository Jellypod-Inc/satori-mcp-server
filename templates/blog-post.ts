export interface BlogPostTemplateParams {
  title: string;
  author?: string;
  date?: string;
  content: string;
  readTime?: string;
  tags?: string[];
}

export const blogPostTemplate = {
  name: 'blog-post',
  description: 'A clean blog post template with title, author, date, and content',
  parameters: {
    title: { type: 'string', required: true, description: 'Blog post title' },
    author: { type: 'string', required: false, description: 'Author name' },
    date: { type: 'string', required: false, description: 'Publication date' },
    content: { type: 'string', required: true, description: 'Main content of the blog post' },
    readTime: { type: 'string', required: false, description: 'Estimated read time (e.g., "5 min read")' },
    tags: { type: 'array', required: false, description: 'Array of tags' },
  },
  defaultSize: { width: 1200, height: 630 },
  googleFonts: [
    { name: 'Inter', weight: 400, style: 'normal' as const },
    { name: 'Inter', weight: 700, style: 'normal' as const },
  ],
  generate: (params: BlogPostTemplateParams) => ({
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: '60px',
        fontFamily: 'Inter, sans-serif',
      },
      children: [
        // Tags
        params.tags && params.tags.length > 0 ? {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
            },
            children: params.tags.map(tag => ({
              type: 'span',
              props: {
                style: {
                  backgroundColor: '#f0f0f0',
                  color: '#666',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '14px',
                },
                children: tag,
              },
            })),
          },
        } : null,
        // Title
        {
          type: 'h1',
          props: {
            style: {
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              margin: '0 0 20px 0',
              lineHeight: 1.2,
            },
            children: params.title,
          },
        },
        // Meta info
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              color: '#666',
              fontSize: '18px',
              marginBottom: '30px',
            },
            children: [
              params.author ? {
                type: 'span',
                props: {
                  children: params.author,
                },
              } : null,
              params.date ? {
                type: 'span',
                props: {
                  children: params.date,
                },
              } : null,
              params.readTime ? {
                type: 'span',
                props: {
                  children: params.readTime,
                },
              } : null,
            ].filter(Boolean),
          },
        },
        // Content preview
        {
          type: 'p',
          props: {
            style: {
              fontSize: '20px',
              color: '#444',
              lineHeight: 1.6,
              margin: 0,
              flex: 1,
            },
            children: params.content,
          },
        },
      ].filter(Boolean),
    },
  }),
};