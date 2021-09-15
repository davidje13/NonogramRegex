import type RevExp from 'revexp';
import type LRUCache from '../LRUCache';

function prevent(e: Event) {
	e.preventDefault();
}

export default abstract class CommonForm {
	constructor(
		protected readonly form: HTMLFormElement,
		protected readonly patternCache: LRUCache<string, RevExp>,
	) {
		this.refresh = this.refresh.bind(this);
	}

	init() {
		this.form.addEventListener('submit', prevent);
		this.form.addEventListener('input', this.refresh);
		this.refresh();
	}

	abstract refresh(): void;
}
