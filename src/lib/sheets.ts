/**
 * Extract sheet ID and gid from a Google Sheets URL
 */
export function parseGoogleSheetsUrl(url: string): { sheetId: string; gid: string } | null {
  try {
    // Match pattern: /d/{sheetId}/...?gid={gid}
    const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/[?&#]gid=([0-9]+)/);

    if (!sheetIdMatch) return null;

    return {
      sheetId: sheetIdMatch[1],
      gid: gidMatch ? gidMatch[1] : '0', // Default to first sheet if no gid
    };
  } catch {
    return null;
  }
}

/**
 * Convert Google Sheets URL to CSV export URL
 */
export function getSheetsCSVUrl(sheetId: string, gid: string = '0'): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

/**
 * Fetch CSV data from a Google Sheets URL
 * Note: The sheet must be published to the web or publicly accessible
 */
export async function fetchGoogleSheet(url: string): Promise<string> {
  const parsed = parseGoogleSheetsUrl(url);
  if (!parsed) {
    throw new Error('Invalid Google Sheets URL');
  }

  const csvUrl = getSheetsCSVUrl(parsed.sheetId, parsed.gid);
  
  try {
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Sheet not found. Make sure the sheet is published to the web (File → Share → Publish to web).');
      }
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch Google Sheet. Ensure the sheet is publicly accessible.');
  }
}
