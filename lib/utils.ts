
// Define ClassValue type (simplified from clsx)
export type ClassValue = string | number | null | boolean | undefined | { [key: string]: any } | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (typeof input === 'string') {
      classes.push(input);
    } else if (Array.isArray(input)) {
      for (const item of input) {
        const inner = cn(item); // Recursively call for nested arrays
        if (inner) {
          classes.push(inner);
        }
      }
    } else if (typeof input === 'object' && input !== null) {
      for (const key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key) && input[key]) {
          classes.push(key);
        }
      }
    }
  }
  return classes.filter(Boolean).join(' ');
}


export const delay = <T,>(data: T, ms: number = 500): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), ms));

export const parseJsonFromMarkdown = <T = any>(markdownText: string): T => {
  let jsonStr = markdownText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    const parseError = new Error(
      `Failed to parse JSON from markdown. Reason: ${(e as Error).message}. Raw text (first 300 chars): ${jsonStr.substring(0, 300)}`
    );
    // It can be useful to attach the original error or the raw string for further diagnostics if needed by the catcher.
    // (parseError as any).originalError = e;
    // (parseError as any).rawJsonString = jsonStr;
    throw parseError;
  }
};

export const sanitizeMarkdownContent = (text: string): string => {
  if (typeof text !== 'string') return text;
  let sanitizedText = text.trim();
  // Regex to match optional language specifier after ``` and capture the content
  // s flag allows . to match newline characters
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = sanitizedText.match(fenceRegex);
  if (match && match[2]) {
    // If fences are found, use the content within them
    sanitizedText = match[2].trim();
  }
  return sanitizedText;
};