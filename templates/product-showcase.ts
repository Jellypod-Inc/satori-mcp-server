export interface ProductShowcaseTemplateParams {
  productName: string;
  price: string;
  description?: string;
  features?: string[];
  badge?: string;
  backgroundColor?: string;
}

export const productShowcaseTemplate = {
  name: 'product-showcase',
  description: 'Product showcase template with features and pricing',
  parameters: {
    productName: { type: 'string', required: true, description: 'Product name' },
    price: { type: 'string', required: true, description: 'Product price (e.g., "$99.99")' },
    description: { type: 'string', required: false, description: 'Product description' },
    features: { type: 'array', required: false, description: 'List of product features' },
    badge: { type: 'string', required: false, description: 'Badge text (e.g., "NEW", "SALE")' },
    backgroundColor: { type: 'string', required: false, description: 'Background color', default: '#f8f9fa' },
  },
  defaultSize: { width: 1200, height: 630 },
  googleFonts: [
    { name: 'Inter', weight: 400, style: 'normal' as const },
    { name: 'Inter', weight: 600, style: 'normal' as const },
    { name: 'Inter', weight: 700, style: 'normal' as const },
  ],
  generate: (params: ProductShowcaseTemplateParams) => ({
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: params.backgroundColor || '#f8f9fa',
        padding: '60px',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
      },
      children: [
        // Badge
        params.badge ? {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '40px',
              right: '40px',
              backgroundColor: '#ff4757',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: 'bold',
            },
            children: params.badge,
          },
        } : null,
        // Product Name
        {
          type: 'h1',
          props: {
            style: {
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#2c3e50',
              margin: '0 0 20px 0',
            },
            children: params.productName,
          },
        },
        // Price
        {
          type: 'div',
          props: {
            style: {
              fontSize: '48px',
              fontWeight: '600',
              color: '#27ae60',
              marginBottom: '30px',
            },
            children: params.price,
          },
        },
        // Description
        params.description ? {
          type: 'p',
          props: {
            style: {
              fontSize: '24px',
              color: '#7f8c8d',
              lineHeight: 1.5,
              marginBottom: '40px',
            },
            children: params.description,
          },
        } : null,
        // Features
        params.features && params.features.length > 0 ? {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            },
            children: params.features.map(feature => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '20px',
                  color: '#34495e',
                },
                children: [
                  {
                    type: 'span',
                    props: {
                      style: {
                        marginRight: '12px',
                        color: '#27ae60',
                        fontSize: '24px',
                      },
                      children: '✓',
                    },
                  },
                  feature,
                ],
              },
            })),
          },
        } : null,
      ].filter(Boolean),
    },
  }),
};