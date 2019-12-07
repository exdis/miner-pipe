import * as path from 'path';

export default function(params, env) {
    return path.resolve(params.path || env.FILE || '.');
}
