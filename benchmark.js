/*!
 * toidentifier - benchmark
 * Performance test for identifier conversions
 */

'use strict'

const toIdentifier = require('./index.js')

// Test cases covering different scenarios
const testCases = [
  // Simple conversions
  'foo bar',
  'hello world',
  'my variable name',

  // Already valid identifiers (fast path)
  'myVariable',
  'AnotherIdentifier',
  '_privateVar',
  'var123',

  // Complex conversions with special chars
  'f"o^o $ bar_z',
  'test-with-dashes',
  'special!@#$%chars',

  // Edge cases
  '  Foo  Bar  ',
  'a',
  'already_valid_identifier',

  // Repeated (cache hits)
  'cached value',
  'another cached',
]

// Warmup
console.log('Warming up...')
for (let i = 0; i < 1000; i++) {
  testCases.forEach(test => toIdentifier(test))
}

// Benchmark function
function benchmark (name, iterations, fn) {
  const start = process.hrtime.bigint()

  for (let i = 0; i < iterations; i++) {
    fn()
  }

  const end = process.hrtime.bigint()
  const duration = Number(end - start) / 1e6 // Convert to milliseconds
  const opsPerSec = (iterations / duration) * 1000

  console.log(`${name}:`)
  console.log(`  ${iterations.toLocaleString()} ops in ${duration.toFixed(2)}ms`)
  console.log(`  ${opsPerSec.toFixed(0).toLocaleString()} ops/sec`)
  console.log()
}

console.log('Running benchmarks...\n')

// Benchmark 1: Mixed test cases
benchmark('Mixed conversions (with cache)', 1000000, () => {
  testCases.forEach(test => toIdentifier(test))
})

// Benchmark 2: Cache hits (repeated conversions)
benchmark('Cache hits only', 1000000, () => {
  toIdentifier('foo bar')
  toIdentifier('hello world')
  toIdentifier('foo bar')
})

// Benchmark 3: Fast path (already valid identifiers)
benchmark('Fast path (valid identifiers)', 1000000, () => {
  toIdentifier('myVariable')
  toIdentifier('AnotherIdentifier')
  toIdentifier('_privateVar')
})

// Benchmark 4: Complex conversions
benchmark('Complex conversions', 1000000, () => {
  toIdentifier('f"o^o $ bar_z')
  toIdentifier('special!@#$%chars')
  toIdentifier('test-with-dashes')
})

// Benchmark 5: Single frequent conversion (best case for cache)
benchmark('Single value (maximum cache benefit)', 1000000, () => {
  toIdentifier('frequently used value')
})

console.log('Benchmark complete!')
