export interface QuoteTemplateParams {
  quote: string;
  author?: string;
  source?: string;
  backgroundColor?: string;
  textColor?: string;
  quoteMarkColor?: string;
}

export const quoteTemplate = {
  name: 'quote',
  description: 'Beautiful quote template with large quotation marks',
  parameters: {
    quote: { type: 'string', required: true, description: 'The quote text' },
    author: { type: 'string', required: false, description: 'Quote author' },
    source: { type: 'string', required: false, description: 'Source or context of the quote' },
    backgroundColor: { type: 'string', required: false, description: 'Background color', default: '#1a1a2e' },
    textColor: { type: 'string', required: false, description: 'Text color', default: '#ffffff' },
    quoteMarkColor: { type: 'string', required: false, description: 'Quote mark color', default: 'rgba(255, 255, 255, 0.1)' },
  },
  defaultSize: { width: 1200, height: 630 },
  googleFonts: [
    { name: 'Merriweather', weight: 400, style: 'italic' as const },
  ],
  generate: (params: QuoteTemplateParams) => ({
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: params.backgroundColor || '#1a1a2e',
        padding: '80px',
        fontFamily: 'Georgia, serif',
        position: 'relative',
      },
      children: [
        // Large opening quote mark
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '60px',
              left: '60px',
              fontSize: '200px',
              color: params.quoteMarkColor || 'rgba(255, 255, 255, 0.1)',
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
            },
            children: '"',
          },
        },
        // Quote text
        {
          type: 'blockquote',
          props: {
            style: {
              fontSize: '36px',
              fontStyle: 'italic',
              color: params.textColor || '#ffffff',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.6,
              maxWidth: '900px',
              zIndex: 1,
            },
            children: params.quote,
          },
        },
        // Author and source
        (params.author || params.source) ? {
          type: 'div',
          props: {
            style: {
              marginTop: '40px',
              fontSize: '24px',
              color: params.textColor || '#ffffff',
              opacity: 0.8,
              textAlign: 'center',
            },
            children: `${params.author ? `— ${params.author}` : ''}${params.source ? (params.author ? `, ${params.source}` : params.source) : ''}`,
          },
        } : null,
      ].filter(Boolean),
    },
  }),
};