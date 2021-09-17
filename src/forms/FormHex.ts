import RevExp from 'revexp';
import type LRUCache from '../LRUCache';
import { display } from '../utils';
import FormGridBase, { Grid, RawClue } from './FormGridBase';

export default class FormHex extends FormGridBase<GridHex> {
	constructor(
		form: HTMLFormElement,
		patternCache: LRUCache<string, RevExp>,
	) {
		super(
			form,
			patternCache,
			['d1', 'd2', 'd3'],
			new GridHex(form.querySelector('.grid') as HTMLElement),
		);
	}
}

class GridHex implements Grid {
	private d1 = 0;
	private d2 = 0;
	private d3 = 0;
	private readonly patterns1: Pattern[] = [];
	private readonly patterns2: Pattern[] = [];
	private readonly patterns3: Pattern[] = [];
	private readonly cells: Cell[] = [];

	constructor(
		private container: HTMLElement,
	) {}

	getBlankData(): RevExp.CharacterClass[] {
		return this.cells.map(() => RevExp.CharacterClass.ANY);
	}

	clearData() {
		this.cells.forEach((cell) => {
			cell.eCell.classList.remove('solved');
			cell.value = '';
		});
	}

	setData(data: RevExp.CharacterClass[]) {
		this.cells.forEach((cell, index) => {
			const value = data[index];
			if (value.isSingular()) {
				cell.eCell.classList.add('solved');
				cell.value = display(value.singularChar());
			} else {
				cell.eCell.classList.remove('solved');
				cell.value = String(value);
			}
		});
	}

	getClues(): RawClue[] {
		const { d1, d2, d3 } = this;

		const p1s: RawClue[] = this.patterns1.map((p, n) => ({
			name: `\u2199 ${n + 1}`,
			pattern: p.pattern,
			indices: [],
		}));
		const p2s: RawClue[] = this.patterns2.map((p, n) => ({
			name: `\u2192 ${n + 1}`,
			pattern: p.pattern,
			indices: [],
		}));
		const p3s: RawClue[] = this.patterns3.map((p, n) => ({
			name: `\u2196 ${n + 1}`,
			pattern: p.pattern,
			indices: [],
		}));

		let i = 0;
		for (let y = 0; y < d1 + d3 - 1; ++y) {
			const xl = Math.max(0, y - (d1 - 1));
			const xr = Math.min(y + d2, d2 + d3 - 1);
			for (let x = xl; x < xr; ++x) {
				const p2i = y;
				const p3i = x - y + (d1 - 1);
				const p1i = this.patterns1.length - x - 1;
				p1s[p1i].indices.push(i);
				p2s[p2i].indices.push(i);
				p3s[p3i].indices.unshift(i);
				++i;
			}
		}
		return [...p1s, ...p2s, ...p3s];
	}

	resize([d1, d2, d3]: number[]) {
		if (d1 === this.d1 && d2 === this.d2 && d3 === this.d3) {
			return;
		}

		this.removeDOM();
		this.patterns1.length = 0;
		this.patterns2.length = 0;
		this.patterns3.length = 0;
		this.cells.length = 0;

		/*
     * 02 3
		 * 1   4
     *  6 5
		 *
		 * d1 = 1->2 (=5->4)
		 * d2 = 2->3 (=6->5)
		 * d3 = 3->4 (=1->6)
		*/
		const D1 = { x: 0.5, y: -1 };
		const D2 = { x: 1, y: 0 };
		const D3 = { x: 0.5, y: 1 };
		const c1 = { x: 0, y: d1 - 1 };
		const c2 = addMult(c1, D1, d1 - 1);
		const c3 = addMult(c2, D2, d2 - 1);
		const c4 = addMult(c3, D3, d3 - 1);
		const c5 = addMult(c4, D1, -(d1 - 1));
		const c6 = addMult(c5, D2, -(d2 - 1));

		for (let i = 0; i < d1; ++i) {
			this.patterns2.push(new Pattern('d2', addMult(addMult(c2, D1, -i), D2, -1)));
		}
		for (let i = 1; i < d3; ++i) {
			this.patterns2.push(new Pattern('d2', addMult(addMult(c1, D3, i), D2, -1)));
		}
		for (let i = 0; i < d2; ++i) {
			this.patterns3.push(new Pattern('d3', addMult(addMult(c6, D2, i), D3, 1)));
		}
		for (let i = 1; i < d1; ++i) {
			this.patterns3.push(new Pattern('d3', addMult(addMult(c5, D1, i), D3, 1)));
		}
		for (let i = 0; i < d3; ++i) {
			this.patterns1.push(new Pattern('d1', addMult(addMult(c4, D3, -i), D1, 1)));
		}
		for (let i = 1; i < d2; ++i) {
			this.patterns1.push(new Pattern('d1', addMult(addMult(c3, D2, -i), D1, 1)));
		}
		for (let y = 0; y < d1 + d3 - 1; ++y) {
			const begin = addMult(c2, D1, -y);
			const xl = Math.max(0, y - (d1 - 1));
			const xr = Math.min(y + d2, d2 + d3 - 1);
			for (let x = xl; x < xr; ++x) {
				this.cells.push(new Cell(addMult(begin, D2, x)));
			}
		}

		this.d1 = d1;
		this.d2 = d2;
		this.d3 = d3;

		this.addDOM();
	}

	private removeDOM() {
		[...this.patterns1, ...this.patterns2, ...this.patterns3]
			.forEach((pattern) => this.container.removeChild(pattern.ePattern));
		this.cells.forEach((cell) => this.container.removeChild(cell.eCell));
	}

	private addDOM() {
		[...this.patterns1, ...this.patterns2, ...this.patterns3]
			.forEach((pattern) => this.container.appendChild(pattern.ePattern));
		this.cells.forEach((cell) => this.container.appendChild(cell.eCell));

		this.container.style.width = `calc(var(--sx) * ${this.d1 * 0.5 + this.d2 + this.d3 * 0.5 - 2})`;
		this.container.style.height = `calc(var(--sy) * ${this.d1 + this.d3 - 2})`;
	}
}

interface Vector {
	x: number;
	y: number;
}

function addMult(v1: Vector, v2: Vector, s: number): Vector {
	return { x: v1.x + v2.x * s, y: v1.y + v2.y * s };
}

class Pattern {
	public readonly ePattern: HTMLInputElement;

	constructor(type: string, pos: Vector) {
		this.ePattern = document.createElement('input');
		this.ePattern.setAttribute('type', 'text');
		this.ePattern.style.top = `calc(var(--sy) * ${pos.y})`;
		this.ePattern.style.left = `calc(var(--sx) * ${pos.x})`;
		this.ePattern.className = `pattern ${type}`;
		this.ePattern.value = '.*';
	}

	get pattern() { return this.ePattern.value; }
}

class Cell {
	public readonly eCell: HTMLOutputElement;

	constructor(pos: Vector) {
		this.eCell = document.createElement('output');
		this.eCell.className = 'cell';
		this.eCell.style.top = `calc(var(--sy) * ${pos.y})`;
		this.eCell.style.left = `calc(var(--sx) * ${pos.x})`;
	}

	set value(v: string) { this.eCell.value = v || ' '; }
}
