#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function runTest() {
  console.log('🧪 Running simple test...\n');

  try {
    // Use tsx to compile TypeScript
    require('tsx/cjs');

    // Test 1: list_templates
    console.log('1️⃣  Testing list_templates...');
    const listTemplates = require('../src/tools/list_templates').default;
    const result = listTemplates();
    const templates = JSON.parse(result.content[0].text);
    console.log(`   ✓ Found ${templates.templates.length} templates:`, templates.templates.map(t => t.name).join(', '));

    // Test 2: generate_image (now using Google Fonts)
    console.log('\n2️⃣  Testing generate_image with Google Fonts...');
    const generateImage = require('../src/tools/generate_image').default;

    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    const imageResult = await generateImage({
      jsx: '<div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", backgroundColor: "#4F46E5", color: "white", fontFamily: "Inter"}}><h1 style={{fontSize: "48px"}}>Google Fonts Test</h1></div>',
      width: 600,
      height: 400,
      outputPath: path.join(outputDir, 'test-google-fonts.png'),
      // Will use default Inter font from Google Fonts
    });
    console.log(`   ✓ ${imageResult.content[0].text}`);

    // Test 3: generate_from_template
    console.log('\n3️⃣  Testing generate_from_template...');
    const generateFromTemplate = require('../src/tools/generate_from_template').default;

    const templateResult = await generateFromTemplate({
      template: 'social-card',
      params: {
        title: 'Test with Google Fonts',
        description: 'This template now uses Google Fonts',
        backgroundColor: '#10B981',
      },
      outputPath: path.join(outputDir, 'test-template.png'),
    });
    console.log(`   ✓ ${templateResult.content[0].text}`);

    console.log('\n✅ All tests passed successfully!');
    console.log(`📁 Test images saved in: ${path.resolve(outputDir)}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();