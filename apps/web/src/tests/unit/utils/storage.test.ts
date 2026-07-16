import { describe, it, expect, beforeEach } from 'vitest';
import { storage, sessionStorage_ } from '@/utils/storage';

// Polyfill/mock localStorage to guarantee clear method availability in test runner environments
if (typeof localStorage === 'undefined' || typeof localStorage.clear !== 'function') {
  const store: Record<string, string> = {};
  global.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k in store) {
        delete store[k];
      }
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    },
  } as any;
}

describe('storage utility (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets and gets values correctly', () => {
    storage.set('test_key', { foo: 'bar' });
    expect(storage.get<{ foo: string }>('test_key')).toEqual({ foo: 'bar' });
  });

  it('returns null for non-existent key', () => {
    expect(storage.get('non_existent')).toBeNull();
  });

  it('removes a key correctly', () => {
    storage.set('test_key', 'value');
    storage.remove('test_key');
    expect(storage.get('test_key')).toBeNull();
  });

  it('clears only epos_ keys', () => {
    localStorage.setItem('other_key', 'keep_me');
    storage.set('key1', 'val1');
    storage.set('key2', 'val2');

    storage.clear();

    expect(storage.get('key1')).toBeNull();
    expect(storage.get('key2')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('keep_me');
  });

  it('handles JSON parsing errors gracefully', () => {
    localStorage.setItem('epos_bad_json', 'invalid-json-{');
    expect(storage.get('bad_json')).toBeNull();
  });
});

describe('sessionStorage_ utility', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('sets and gets values correctly', () => {
    sessionStorage_.set('sess_key', { val: 42 });
    expect(sessionStorage_.get<{ val: number }>('sess_key')).toEqual({ val: 42 });
  });

  it('returns null for non-existent key', () => {
    expect(sessionStorage_.get('non_existent')).toBeNull();
  });

  it('removes a key correctly', () => {
    sessionStorage_.set('sess_key', 'value');
    sessionStorage_.remove('sess_key');
    expect(sessionStorage_.get('sess_key')).toBeNull();
  });

  it('handles JSON parsing errors gracefully', () => {
    sessionStorage.setItem('epos_bad_json', 'invalid-json-{');
    expect(sessionStorage_.get('bad_json')).toBeNull();
  });
});
