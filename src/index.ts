import RevExp from 'revexp';
import LRUCache from './LRUCache';
import { el } from './utils';
import FormSingle from './forms/FormSingle';
import FormRect from './forms/FormRect';
import FormHex from './forms/FormHex';

const patternCache = new LRUCache(RevExp.compile, 100);

new FormSingle(el('form-single') as HTMLFormElement, patternCache).init();
new FormRect(el('form-rect') as HTMLFormElement, patternCache).init();
new FormHex(el('form-hex') as HTMLFormElement, patternCache).init();

document.body.removeChild(el('loading'));
