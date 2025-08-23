const fs = require('fs').promises;
const path = require('path');

async function testQuote() {
  console.log('Testing quote template...');
  
  // Use tsx to compile TypeScript
  require('tsx/cjs');
  const generateFromTemplate = require('../../src/tools/generate_from_template').default;
  
  const outputDir = path.join(__dirname, '../output/templates');
  await fs.mkdir(outputDir, { recursive: true });
  
  const testCases = [
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
        quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts. Every challenge we face is an opportunity to grow stronger and wiser.',
        author: 'Winston Churchill',
      }
    },
    {
      name: 'no-author',
      params: {
        quote: 'Actions speak louder than words.',
      }
    },
    {
      name: 'custom-background',
      params: {
        quote: 'Be yourself; everyone else is already taken.',
        author: 'Oscar Wilde',
        backgroundColor: '#ef4444',
      }
    },
    {
      name: 'very-short',
      params: {
        quote: 'Less is more.',
        author: 'Ludwig Mies van der Rohe',
      }
    }
  ];
  
  for (const testCase of testCases) {
    const outputPath = path.join(outputDir, `quote-${testCase.name}.png`);
    
    try {
      const result = await generateFromTemplate({
        template: 'quote',
        params: testCase.params,
        outputPath,
        width: undefined,
        height: undefined,
        googleFonts: undefined,
      });
      
      console.log(`  ✓ quote (${testCase.name}): ${outputPath}`);
    } catch (error) {
      console.error(`  ✗ quote (${testCase.name}): ${error.message}`);
      throw error;
    }
  }
  
  return true;
}

if (require.main === module) {
  testQuote()
    .then(() => {
      console.log('✅ Quote template tests passed!');
    })
    .catch(error => {
      console.error('❌ Quote template tests failed:', error);
      process.exit(1);
    });
}

module.exports = testQuote;