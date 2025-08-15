#!/usr/bin/env tsx

/**
 * Test script for the Satori MCP Server
 * Tests the generate_image tool with various examples
 */

import fs from 'fs/promises';
import path from 'path';

const SERVER_URL = 'http://localhost:3000/mcp';
const TMP_DIR = '.tmp';

interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: any;
  id: number;
}

interface JsonRpcResponse {
  jsonrpc: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

async function sendRequest(method: string, params: any = {}): Promise<JsonRpcResponse> {
  const request: JsonRpcRequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now(),
  };

  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify(request),
    });

    // Read the response as text (SSE format)
    const text = await response.text();
    
    // Parse SSE format - look for data: lines
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6); // Remove "data: " prefix
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          // Continue to next line if this one doesn't parse
        }
      }
    }
    
    // If no valid JSON found in SSE, try parsing as plain JSON
    return JSON.parse(text);
  } catch (error) {
    console.error('Request failed:', error.message);
    throw error;
  }
}

async function ensureTmpDir(): Promise<void> {
  try {
    await fs.mkdir(TMP_DIR, { recursive: true });
    console.log(`✅ Created/verified ${TMP_DIR} directory\n`);
  } catch (error) {
    console.error(`Failed to create ${TMP_DIR} directory:`, error);
  }
}

async function testListTemplates(): Promise<void> {
  console.log('🧪 Testing list_templates tool...\n');
  
  const result = await sendRequest('tools/call', {
    name: 'list_templates',
    arguments: {},
  });
  
  console.log('Available templates:');
  const templates = JSON.parse(result.result?.content?.[0]?.text || '{}').templates;
  templates.forEach((t: any) => {
    console.log(`  - ${t.name}: ${t.description}`);
  });
  console.log();
}

async function testAllTemplates(): Promise<void> {
  console.log('🧪 Testing all templates...\n');
  
  // Test blog-post template
  console.log('Test: Blog Post Template');
  const blogTest = await sendRequest('tools/call', {
    name: 'generate_image_from_template',
    arguments: {
      template: 'blog-post',
      params: {
        title: 'Getting Started with TypeScript',
        author: 'John Doe',
        date: 'December 15, 2024',
        content: 'TypeScript is a powerful superset of JavaScript that adds static typing and other features to help you write more maintainable code...',
        readTime: '5 min read',
        tags: ['TypeScript', 'JavaScript', 'Programming'],
      },
      outputPath: path.join(TMP_DIR, 'template-blog-post.png'),
    },
  });
  console.log('Result:', blogTest.result?.content?.[0]?.text || blogTest.error);
  console.log();
  
  // Test social-card template
  console.log('Test: Social Card Template');
  const socialTest = await sendRequest('tools/call', {
    name: 'generate_image_from_template',
    arguments: {
      template: 'social-card',
      params: {
        title: 'Satori MCP Server',
        subtitle: 'Generate beautiful images with templates',
        logo: '🎨',
      },
      outputPath: path.join(TMP_DIR, 'template-social-card.png'),
    },
  });
  console.log('Result:', socialTest.result?.content?.[0]?.text || socialTest.error);
  console.log();
  
  // Test product-showcase template
  console.log('Test: Product Showcase Template');
  const productTest = await sendRequest('tools/call', {
    name: 'generate_image_from_template',
    arguments: {
      template: 'product-showcase',
      params: {
        productName: 'Premium Headphones',
        price: '$299.99',
        description: 'Experience crystal-clear audio with noise cancellation',
        features: ['Active Noise Cancellation', '40-hour battery life', 'Premium comfort'],
        badge: 'NEW',
      },
      outputPath: path.join(TMP_DIR, 'template-product-showcase.png'),
    },
  });
  console.log('Result:', productTest.result?.content?.[0]?.text || productTest.error);
  console.log();
  
  // Test quote template
  console.log('Test: Quote Template');
  const quoteTest = await sendRequest('tools/call', {
    name: 'generate_image_from_template',
    arguments: {
      template: 'quote',
      params: {
        quote: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        source: 'Stanford Commencement Speech, 2005',
      },
      outputPath: path.join(TMP_DIR, 'template-quote.png'),
    },
  });
  console.log('Result:', quoteTest.result?.content?.[0]?.text || quoteTest.error);
  console.log();
  
  // Test announcement template
  console.log('Test: Announcement Template');
  const announcementTest = await sendRequest('tools/call', {
    name: 'generate_image_from_template',
    arguments: {
      template: 'announcement',
      params: {
        headline: 'Big Sale Event!',
        message: 'Get 50% off on all products this weekend only',
        ctaText: 'Shop Now',
        date: 'December 2024',
        type: 'success',
      },
      outputPath: path.join(TMP_DIR, 'template-announcement.png'),
    },
  });
  console.log('Result:', announcementTest.result?.content?.[0]?.text || announcementTest.error);
  console.log();
}

async function testGenerateImage(): Promise<void> {
  console.log('🧪 Testing generate_image tool...\n');

  // Test 1: Simple HTML with inline styles
  console.log('Test 1: Simple HTML with inline styles');
  const test1 = await sendRequest('tools/call', {
    name: 'generate_image',
    arguments: {
      html: JSON.stringify({
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px',
          },
          children: [
            {
              type: 'h1',
              props: {
                style: {
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: 0,
                  textAlign: 'center',
                },
                children: 'Hello from Satori!',
              },
            },
            {
              type: 'p',
              props: {
                style: {
                  fontSize: '24px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginTop: '20px',
                  textAlign: 'center',
                },
                children: 'This is a test image generated with the MCP server',
              },
            },
          ],
        },
      }),
      width: 800,
      height: 400,
      outputPath: path.join(TMP_DIR, 'test-output-1.png'),
    },
  });
  console.log('Result:', test1.result?.content?.[0]?.text || test1.error);
  console.log();

  // Test 2: With Google Fonts
  console.log('Test 2: With Google Fonts (Roboto)');
  const test2 = await sendRequest('tools/call', {
    name: 'generate_image',
    arguments: {
      html: JSON.stringify({
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1a1a2e',
            padding: '60px',
          },
          children: {
            type: 'h1',
            props: {
              style: {
                fontSize: '72px',
                fontWeight: 700,
                color: '#eee',
                margin: 0,
                fontFamily: 'Roboto',
              },
              children: 'Custom Font Test',
            },
          },
        },
      }),
      width: 1200,
      height: 630,
      outputPath: path.join(TMP_DIR, 'test-output-2.png'),
      googleFonts: [
        {
          name: 'Roboto',
          weight: 700,
          style: 'normal',
        },
      ],
    },
  });
  console.log('Result:', test2.result?.content?.[0]?.text || test2.error);
  console.log();

  // Test 3: Plain text (should auto-wrap in div)
  console.log('Test 3: Plain text input');
  const test3 = await sendRequest('tools/call', {
    name: 'generate_image',
    arguments: {
      html: 'This is just plain text that should be wrapped automatically',
      width: 600,
      height: 200,
      outputPath: path.join(TMP_DIR, 'test-output-3.png'),
      style: {
        backgroundColor: '#f0f0f0',
        color: '#333',
        fontSize: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      },
    },
  });
  console.log('Result:', test3.result?.content?.[0]?.text || test3.error);
  console.log();

  console.log('✅ All tests completed!');
  console.log('Check the following files in .tmp directory:');
  console.log('  Basic tests:');
  console.log(`    - ${path.join(TMP_DIR, 'test-output-1.png')}`);
  console.log(`    - ${path.join(TMP_DIR, 'test-output-2.png')}`);
  console.log(`    - ${path.join(TMP_DIR, 'test-output-3.png')}`);
  console.log('  Template tests:');
  console.log(`    - ${path.join(TMP_DIR, 'template-blog-post.png')}`);
  console.log(`    - ${path.join(TMP_DIR, 'template-social-card.png')}`);
  console.log(`    - ${path.join(TMP_DIR, 'template-product-showcase.png')}`);
  console.log(`    - ${path.join(TMP_DIR, 'template-quote.png')}`);
  console.log(`    - ${path.join(TMP_DIR, 'template-announcement.png')}`);
}

async function main(): Promise<void> {
  console.log('🚀 Satori MCP Server Test Suite');
  console.log('================================\n');
  console.log('Server URL:', SERVER_URL);
  console.log('Note: Using stateless HTTP (no SSE notifications)\n');

  // Ensure .tmp directory exists
  await ensureTmpDir();

  // Check if server is running
  try {
    const response = await fetch('http://localhost:3000/health');
    const health = await response.json();
    console.log('✅ Server is running:', health);
    console.log();
  } catch (error) {
    console.error('❌ Server is not running! Please start the server with: npm start');
    process.exit(1);
  }

  // Run tests
  try {
    await testListTemplates();
    await testGenerateImage();
    await testAllTemplates();
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test suite
main().catch(console.error);