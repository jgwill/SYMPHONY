
// Declarations for Node.js specific globals to satisfy TypeScript compiler
// when full @types/node might not be resolved or available.
declare var require: any;
declare var module: any;
declare var process: { argv: string[]; exit: (code?: number) => void; };

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as natural from 'natural';
import compromise from 'compromise'; // Changed from 'import * as compromise'
import * as sentiment from 'sentiment';

interface SpecLangDocument {
  content: string;
  headings: string[];
  sections: { [key: string]: string };
}

interface AnalysisResult {
  structuralIssues: string[];
  clarityIssues: string[];
  completenessIssues: string[];
}

class SpecValidator {
  private document: SpecLangDocument;

  constructor(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    this.document = this.parseDocument(content);
  }

  private parseDocument(content: string): SpecLangDocument {
    const lines = content.split('\n');
    const headings: string[] = [];
    const sections: { [key: string]: string } = {};
    let currentSection = '';

    lines.forEach(line => {
      const headingMatch = line.match(/^(#+)\s+(.*)/);
      if (headingMatch) {
        const heading = headingMatch[2];
        headings.push(heading);
        currentSection = heading;
        sections[currentSection] = '';
      } else if (currentSection) {
        sections[currentSection] += line + '\n';
      }
    });

    return { content, headings, sections };
  }

  public analyze(): AnalysisResult {
    const structuralIssues = this.checkStructure();
    const clarityIssues = this.checkClarity();
    const completenessIssues = this.checkCompleteness();

    return { structuralIssues, clarityIssues, completenessIssues };
  }

  private checkStructure(): string[] {
    const issues: string[] = [];
    const requiredHeadings = ['Overview', 'Current Behavior', 'Proposed Solution', 'Clarifying Questions'];

    requiredHeadings.forEach(heading => {
      if (!this.document.headings.includes(heading)) {
        issues.push(`Missing required section: ${heading}`);
      }
    });

    return issues;
  }

  private checkClarity(): string[] {
    const issues: string[] = [];
    const nlp = compromise(this.document.content); // Now correctly calling the imported function
    const sentimentAnalyzer = new sentiment();

    nlp.sentences().forEach(sentence => {
      const text = sentence.text();
      const sentimentResult = sentimentAnalyzer.analyze(text);

      if (sentimentResult.comparative > 0.5) {
        issues.push(`Potentially subjective language: "${text}"`);
      }

      if (text.split(' ').length > 20) {
        issues.push(`Long sentence: "${text}"`);
      }
    });

    return issues;
  }

  private checkCompleteness(): string[] {
    const issues: string[] = [];
    const requiredSections = ['Overview', 'Current Behavior', 'Proposed Solution', 'Clarifying Questions'];

    requiredSections.forEach(section => {
      if (!this.document.sections[section] || this.document.sections[section].trim() === '') {
        issues.push(`Incomplete section: ${section}`);
      }
    });

    return issues;
  }
}

// This part runs if the script is executed directly
if (require.main === module) {
    const nodeProcess = process; // Removed 'as NodeJS.Process'
    const filePath = nodeProcess.argv[2];
    if (!filePath) {
    console.error('Please provide a file path to a SpecLang document.');
    nodeProcess.exit(1);
    }

    const validator = new SpecValidator(filePath);
    const result = validator.analyze();

    console.log('Structural Issues:');
    result.structuralIssues.forEach(issue => console.log(`- ${issue}`));

    console.log('\nClarity Issues:');
    result.clarityIssues.forEach(issue => console.log(`- ${issue}`));

    console.log('\nCompleteness Issues:');
    result.completenessIssues.forEach(issue => console.log(`- ${issue}`));
}

// Export class for potential programmatic use (e.g. in tests)
export { SpecValidator };