import katex from 'katex';

export function renderLatex(text: string): string {
  if (!text) return '';
  
  // Replace display math ($$...$$) first
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { 
        displayMode: true,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `$$${math}$$`;
    }
  });

  // Replace inline math ($...$)
  result = result.replace(/\$([^$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { 
        displayMode: false,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `$${math}$`;
    }
  });

  // Replace \( ... \) inline math
  result = result.replace(/\\\(([^)]+?)\\\)/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { 
        displayMode: false,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `\\(${math}\\)`;
    }
  });

  // Replace \[ ... \] display math
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { 
        displayMode: true,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return `\\[${math}\\]`;
    }
  });

  return result;
}
