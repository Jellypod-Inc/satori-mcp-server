import runTemplateTests from './test-generate-image-from-template';
import runGenerateImageTests from './test-generate-image';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: any;
}

async function runAllTests(): Promise<void> {
  console.log('🚀 Starting Satori MCP Server Test Suite\n');
  console.log('=' .repeat(60));
  
  const results: TestResult[] = [];
  const startTime = Date.now();

  // Test 1: Generate Image from Template
  console.log('\n📝 Running generate_image_from_template tests...');
  const templateStartTime = Date.now();
  try {
    const templateTestsPassed = await runTemplateTests();
    results.push({
      name: 'generate_image_from_template',
      passed: templateTestsPassed,
      duration: Date.now() - templateStartTime
    });
  } catch (error) {
    results.push({
      name: 'generate_image_from_template',
      passed: false,
      duration: Date.now() - templateStartTime,
      error
    });
  }

  // Test 2: Generate Image
  console.log('\n🎨 Running generate_image tests...');
  const imageStartTime = Date.now();
  try {
    const imageTestsPassed = await runGenerateImageTests();
    results.push({
      name: 'generate_image',
      passed: imageTestsPassed,
      duration: Date.now() - imageStartTime
    });
  } catch (error) {
    results.push({
      name: 'generate_image',
      passed: false,
      duration: Date.now() - imageStartTime,
      error
    });
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY\n');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const totalDuration = Date.now() - startTime;

  // Display results table
  console.log('Test Results:');
  console.log('-'.repeat(60));
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = `${(result.duration / 1000).toFixed(2)}s`;
    console.log(`  ${status} | ${result.name.padEnd(30)} | ${duration}`);
    if (result.error) {
      console.log(`         Error: ${result.error.message || result.error}`);
    }
  });
  console.log('-'.repeat(60));

  // Overall summary
  console.log(`\nTotal: ${totalTests} test suites`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Duration: ${(totalDuration / 1000).toFixed(2)}s`);

  // Exit with appropriate code
  if (failedTests > 0) {
    console.log('\n❌ TEST SUITE FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED!');
    process.exit(0);
  }
}

// Run specific test if provided as argument
async function main() {
  const testName = process.argv[2];
  
  if (testName) {
    console.log(`Running specific test: ${testName}\n`);
    
    switch(testName) {
      case 'template':
      case 'generate-image-from-template': {
        const templatePassed = await runTemplateTests();
        process.exit(templatePassed ? 0 : 1);
      }
      
      case 'image':
      case 'generate-image': {
        const imagePassed = await runGenerateImageTests();
        process.exit(imagePassed ? 0 : 1);
      }
      
      default:
        console.error(`Unknown test: ${testName}`);
        console.log('Available tests:');
        console.log('  - template (or generate-image-from-template)');
        console.log('  - image (or generate-image)');
        process.exit(1);
    }
  } else {
    // Run all tests
    await runAllTests();
  }
}

// Execute main function
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner crashed:', error);
    process.exit(1);
  });
}