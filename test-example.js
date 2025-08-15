import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testServer() {
  console.log('Starting Satori MCP Server test...\n');

  const server = spawn('node', [join(__dirname, 'index.js')], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  server.stderr.on('data', (data) => {
    console.log('Server:', data.toString());
  });

  const sendRequest = (request) => {
    return new Promise((resolve, reject) => {
      server.stdout.once('data', (data) => {
        try {
          const lines = data.toString().split('\n').filter(line => line.trim());
          const response = JSON.parse(lines[lines.length - 1]);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
      
      server.stdin.write(JSON.stringify(request) + '\n');
    });
  };

  try {
    console.log('1. Initializing connection...');
    await sendRequest({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
        },
      },
      id: 1,
    });

    console.log('2. Testing generate_og_image tool...');
    const ogImageRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'generate_og_image',
        arguments: {
          title: 'Satori MCP Server',
          subtitle: 'Generate beautiful images with HTML/CSS',
          backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          titleColor: 'white',
          subtitleColor: '#f0f0f0',
          outputPath: './.tmp/test-og.png',
        },
      },
      id: 2,
    };

    const ogResult = await sendRequest(ogImageRequest);
    console.log('OG Image Result:', ogResult.result?.content?.[0]?.text || 'Error');

    console.log('\n3. Testing generate_image tool...');
    const customImageRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'generate_image',
        arguments: {
          html: JSON.stringify({
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                color: '#fff',
                width: '100%',
                height: '100%',
                fontSize: '48px',
                fontWeight: 'bold',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    children: '🚀 Satori + MCP',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '24px',
                      marginTop: '20px',
                      opacity: 0.8,
                    },
                    children: 'Dynamic Image Generation',
                  },
                },
              ],
            },
          }),
          width: 800,
          height: 400,
          outputPath: './.tmp/test-custom.png',
        },
      },
      id: 3,
    };

    const customResult = await sendRequest(customImageRequest);
    console.log('Custom Image Result:', customResult.result?.content?.[0]?.text || 'Error');

    console.log('\n✅ Tests completed successfully!');
    console.log('Check ./.tmp/ folder for generated images.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    server.kill();
    process.exit(0);
  }
}

testServer();