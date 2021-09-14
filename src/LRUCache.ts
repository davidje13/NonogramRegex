export default class LRUCache<K, V> {
	private readonly cache: Map<K, V> = new Map();

	constructor(
		private readonly generator: (k: K) => V,
		private readonly maxSize: number,
	) {}

	get(k: K): V {
		if (this.maxSize <= 0) {
			return this.generator(k);
		}
		const existing = this.cache.get(k);
		if (existing) {
			// move to most recent in map order
			this.cache.delete(k);
			this.cache.set(k, existing);
			return existing;
		}
		const created = this.generator(k);
		this.cache.set(k, created);
		if (this.cache.size > this.maxSize) {
			// remove oldest
			this.cache.delete(this.cache.keys().next().value);
		}
		return created;
	}
}
