import generateImage from '../src/tools/generate_image';

async function runGenerateImageTests(): Promise<boolean> {
  const testCases = [
    {
      name: 'simple-div',
      jsx: '<div style="color: red; font-size: 24px;">Hello World</div>',
      description: 'Basic div with inline styles'
    },
    {
      name: 'nested-elements-flex',
      jsx: '<div style="display: flex; flex-direction: column; padding: 20px;"><h1 style="color: blue;">Title</h1><p>Paragraph text</p></div>',
      description: 'Nested HTML elements with flex display'
    },
    {
      name: 'json-format',
      jsx: JSON.stringify({
        type: 'div',
        props: { style: { backgroundColor: '#f0f0f0', padding: '10px', display: 'flex' } },
        children: 'JSON Format Test'
      }),
      description: 'Backward compatible JSON format'
    },
    {
      name: 'complex-layout',
      jsx: `<div style="display: flex; flex-direction: column; align-items: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h1 style="color: white; font-size: 48px; margin: 0;">Welcome</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin-top: 10px;">Testing complex layouts with gradients</p>
      </div>`,
      description: 'Complex layout with gradients and flexbox'
    },
    {
      name: 'single-element',
      jsx: '<h1 style="color: #333; font-size: 36px;">Single Heading Element</h1>',
      description: 'Single heading element'
    },
    {
      name: 'card-layout',
      jsx: `<div style="display: flex; flex-direction: column; width: 600px; height: 400px; background: white; padding: 40px;">
        <h2 style="color: #1a1a1a; font-size: 32px; margin: 0;">Card Title</h2>
        <p style="color: #666; font-size: 16px; margin-top: 16px;">This is a card description with some text content.</p>
      </div>`,
      description: 'Card layout with title and description'
    }
  ];

  console.log('\nTesting generate_image tool...');
  let allPassed = true;

  for (const testCase of testCases) {
    try {
      console.log(`\n  Testing: ${testCase.name}`);
      console.log(`    Description: ${testCase.description}`);

      const result = await generateImage({
        jsx: testCase.jsx,
        width: 600,
        height: 400,
        fonts: [{ name: "Inter", weight: 400, style: "normal" as const }]
      });

      // Check that we got a valid response
      if (!result || !result.content || !Array.isArray(result.content)) {
        throw new Error('Invalid response structure');
      }

      const imageContent = result.content.find(c => c.type === 'text');
      if (!imageContent || !imageContent.text) {
        throw new Error('No image content in response');
      }

      // Check what type of response we got
      const responseText = imageContent.text;

      // Extract URL from response if it contains "Image saved to:"
      let imageUrl = responseText;
      if (responseText.includes('Image saved to:')) {
        imageUrl = responseText.replace('Image saved to: ', '').trim();
      }

      // Verify it's a valid URL
      if (imageUrl.startsWith('https://')) {
        console.log(`    ✓ Success: Generated image at ${imageUrl}`);
      } else {
        throw new Error(`Invalid image URL: ${imageUrl}`);
      }
    } catch (error) {
      console.error(`    ✗ Failed:`, error instanceof Error ? error.message : error);
      allPassed = false;
    }
  }

  return allPassed;
}

// Main execution
if (require.main === module) {
  runGenerateImageTests()
    .then(allPassed => {
      if (allPassed) {
        console.log('\n✅ All generate_image tests passed!');
      } else {
        console.log('\n❌ Some generate_image tests failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

export default runGenerateImageTests;