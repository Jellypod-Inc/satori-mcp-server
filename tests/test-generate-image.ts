import generateImage from '../src/tools/generate_image';

async function runGenerateImageTests(): Promise<boolean> {
  const testCases = [
    {
      name: 'simple-div',
      html: '<div style="color: red; font-size: 24px;">Hello World</div>',
      description: 'Basic div with inline styles'
    },
    {
      name: 'nested-elements-flex',
      html: '<div style="display: flex; flex-direction: column; padding: 20px;"><h1 style="color: blue;">Title</h1><p>Paragraph text</p></div>',
      description: 'Nested HTML elements with flex display'
    },
    {
      name: 'complex-layout',
      html: `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-family: Roboto; padding: 80px;">
        <h1 style="font-size: 96px; font-weight: 900; margin-bottom: 40px; text-align: center; line-height: 1.1; text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">title</h1>
        <div style="display: flex; gap: 20px; font-size: 28px; font-weight: 400; opacity: 0.9;">
          <span>author</span>
          <span>•</span>
          <span>date</span>
        </div>
      </div>`,
      description: 'Complex layout with gradients and flexbox'
    },
    {
      name: 'single-element',
      html: `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: #1a1a1a; color: #ffffff; font-family: Inter; padding: 60px;">
        <h1 style="font-size: 72px; font-weight: 700; margin-bottom: 30px; text-align: center; line-height: 1.2;">title</h1>
        <p style="font-size: 32px; font-weight: 400; text-align: center; opacity: 0.8; line-height: 1.4;">description</p>
      </div>`,
      description: 'Single heading element'
    },
    {
      name: 'card-layout',
      html: `<div style="display: flex; flex-direction: column; width: 600px; height: 400px; background: white; padding: 40px;">
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
        html: testCase.html,
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