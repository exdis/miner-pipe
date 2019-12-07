import * as path from 'path';

export const requires = ['param:path'];
export default function(filepath) {
    const ext = path.extname(filepath);

    return {
        path: filepath,
        ext,
        type: resolveTypeByExt(ext)
    };
}

function resolveTypeByExt(ext) {
    switch (ext) {
        case '.js':
        case '.mjs':
        case '.cjs':
        case '.jsx':
            return 'javascript';

        case '.css':
            return 'css';

        default:
            return 'unknown';
    }
}
