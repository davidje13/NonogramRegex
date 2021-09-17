import type RevExp from 'revexp';
import type LRUCache from '../LRUCache';
import { solve } from '../solver';
import { elNamed } from '../utils';
import CommonForm from './CommonForm';

export default abstract class FormGridBase<G extends Grid> extends CommonForm {
	private readonly eDims: HTMLInputElement[];
	private readonly eError = this.form.querySelector('.error') as HTMLElement;

	constructor(
		form: HTMLFormElement,
		patternCache: LRUCache<string, RevExp>,
		private readonly dimensions: string[],
		protected readonly grid: G,
	) {
		super(form, patternCache);
		this.eDims = dimensions.map((d) => elNamed(this.form, `${d}s`) as HTMLInputElement);
	}

	override init() {
		super.init();
		this.dimensions.forEach((d, i) => {
			elNamed(this.form, `add-${d}`).addEventListener('click', this.addDim.bind(this, i));
			elNamed(this.form, `remove-${d}`).addEventListener('click', this.removeDim.bind(this, i));
		});
	}

	override refresh() {
		this.grid.resize(this.dimensions.map((d, i) => this.getDim(i)));

		const data = this.grid.getBlankData();
		const clues = this.grid.getClues();
		try {
			const compiledClues = clues.map(({ name, pattern, indices }) => {
				try {
					return { name, pattern: this.patternCache.get(pattern), indices };
				} catch (e: unknown) {
					throw new Error(`${e} in ${name}`);
				}
			});
			const resolvedData = solve(data, compiledClues);
			this.grid.setData(resolvedData);
			this.error = null;
		} catch (e: unknown) {
			this.grid.clearData();
			this.error = String(e);
		}
	}

	private addDim(dim: number) {
		this.setDim(dim, this.getDim(dim) + 1);
		this.refresh();
	}

	private removeDim(dim: number) {
		const v = this.getDim(dim);
		if (v > 1) {
			this.setDim(dim, v - 1);
			this.refresh();
		}
	}

	private getDim(dim: number): number {
		return Number.parseInt(this.eDims[dim].value, 10);
	}

	private setDim(dim: number, value: number) {
		this.eDims[dim].value = String(value);
	}

	private set error(v: string | null) {
		if (v !== null) {
			this.form.classList.add('fail');
		} else {
			this.form.classList.remove('fail');
		}
		this.eError.innerText = v ?? '';
	}
}

export interface Grid {
	getBlankData(): RevExp.CharacterClass[];
	clearData(): void;
	setData(data: RevExp.CharacterClass[]): void;
	getClues(): RawClue[];
	resize(dimensions: number[]): void;
}

export interface RawClue {
	name: string;
	pattern: string;
	indices: number[];
}
