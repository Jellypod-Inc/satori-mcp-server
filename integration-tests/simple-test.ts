#!/usr/bin/env tsx

/**
 * Simple test for Satori MCP Server
 * Just verifies the server works and generates images
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const TMP_DIR = '.tmp';
const SERVER_URL = 'http://localhost:3000/mcp';

// Colors for output
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const gray = (text: string) => `\x1b[90m${text}\x1b[0m`;

async function sendRequest(method: string, params: any = {}) {
  const request = {
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now(),
  };

  const response = await fetch(SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
    body: JSON.stringify(request),
  });

  const text = await response.text();
  
  // Parse SSE format - look for data: lines
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const jsonStr = line.slice(6);
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        // Continue to next line
      }
    }
  }
  
  return JSON.parse(text);
}

async function runTests() {
  console.log('🧪 Satori MCP Server Tests\n');
  
  // Ensure .tmp directory exists
  await fs.mkdir(TMP_DIR, { recursive: true });
  
  // Start server
  console.log(gray('Starting server...'));
  const serverProcess = spawn('npm', ['start'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  });
  
  // Log server errors (but suppress EADDRINUSE which happens if server already running)
  serverProcess.stderr.on('data', (data: Buffer) => {
    const error = data.toString();
    if (!error.includes('EADDRINUSE')) {
      console.error(red(`Server error: ${error}`));
    }
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // Check server health
    const healthResponse = await fetch('http://localhost:3000/health');
    if (!healthResponse.ok) {
      throw new Error('Server health check failed');
    }
    console.log(green('✓ Server is running\n'));
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: List tools
    console.log('Test: List tools');
    try {
      const response = await sendRequest('tools/list');
      if (response.result?.tools?.length > 0) {
        console.log(green('  ✓ Tools listed successfully'));
        passed++;
      } else {
        throw new Error('No tools found');
      }
    } catch (error) {
      console.log(red(`  ✗ Failed: ${error}`));
      failed++;
    }
    
    // Test 2: List templates
    console.log('\nTest: List templates');
    try {
      const response = await sendRequest('tools/call', {
        name: 'list_templates',
        arguments: {},
      });
      const content = JSON.parse(response.result.content[0].text);
      if (content.templates?.length > 0) {
        console.log(green('  ✓ Templates listed successfully'));
        console.log(gray(`    Found ${content.templates.length} templates`));
        passed++;
      } else {
        throw new Error('No templates found');
      }
    } catch (error) {
      console.log(red(`  ✗ Failed: ${error}`));
      failed++;
    }
    
    // Test 3: Generate basic image
    console.log('\nTest: Generate basic image');
    try {
      const outputPath = path.join(TMP_DIR, 'test-basic.png');
      const response = await sendRequest('tools/call', {
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
                backgroundColor: '#3498db',
                fontSize: '48px',
                color: 'white',
              },
              children: 'Test Image',
            },
          }),
          width: 600,
          height: 400,
          outputPath,
        },
      });
      
      if (response.result?.content?.[0]?.text?.includes('saved to:')) {
        const stats = await fs.stat(outputPath);
        if (stats.isFile() && stats.size > 0) {
          console.log(green('  ✓ Image generated successfully'));
          console.log(gray(`    Output: ${outputPath}`));
          passed++;
        } else {
          throw new Error('Image file not created properly');
        }
      } else {
        throw new Error(response.result?.content?.[0]?.text || 'Unknown error');
      }
    } catch (error) {
      console.log(red(`  ✗ Failed: ${error}`));
      failed++;
    }
    
    // Test 4: Generate from template
    console.log('\nTest: Generate from template');
    try {
      const outputPath = path.join(TMP_DIR, 'test-template.png');
      const response = await sendRequest('tools/call', {
        name: 'generate_image_from_template',
        arguments: {
          template: 'social-card',
          params: {
            title: 'Test Card',
            subtitle: 'This is a test',
            logo: '🚀',
          },
          outputPath,
        },
      });
      
      if (response.result?.content?.[0]?.text?.includes('saved to:')) {
        const stats = await fs.stat(outputPath);
        if (stats.isFile() && stats.size > 0) {
          console.log(green('  ✓ Template image generated successfully'));
          console.log(gray(`    Output: ${outputPath}`));
          passed++;
        } else {
          throw new Error('Template image file not created properly');
        }
      } else {
        throw new Error(response.result?.content?.[0]?.text || 'Unknown error');
      }
    } catch (error) {
      console.log(red(`  ✗ Failed: ${error}`));
      failed++;
    }
    
    // Test 5: Test all templates
    console.log('\nTest: Generate all templates');
    const templates = ['blog-post', 'social-card', 'product-showcase', 'quote', 'announcement'];
    for (const template of templates) {
      try {
        const outputPath = path.join(TMP_DIR, `test-${template}.png`);
        const params: any = {
          title: `Test ${template}`,
        };
        
        // Add template-specific required params
        if (template === 'blog-post') {
          params.content = 'Test content for blog post';
        } else if (template === 'product-showcase') {
          params.price = '$99.99';
        } else if (template === 'quote') {
          params.quote = 'This is a test quote';
        } else if (template === 'announcement') {
          params.message = 'Test announcement message';
        }
        
        const response = await sendRequest('tools/call', {
          name: 'generate_image_from_template',
          arguments: {
            template,
            params,
            outputPath,
          },
        });
        
        if (response.result?.content?.[0]?.text?.includes('saved to:')) {
          console.log(green(`  ✓ ${template} generated`));
          passed++;
        } else {
          throw new Error(response.result?.content?.[0]?.text || 'Failed');
        }
      } catch (error) {
        console.log(red(`  ✗ ${template} failed: ${error}`));
        failed++;
      }
    }
    
    // Results
    console.log('\n' + '='.repeat(50));
    console.log(`Results: ${green(`${passed} passed`)}, ${failed > 0 ? red(`${failed} failed`) : '0 failed'}`);
    console.log('='.repeat(50));
    
    if (failed > 0) {
      process.exit(1);
    }
    
  } finally {
    // Kill server
    serverProcess.kill();
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Run tests
runTests().catch(error => {
  console.error(red('Test failed:'), error);
  process.exit(1);
});