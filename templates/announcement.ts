export interface AnnouncementTemplateParams {
  headline: string;
  message: string;
  ctaText?: string;
  date?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const announcementTemplate = {
  name: 'announcement',
  description: 'Announcement banner template with different types',
  parameters: {
    headline: { type: 'string', required: true, description: 'Announcement headline' },
    message: { type: 'string', required: true, description: 'Main announcement message' },
    ctaText: { type: 'string', required: false, description: 'Call to action text' },
    date: { type: 'string', required: false, description: 'Announcement date' },
    type: { type: 'string', required: false, description: 'Type of announcement', enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  },
  defaultSize: { width: 1200, height: 630 },
  googleFonts: [
    { name: 'Inter', weight: 600, style: 'normal' as const },
    { name: 'Inter', weight: 700, style: 'normal' as const },
  ],
  generate: (params: AnnouncementTemplateParams) => {
    const colors = {
      info: { bg: '#3498db', accent: '#2980b9' },
      success: { bg: '#27ae60', accent: '#229954' },
      warning: { bg: '#f39c12', accent: '#e67e22' },
      error: { bg: '#e74c3c', accent: '#c0392b' },
    };
    
    const theme = colors[params.type || 'info'];
    
    return {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.accent} 100%)`,
          padding: '60px',
          fontFamily: 'Inter, sans-serif',
        },
        children: [
          // Date
          params.date ? {
            type: 'div',
            props: {
              style: {
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              },
              children: params.date,
            },
          } : null,
          // Type indicator badge
          {
            type: 'div',
            props: {
              style: {
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                marginBottom: '30px',
                padding: '8px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                textTransform: 'uppercase',
              },
              children: params.type === 'success' ? 'SUCCESS' : 
                        params.type === 'warning' ? 'WARNING' : 
                        params.type === 'error' ? 'ALERT' : 'INFO',
            },
          },
          // Headline
          {
            type: 'h1',
            props: {
              style: {
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0 0 30px 0',
                textAlign: 'center',
                lineHeight: 1.2,
              },
              children: params.headline,
            },
          },
          // Message
          {
            type: 'p',
            props: {
              style: {
                fontSize: '28px',
                color: 'rgba(255, 255, 255, 0.95)',
                textAlign: 'center',
                lineHeight: 1.5,
                maxWidth: '800px',
                marginBottom: params.ctaText ? '40px' : '0',
              },
              children: params.message,
            },
          },
          // CTA
          params.ctaText ? {
            type: 'div',
            props: {
              style: {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '16px 40px',
                borderRadius: '30px',
                fontSize: '24px',
                fontWeight: '600',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              },
              children: params.ctaText,
            },
          } : null,
        ].filter(Boolean),
      },
    };
  },
};