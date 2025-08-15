import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testGoogleFonts() {
  console.log('Starting Google Fonts test...\n');

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

    console.log('2. Testing with Playfair Display font...');
    const playfairRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'generate_og_image',
        arguments: {
          title: 'Beautiful Typography',
          subtitle: 'Using Google Fonts with Satori',
          backgroundColor: '#1e293b',
          titleColor: '#f1f5f9',
          subtitleColor: '#cbd5e1',
          outputPath: './.tmp/google-fonts-playfair.png',
          googleFonts: [
            { name: 'Playfair Display', weight: 700 },
            { name: 'Inter', weight: 400 }
          ],
        },
      },
      id: 2,
    };

    const playfairResult = await sendRequest(playfairRequest);
    console.log('Result:', playfairResult.result?.content?.[0]?.text || 'Error');

    console.log('\n3. Testing with multiple Google Fonts...');
    const multiRequest = {
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
                backgroundColor: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                width: '100%',
                height: '100%',
                padding: '40px',
              },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontFamily: 'Bebas Neue',
                      fontSize: '72px',
                      margin: 0,
                      color: '#2d3748',
                    },
                    children: 'GOOGLE FONTS',
                  },
                },
                {
                  type: 'p',
                  props: {
                    style: {
                      fontFamily: 'Roboto',
                      fontSize: '24px',
                      marginTop: '20px',
                      color: '#4a5568',
                    },
                    children: 'Dynamic font loading from Google Fonts',
                  },
                },
                {
                  type: 'p',
                  props: {
                    style: {
                      fontFamily: 'Dancing Script',
                      fontSize: '32px',
                      marginTop: '30px',
                      color: '#5a67d8',
                    },
                    children: 'Beautiful handwriting style',
                  },
                },
              ],
            },
          }),
          width: 1000,
          height: 600,
          outputPath: './.tmp/google-fonts-multi.png',
          googleFonts: [
            { name: 'Bebas Neue', weight: 400 },
            { name: 'Roboto', weight: 400 },
            { name: 'Dancing Script', weight: 700 },
          ],
        },
      },
      id: 3,
    };

    const multiResult = await sendRequest(multiRequest);
    console.log('Result:', multiResult.result?.content?.[0]?.text || 'Error');

    console.log('\n✅ Google Fonts tests completed!');
    console.log('Check ./.tmp/ folder for generated images.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    server.kill();
    process.exit(0);
  }
}

testGoogleFonts();