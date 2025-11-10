import { mkdir } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { extract } from 'tar';

/** Скачивает и распаковывает правила из GitHub */
export async function fetchPromptsTarball(repo: string, version: string, targetDir: string): Promise<void> {
    const url = `https://github.com/${repo}/archive/refs/tags/prompts/v${version}.tar.gz`;

    const response = await fetch(url);
    if (response.ok === false) {
        throw new Error(`Failed to download prompts: ${response.status}`);
    }

    if (response.body === null) {
        throw new Error('Response body is null');
    }

    await mkdir(targetDir, { recursive: true });

    const nodeStream = Readable.fromWeb(response.body as never);
    await pipeline(
        nodeStream,
        extract({
            C: targetDir,
            strip: 1,
        }),
    );
}
