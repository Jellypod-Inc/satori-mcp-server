const fs = require('fs').promises;
const path = require('path');

async function testBlogHeader() {
  console.log('Testing blog-header template...');
  
  // Use tsx to compile TypeScript
  require('tsx/cjs');
  const generateFromTemplate = require('../../src/tools/generate_from_template').default;
  
  const outputDir = path.join(__dirname, '../output/templates');
  await fs.mkdir(outputDir, { recursive: true });
  
  const testCases = [
    {
      name: 'basic',
      params: {
        title: 'Getting Started with TypeScript',
        author: 'Jane Smith',
        date: '2024-01-15',
        category: 'Programming',
      }
    },
    {
      name: 'long-title',
      params: {
        title: 'A Comprehensive Guide to Building Scalable Microservices with Node.js and Docker',
        author: 'John Doe',
        date: '2024-03-22',
        category: 'DevOps',
      }
    },
    {
      name: 'minimal',
      params: {
        title: 'Quick Tips for Clean Code',
        author: 'Alex Johnson',
        date: '2024-02-10',
      }
    },
    {
      name: 'different-category',
      params: {
        title: 'Machine Learning Fundamentals',
        author: 'Dr. Sarah Lee',
        date: '2024-04-05',
        category: 'AI/ML',
      }
    }
  ];
  
  for (const testCase of testCases) {
    const outputPath = path.join(outputDir, `blog-header-${testCase.name}.png`);
    
    try {
      const result = await generateFromTemplate({
        template: 'blog-header',
        params: testCase.params,
        outputPath,
        width: undefined,
        height: undefined,
        googleFonts: undefined,
      });
      
      console.log(`  ✓ blog-header (${testCase.name}): ${outputPath}`);
    } catch (error) {
      console.error(`  ✗ blog-header (${testCase.name}): ${error.message}`);
      throw error;
    }
  }
  
  return true;
}

if (require.main === module) {
  testBlogHeader()
    .then(() => {
      console.log('✅ Blog header template tests passed!');
    })
    .catch(error => {
      console.error('❌ Blog header template tests failed:', error);
      process.exit(1);
    });
}

module.exports = testBlogHeader;