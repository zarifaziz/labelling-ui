import { parquetReadObjects, AsyncBuffer } from 'hyparquet';
import { TraceItem } from '@/types';

/**
 * Create an AsyncBuffer from an ArrayBuffer for hyparquet
 */
function arrayBufferToAsyncBuffer(buffer: ArrayBuffer): AsyncBuffer {
  return {
    byteLength: buffer.byteLength,
    slice(start: number, end?: number) {
      return buffer.slice(start, end);
    },
  };
}

/**
 * Parse a parquet file and return trace items.
 * Expects columns: id, input_trace, output_trace (at minimum)
 */
export async function parseParquet(file: File): Promise<TraceItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  const asyncBuffer = arrayBufferToAsyncBuffer(arrayBuffer);
  
  const data = await parquetReadObjects({ file: asyncBuffer });
  
  const rows: TraceItem[] = data.map((row) => ({
    id: String(row.id ?? ''),
    input_trace: String(row.input_trace ?? row.inputTrace ?? ''),
    output_trace: String(row.output_trace ?? row.outputTrace ?? ''),
    ...Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, v])
    ),
  }));
  
  return rows;
}

/**
 * Given a CSV filename, return the expected trace parquet filename
 */
export function getTraceFilename(csvFilename: string): string {
  return csvFilename.replace(/\.csv$/, '.traces.parquet');
}

/**
 * Given a file path, construct the expected trace file path
 */
export function getTraceFilePath(csvPath: string): string {
  return csvPath.replace(/\.csv$/, '.traces.parquet');
}
