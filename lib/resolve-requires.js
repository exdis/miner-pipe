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

async function resolveMiner(ref, provider) {
    const [subject, attribute] = ref.split('/');
    let resolved;

    try {
        resolved = await import(
            path.join(__dirname, '../blocks/miners/', (attribute ? [subject, attribute].join('-') : subject) + '.js')
        );    
    } catch (_) {
        resolved = await import(
            path.join(__dirname, `../providers/${provider}/`, (attribute ? [subject, attribute].join('-') : subject) + '.js')
        );    
    }

    return { requires: resolved.requires, logic: resolved.default };
}

function resolveMinerOrParam(provider) {
    return async function(ref) {
        return ref.indexOf(':') !== -1
            ? resolveParam(ref.slice(ref.indexOf(':') + 1))
            : resolveMiner(ref, provider);
    }
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

export async function resolveMineRequires(requires, logic, { provider, params }) {
    const taskFactory = await resolveRequires(requires, resolveMinerOrParam(provider));
    const mine = createTask('mine', requires, logic, taskFactory);

    return (parameters = params, env = process.env) =>
        mine(new Map([
            [paramsSymbol, Promise.resolve(parameters)],
            [envSymbol, Promise.resolve(env)]
        ]));
}

export async function resolvePipeline(ref) {
    let pathToModule = path.resolve(ref);

    if (!fs.existsSync(pathToModule)) {
        const [subject, attribute] = ref.split('/');
        pathToModule = path.join(__dirname, '../blocks/miners/', (attribute ? [subject, attribute].join('-') : subject) + '.js');
    }

    const { requires, default: logic } = await import(pathToModule);
        
    return { requires, logic };
}
