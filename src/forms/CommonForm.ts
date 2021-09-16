import type RevExp from 'revexp';
import type LRUCache from '../LRUCache';

function prevent(e: Event) {
	e.preventDefault();
}

export default abstract class CommonForm {
	private debounce: number = -1;

	constructor(
		protected readonly form: HTMLFormElement,
		protected readonly patternCache: LRUCache<string, RevExp>,
	) {
		this.refresh = this.refresh.bind(this);
		this.debouncedRefresh = this.debouncedRefresh.bind(this);
	}

	init() {
		this.form.addEventListener('submit', prevent);
		this.form.addEventListener('input', this.debouncedRefresh);
		this.refresh();
	}

	private debouncedRefresh() {
		window.clearTimeout(this.debounce);
		this.debounce = window.setTimeout(this.refresh, 0);
	}

	abstract refresh(): void;
}
