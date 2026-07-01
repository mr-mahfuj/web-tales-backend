import process from 'node:process';
import path from 'node:path';

const eslintCli = path.join(process.cwd(), 'node_modules', 'eslint', 'bin', 'eslint.js');
const prettierCli = path.join(process.cwd(), 'node_modules', 'prettier', 'bin', 'prettier.cjs');

export default {
    '*.{ts,js}': [`node ${eslintCli} --fix`, `node ${prettierCli} --write`],
};
