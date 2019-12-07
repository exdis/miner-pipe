import fs from 'fs';

export const requires = ['file'];
export default function(file) {
    return fs.readFileSync(file.path, 'utf8');
}
