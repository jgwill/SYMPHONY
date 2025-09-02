# Issue #8: NL-to-Spec Core Library

## Overview

The **NL-to-Spec Core Library** is a foundational software library envisioned for the SpecLang ecosystem. Its primary purpose is to provide the core functionality for translating natural language (NL) user requests, feature descriptions, or application ideas into structured, Markdown-based SpecLang documents.

This library encapsulates the complexities of interacting with underlying AI models (like Google's Gemini API), including prompt engineering, response parsing, and initial structuring of the output according to SpecLang principles. It is intended to be used by various tools within the SpecLang ecosystem, such as interactive demo applications, IDE plugins, or more sophisticated agent systems.

## Core Goals

* **Abstract AI Interaction:** Provide a simplified interface for converting NL to SpecLang, hiding the direct complexities of AI model APIs.
* **Standardized Output:** Ensure that the generated SpecLang documents adhere to a consistent and recognizable structure.
* **Facilitate Tooling:** Serve as a reusable component for any application needing NL-to-Spec capabilities.
* **Promote Best Practices:** Embed SpecLang's core principles (clarity, iterativeness, intent-focus) into its operation.
* **Extensibility:** Allow for configuration and customization to suit different types of NL input and desired spec detail.

## Planned Features

* **NL Input Processing:**
  * Accept various forms of natural language input (e.g., single sentences, paragraphs, lists of requirements).
* **AI Model Integration:**
  * Interface with one or more Large Language Models (LLMs) (e.g., Gemini API).
  * Manage API authentication, requests, and responses.
* **Advanced Prompt Engineering:**
  * Internally construct optimized prompts based on SpecLang principles to guide the AI in generating well-structured specs.
  * Incorporate techniques for role-playing, context provision, and output format instruction.
* **SpecLang Structure Generation:**
  * Ensure output is in Markdown.
  * Guide the AI to generate standard SpecLang sections (Overview, Screens, Components, Global Behaviors, etc.).
  * Handle common patterns and suggest placeholders where user input is insufficient.
* **Response Parsing and Sanitization:**
  * Parse the AI's raw output.
  * Clean up and format the output to ensure valid Markdown and adherence to SpecLang conventions.
  * Extract key elements and potentially provide a structured object representation alongside the Markdown.
* **Configurability:**
  * Allow developers to configure parameters such as the AI model to use, desired level of detail, temperature, or custom instructions to prepend to prompts.
* **Error Handling:**
  * Robust error handling for API issues, parsing failures, or unexpected AI responses.
* **Iterative Refinement Support (Potential):**
  * Mechanisms to take an existing spec and a new NL instruction to refine or add to the spec.

## Instructions for Using the NL-to-Spec Core Library

1. **Import the `nlToSpec` function from `services/geminiService.ts`:**
    ```typescript
    import { nlToSpec } from './services/geminiService';
    ```

2. **Use the `nlToSpec` function to convert natural language input into a SpecLang document:**
    ```typescript
    const naturalLanguageInput = "Describe the project requirements...";
    const specLangDocument = await nlToSpec(naturalLanguageInput);
    console.log(specLangDocument);
    ```

3. **Ensure standardized SpecLang output:**
    The library ensures that the generated SpecLang documents adhere to a consistent and recognizable structure through SpecLang structure generation, response parsing and sanitization, and configurability.

4. **Advanced Prompt Engineering:**
    The library uses advanced prompt engineering techniques to guide the AI in generating well-structured specifications. This includes techniques for role-playing, context provision, and output format instruction.

5. **Key Elements Extraction:**
    During response parsing, the library extracts key elements such as SpecLang structure, valid Markdown, key elements, structural issues, clarity issues, and completeness issues.

By following these instructions, you can leverage the NL-to-Spec Core Library to convert natural language input into structured SpecLang documents, ensuring standardized output and promoting best practices.