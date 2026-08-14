import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const benchRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const repositoryRoot = resolve(benchRoot, '..');
export const suitePath = join(benchRoot, 'config', 'suite.json');
export const casesRoot = join(benchRoot, 'cases');
export const runsRoot = join(benchRoot, '.runs');
export const generatedReportsRoot = join(benchRoot, 'reports', 'generated');
