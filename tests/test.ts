import * as fs from 'fs/promises';
import * as path from 'path';
import { testConfig } from './test-config';
import generateFromTemplate from '../src/tools/generate_from_template';

async function runTemplateTests(template?: string): Promise<boolean> {
  const outputDir = path.join(__dirname, 'output/templates');
  await fs.mkdir(outputDir, { recursive: true });
  
  const templatesToTest = template 
    ? { [template]: testConfig.templates[template] }
    : testConfig.templates;
  
  if (template && !testConfig.templates[template]) {
    console.error(`Template "${template}" not found in test config`);
    return false;
  }
  
  let allPassed = true;
  
  for (const [templateName, testCases] of Object.entries(templatesToTest)) {
    console.log(`\nTesting ${templateName} template...`);
    
    const results = await Promise.all(
      testCases.map(async (testCase) => {
        const outputPath = path.join(outputDir, `${templateName}-${testCase.name}.png`);
        
        try {
          await generateFromTemplate({
            template: templateName,
            params: testCase.params,
            outputPath,
            width: undefined,
            height: undefined,
            googleFonts: undefined,
          });
          
          console.log(`  ✓ ${templateName} (${testCase.name}): ${outputPath}`);
          return { success: true, testCase: testCase.name };
        } catch (error) {
          console.error(`  ✗ ${templateName} (${testCase.name}):`, error instanceof Error ? error.message : error);
          return { success: false, testCase: testCase.name, error };
        }
      })
    );
    
    if (results.some(r => !r.success)) {
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Main execution
if (require.main === module) {
  const template = process.argv[2];
  
  runTemplateTests(template)
    .then(allPassed => {
      if (allPassed) {
        console.log(`\n✅ ${template ? template + ' template' : 'All template'} tests passed!`);
      } else {
        console.log(`\n❌ Some tests failed`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

export default runTemplateTests;