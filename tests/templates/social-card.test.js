const fs = require('fs').promises;
const path = require('path');

async function testSocialCard() {
  console.log('Testing social-card template...');
  
  // Use tsx to compile TypeScript
  require('tsx/cjs');
  const generateFromTemplate = require('../../src/tools/generate_from_template').default;
  
  const outputDir = path.join(__dirname, '../output/templates');
  await fs.mkdir(outputDir, { recursive: true });
  
  const testCases = [
    {
      name: 'basic',
      params: {
        title: 'Welcome to My Blog',
        description: 'A place to share ideas and learn together',
        backgroundColor: '#2563eb',
      }
    },
    {
      name: 'long-title',
      params: {
        title: 'This is a Very Long Title That Should Still Look Good in the Social Card Template',
        description: 'Testing how the template handles longer text content',
        backgroundColor: '#dc2626',
      }
    },
    {
      name: 'no-description',
      params: {
        title: 'Title Only Card',
        backgroundColor: '#16a34a',
      }
    },
    {
      name: 'custom-colors',
      params: {
        title: 'Custom Background Color',
        description: 'Testing different color schemes',
        backgroundColor: '#7c3aed',
      }
    }
  ];
  
  for (const testCase of testCases) {
    const outputPath = path.join(outputDir, `social-card-${testCase.name}.png`);
    
    try {
      const result = await generateFromTemplate({
        template: 'social-card',
        params: testCase.params,
        outputPath,
        width: undefined,
        height: undefined,
        googleFonts: undefined,
      });
      
      console.log(`  ✓ social-card (${testCase.name}): ${outputPath}`);
    } catch (error) {
      console.error(`  ✗ social-card (${testCase.name}): ${error.message}`);
      throw error;
    }
  }
  
  return true;
}

if (require.main === module) {
  testSocialCard()
    .then(() => {
      console.log('✅ Social card template tests passed!');
    })
    .catch(error => {
      console.error('❌ Social card template tests failed:', error);
      process.exit(1);
    });
}

module.exports = testSocialCard;