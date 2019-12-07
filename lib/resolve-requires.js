import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const paramsSymbol = Symbol('params');
const envSymbol = Symbol('env');

async function resolveParam(ref) {
    const { default: logic } = await import(
        path.join(__dirname, '../blocks/params/', ref + '.js')
    );

    return { requires: [paramsSymbol, envSymbol], logic };
}

async function resolveExtractor(ref) {
    const [subject, attribute] = ref.split('/');
    const { requires, default: logic } = await import(
        path.join(__dirname, '../blocks/extractors/', (attribute ? [subject, attribute].join('-') : subject) + '.js')
    );

    return { requires, logic };
}

async function resolveExtractorOrParam(ref) {
    return ref.indexOf(':') !== -1
        ? resolveParam(ref.slice(ref.indexOf(':') + 1))
        : resolveExtractor(ref);
}

export function createTask(name, requires, logic, taskFactory) {
    if (!Array.isArray(requires)) {
        requires = [];
    }
    if (typeof logic !== 'function') {
        throw new Error('?');
    }

    return cache => Promise
        .all(requires.map(ref => {
            if (!cache.has(ref)) {
                cache.set(ref, taskFactory.get(ref)(cache));
            }

            return cache.get(ref);
        }))
        .then(values => logic(...values));
}

async function resolveRequires(requires, resolveBlock) {
    const allNodes = new Set(requires);
    const taskFactory = new Map();

    for (const ref of allNodes) {
        const { requires, logic } = await resolveBlock(ref);

        taskFactory.set(ref, createTask(ref, requires, logic, taskFactory));
        requires.forEach(req => {
            if (typeof req === 'string') {
                allNodes.add(req)
            }
        });
    }

    return taskFactory;
}

export async function resolveMineRequires(requires, logic) {
    const taskFactory = await resolveRequires(requires, resolveExtractorOrParam);
    const extract = createTask('extract', requires, logic, taskFactory);

    return (params, env = process.env) =>
        extract(new Map([
            [paramsSymbol, Promise.resolve(params)],
            [envSymbol, Promise.resolve(env)]
        ]));
}

export async function resolveMiner(ref) {
    let pathToModule = path.resolve(ref);

    if (!fs.existsSync(pathToModule)) {
        const [subject, attribute] = ref.split('/');
        pathToModule = path.join(__dirname, '../blocks/miners/', (attribute ? [subject, attribute].join('-') : subject) + '.js');
    }

    const { requires, default: logic } = await import(pathToModule);
        
    return { requires, logic };
}
