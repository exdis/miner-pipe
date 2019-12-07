import { resolveMineRequires, resolveMiner } from './resolve-requires.js';

export async function createMinePipeline(ref) {
    const { requires, logic } = await resolveMiner(ref);

    return resolveMineRequires(requires, logic);
}
