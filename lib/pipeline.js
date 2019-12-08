import { resolveMineRequires, resolvePipeline } from './resolve-requires.js';

export async function createMinePipeline({
    provider,
    miner
}) {
    const { requires, logic } = await resolvePipeline(miner);

    return resolveMineRequires(requires, logic, provider);
}
