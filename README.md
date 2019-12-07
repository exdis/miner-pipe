# miner-pipe

## Usage

```
node bin/mine path/to/miner.js -- path/to/file-to-mine
```

In the code

```js
import { createMinePipeline } from './lib/pipeline.js';

(async function() {
    const pipeline = await createMinePipeline('file/imports');

    console.log(await pipeline({ path: 'fixture.js' }))
})();
```

## Example

```
node bin/mine ./blocks/miners/file-imports.js -- --path fixture.js
# or
node bin/mine file/imports -- --path fixture.js
```

Outputs:

```
[
  Node {
    type: 'ImportDeclaration',
    start: 0,
    end: 40,
    specifiers: [ [Node] ],
    source: Node {
      type: 'Literal',
      start: 14,
      end: 39,
      value: './blocks/params/path.js',
      raw: "'./blocks/params/path.js'"
    }
  }
]
```
