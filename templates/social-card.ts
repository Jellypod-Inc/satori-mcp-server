export interface SocialCardTemplateParams {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  logo?: string;
}

export const socialCardTemplate = {
  name: 'social-card',
  description: 'Social media card with gradient background and centered text',
  parameters: {
    title: { type: 'string', required: true, description: 'Main title text' },
    subtitle: { type: 'string', required: false, description: 'Subtitle or description' },
    backgroundColor: { type: 'string', required: false, description: 'Background color or gradient', default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    textColor: { type: 'string', required: false, description: 'Text color', default: '#ffffff' },
    accentColor: { type: 'string', required: false, description: 'Accent color for subtitle', default: 'rgba(255, 255, 255, 0.9)' },
    logo: { type: 'string', required: false, description: 'Logo text or emoji' },
  },
  defaultSize: { width: 1200, height: 630 },
  googleFonts: [
    { name: 'Inter', weight: 700, style: 'normal' as const },
  ],
  generate: (params: SocialCardTemplateParams) => ({
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: params.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px',
        fontFamily: 'Inter, sans-serif',
      },
      children: [
        // Logo
        params.logo ? {
          type: 'div',
          props: {
            style: {
              fontSize: '64px',
              marginBottom: '30px',
            },
            children: params.logo,
          },
        } : null,
        // Title
        {
          type: 'h1',
          props: {
            style: {
              fontSize: '72px',
              fontWeight: 'bold',
              color: params.textColor || '#ffffff',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.2,
            },
            children: params.title,
          },
        },
        // Subtitle
        params.subtitle ? {
          type: 'p',
          props: {
            style: {
              fontSize: '32px',
              color: params.accentColor || 'rgba(255, 255, 255, 0.9)',
              marginTop: '30px',
              textAlign: 'center',
              lineHeight: 1.4,
            },
            children: params.subtitle,
          },
        } : null,
      ].filter(Boolean),
    },
  }),
};