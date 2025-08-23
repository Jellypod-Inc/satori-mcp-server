#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Import all test modules
const testSocialCard = require('./templates/social-card.test');
const testBlogHeader = require('./templates/blog-header.test');
const testQuote = require('./templates/quote.test');

async function runAllTests() {
  console.log('🧪 Running all template tests...\n');
  
  let allPassed = true;
  const results = [];
  
  // Clean up old test output
  const outputDir = path.join(__dirname, 'output');
  try {
    await fs.rm(outputDir, { recursive: true, force: true });
  } catch (error) {
    // Directory might not exist, that's ok
  }
  
  // Test each template
  const tests = [
    { name: 'Social Card', fn: testSocialCard },
    { name: 'Blog Header', fn: testBlogHeader },
    { name: 'Quote', fn: testQuote },
  ];
  
  for (const test of tests) {
    console.log(`\n📝 ${test.name} Template`);
    console.log('─'.repeat(40));
    
    try {
      await test.fn();
      results.push({ name: test.name, status: 'PASSED' });
    } catch (error) {
      results.push({ name: test.name, status: 'FAILED', error: error.message });
      allPassed = false;
    }
  }
  
  // Test the tools directly
  console.log('\n🔧 Tool Tests');
  console.log('─'.repeat(40));
  
  try {
    require('tsx/cjs');
    
    // Test list_templates
    console.log('Testing list_templates tool...');
    const listTemplates = require('../src/tools/list_templates').default;
    const result = listTemplates();
    const templates = JSON.parse(result.content[0].text);
    console.log(`  ✓ Found ${templates.templates.length} templates: ${templates.templates.map(t => t.name).join(', ')}`);
    
    // Test generate_image
    console.log('Testing generate_image tool...');
    const generateImage = require('../src/tools/generate_image').default;
    const toolOutputDir = path.join(__dirname, 'output/tools');
    await fs.mkdir(toolOutputDir, { recursive: true });
    
    const imageResult = await generateImage({
      jsx: '<div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", backgroundColor: "#3b82f6", color: "white", fontFamily: "Inter"}}><h1 style={{fontSize: "48px", fontWeight: "bold"}}>Test Image</h1></div>',
      width: 800,
      height: 600,
      outputPath: path.join(toolOutputDir, 'test-image.png'),
    });
    console.log(`  ✓ Generated test image`);
    
    results.push({ name: 'Tools', status: 'PASSED' });
  } catch (error) {
    results.push({ name: 'Tools', status: 'FAILED', error: error.message });
    allPassed = false;
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  for (const result of results) {
    const icon = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  console.log('─'.repeat(50));
  const passedCount = results.filter(r => r.status === 'PASSED').length;
  const totalCount = results.length;
  console.log(`Total: ${passedCount}/${totalCount} passed`);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed successfully!');
    console.log(`📁 Test images saved in: ${path.resolve(outputDir)}`);
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = runAllTests;