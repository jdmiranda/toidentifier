/*!
 * toidentifier
 * Copyright(c) 2016 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module exports.
 * @public
 */

module.exports = toIdentifier

// Pre-compiled regex patterns for better performance
const NON_IDENTIFIER_CHARS = /[^ _0-9a-z]/gi

// LRU-style cache for conversion results (max 500 entries)
const cache = new Map()
const MAX_CACHE_SIZE = 500

/**
 * Check if a character code is valid for an identifier
 * @param {number} code
 * @returns {boolean}
 * @private
 */
function isValidIdentifierChar (code) {
  return (code >= 48 && code <= 57) || // 0-9
         (code >= 65 && code <= 90) ||  // A-Z
         (code >= 97 && code <= 122) || // a-z
         code === 95                    // _
}

/**
 * Fast path check - is string already a valid identifier?
 * @param {string} str
 * @returns {boolean}
 * @private
 */
function isAlreadyValidIdentifier (str) {
  if (str.length === 0) return false

  // Check first char is letter or underscore
  const firstCode = str.charCodeAt(0)
  if (!((firstCode >= 65 && firstCode <= 90) ||
        (firstCode >= 97 && firstCode <= 122) ||
        firstCode === 95)) {
    return false
  }

  // Check all chars are valid
  for (let i = 0; i < str.length; i++) {
    if (!isValidIdentifierChar(str.charCodeAt(i))) {
      return false
    }
  }

  return true
}

/**
 * Transform the given string into a JavaScript identifier
 *
 * @param {string} str
 * @returns {string}
 * @public
 */

function toIdentifier (str) {
  // Check cache first
  if (cache.has(str)) {
    return cache.get(str)
  }

  // Fast path: if already valid identifier, return as-is
  if (isAlreadyValidIdentifier(str)) {
    // Cache and return
    addToCache(str, str)
    return str
  }

  // Perform transformation
  const result = str
    .split(' ')
    .map(function (token) {
      return token.slice(0, 1).toUpperCase() + token.slice(1)
    })
    .join('')
    .replace(NON_IDENTIFIER_CHARS, '')

  // Cache the result
  addToCache(str, result)

  return result
}

/**
 * Add entry to cache with LRU eviction
 * @param {string} key
 * @param {string} value
 * @private
 */
function addToCache (key, value) {
  // If cache is full, remove oldest entry (first entry in Map)
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }

  cache.set(key, value)
}
