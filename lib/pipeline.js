import { resolveMineRequires, resolvePipeline } from './resolve-requires.js';

export async function createMinePipeline({
    provider,
    params,
    miner
}) {
    const { requires, logic } = await resolvePipeline(miner);

    return resolveMineRequires(requires, logic, { provider, params });
}
