// fake-npm.mjs — registry stand-in for tests. Invoked by verify-stack.mjs through
// the ULTRAWEB_NPM_SHIM seam as: node fake-npm.mjs view <spec> version
// The registry is injected via FAKE_REGISTRY (JSON): { "<spec>": "<version>" }.
// A missing spec or the literal "ERR" simulates npm failing (404 / network).
const spec = process.argv[3];
const reg = JSON.parse(process.env.FAKE_REGISTRY || '{}');
const v = reg[spec];
if (v === undefined || v === 'ERR') {
  console.error(`npm error: no version for ${spec}`);
  process.exit(1);
}
console.log(v);
