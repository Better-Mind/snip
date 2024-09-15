import { readFile } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { Buffer } from 'buffer';

// relative to home directory
export const readAndEncode = async (filepath: string) => {
    const content = await readFile(filepath);
    const b64encoded = Buffer.from(content).toString('base64');
    return b64encoded;
}
