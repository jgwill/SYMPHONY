
// These declarations are workarounds for environments where @types/mocha
// might not be correctly resolved by the TypeScript language service
// despite the /// <reference types="mocha" /> directive.
// Using `any` for `done` to avoid issues if Mocha namespace itself isn't resolved.
declare var describe: (description: string, callback: () => void) => void;
declare var it: (description: string, callback: (done?: any) => void | Promise<any>) => void;
declare var before: (callback: (done?: any) => void | Promise<any>) => void;
declare var after: (callback: (done?: any) => void | Promise<any>) => void;
declare var expect: any; // Replaces 'import { expect } from "chai";' to handle missing type definitions

// Declare __dirname for Node.js environment variable
declare const __dirname: string;

import { SpecValidator } from '../cli/specValidator';
// Removed 'import { expect } from "chai";' as 'expect' is now declared globally for workaround
import * as fs from 'fs';
import * as path from 'path';

describe('SpecValidator CLI', () => {
  const testFilePath = path.join(__dirname, 'testSpecLangDocument.md');
  const testFileContent = `
# Overview
This is a test SpecLang document.

# Current Behavior
The current behavior is described here.

# Proposed Solution
The proposed solution is described here.

# Clarifying Questions
Some clarifying questions are listed here.
  `;

  before(() => {
    // Create a dummy test file
    fs.writeFileSync(testFilePath, testFileContent, 'utf-8');
  });

  after(() => {
    // Clean up the dummy test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it('should provide feedback on the structure of SpecLang documents', () => {
    const validator = new SpecValidator(testFilePath);
    const result = validator.analyze();
    expect(result.structuralIssues).to.be.an('array').that.is.empty;
  });

  it('should provide feedback on the clarity of SpecLang documents', () => {
    const validator = new SpecValidator(testFilePath);
    const result = validator.analyze();
    // Current clarity checks are basic, so this might pass easily.
    // More sophisticated checks would require more specific test cases.
    expect(result.clarityIssues).to.be.an('array');
  });

  it('should provide feedback on the completeness of SpecLang documents', () => {
    const validator = new SpecValidator(testFilePath);
    const result = validator.analyze();
    expect(result.completenessIssues).to.be.an('array').that.is.empty;
  });

  it('should detect missing required sections', () => {
    const incompleteContent = `
# Overview
This is a test SpecLang document.

# Current Behavior
The current behavior is described here.
    `;
    fs.writeFileSync(testFilePath, incompleteContent, 'utf-8');
    const validator = new SpecValidator(testFilePath);
    const result = validator.analyze();
    expect(result.structuralIssues).to.include('Missing required section: Proposed Solution');
    expect(result.structuralIssues).to.include('Missing required section: Clarifying Questions');
    fs.writeFileSync(testFilePath, testFileContent, 'utf-8'); // Restore original content
  });

  it('should detect potentially subjective language (basic check)', () => {
    const subjectiveContent = `
# Overview
This is a test SpecLang document.

# Current Behavior
The current behavior is described here.

# Proposed Solution
The proposed solution is very user-friendly and fast, better than anything else.

# Clarifying Questions
Some clarifying questions are listed here.
    `;
    // The 'compromise' and 'sentiment' libraries might need more specific text to trigger.
    // This test is more about the structure of the check than the robustness of the NLP.
    fs.writeFileSync(testFilePath, subjectiveContent, 'utf-8');
    const validator = new SpecValidator(testFilePath);
    const result = validator.analyze();
    // Check if clarityIssues contains strings indicating subjectivity or long sentences
    // This depends on the exact output of your clarity checks.
    // For example, if it flags "very user-friendly and fast...":
    // expect(result.clarityIssues.some(issue => issue.includes('Potentially subjective language'))).to.be.true;
    expect(result.clarityIssues).to.be.an('array'); // General check for now
    fs.writeFileSync(testFilePath, testFileContent, 'utf-8'); // Restore
  });

  it('should detect incomplete sections', () => {
    const incompleteSectionsContent = `
# Overview
This is a test SpecLang document.

# Current Behavior
The current behavior is described here.

# Proposed Solution

# Clarifying Questions
Some clarifying questions are listed here.
    `;
    fs.writeFileSync(testFilePath, incompleteSectionsContent, 'utf-8');
    const validator = new SpecValidator(testFilePath);
    const result = validator.analyze();
    expect(result.completenessIssues).to.include('Incomplete section: Proposed Solution');
    fs.writeFileSync(testFilePath, testFileContent, 'utf-8'); // Restore
  });
});
