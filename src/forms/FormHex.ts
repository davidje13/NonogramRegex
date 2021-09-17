import RevExp from 'revexp';
import type LRUCache from '../LRUCache';
import { display, elNamed } from '../utils';
import FormGridBase, { Grid, RawClue } from './FormGridBase';

function setPos(o: HTMLElement, pos: Position) {
	o.style.top = pos.top;
	o.style.left = pos.left;
}

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

	override refresh() {
		super.refresh();
		setPos(elNamed(this.form, 'add-d1'), this.grid.corner(6).addMult(GridHex.D1, -1.7));
		setPos(elNamed(this.form, 'remove-d1'), this.grid.corner(6).addMult(GridHex.D1, -1));
		setPos(elNamed(this.form, 'add-d2'), this.grid.corner(4).addMult(GridHex.D2, 1.7));
		setPos(elNamed(this.form, 'remove-d2'), this.grid.corner(4).addMult(GridHex.D2, 1));
		setPos(elNamed(this.form, 'add-d3'), this.grid.corner(2).addMult(GridHex.D3, -1.7));
		setPos(elNamed(this.form, 'remove-d3'), this.grid.corner(2).addMult(GridHex.D3, -1));
	}
}

class GridHex implements Grid {
	public static readonly D1 = { x: 0.5, y: -1 };
	public static readonly D2 = { x: 1, y: 0 };
	public static readonly D3 = { x: 0.5, y: 1 };

	private d1 = -1;
	private d2 = -1;
	private d3 = -1;
	private readonly patterns1: Pattern[] = [];
	private readonly patterns2: Pattern[] = [];
	private readonly patterns3: Pattern[] = [];
	private readonly cells: Cell[] = [];
	private corners: Position[] = [];

	constructor(
		private container: HTMLElement,
	) {}

	corner(n: number): Position { return this.corners[n - 1]; }

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
		const { D1, D2, D3 } = GridHex;
		const c1 = new Position(0, d1 - 1);
		const c2 = c1.addMult(D1, d1 - 1);
		const c3 = c2.addMult(D2, d2 - 1);
		const c4 = c3.addMult(D3, d3 - 1);
		const c5 = c4.addMult(D1, -(d1 - 1));
		const c6 = c5.addMult(D2, -(d2 - 1));
		this.corners = [c1, c2, c3, c4, c5, c6];

		for (let i = 0; i < d1; ++i) {
			this.patterns2.push(new Pattern('d2', c2.addMult(D1, -i).addMult(D2, -1)));
		}
		for (let i = 1; i < d3; ++i) {
			this.patterns2.push(new Pattern('d2', c1.addMult(D3, i).addMult(D2, -1)));
		}
		for (let i = 0; i < d2; ++i) {
			this.patterns3.push(new Pattern('d3', c6.addMult(D2, i).addMult(D3, 1)));
		}
		for (let i = 1; i < d1; ++i) {
			this.patterns3.push(new Pattern('d3', c5.addMult(D1, i).addMult(D3, 1)));
		}
		for (let i = 0; i < d3; ++i) {
			this.patterns1.push(new Pattern('d1', c4.addMult(D3, -i).addMult(D1, 1)));
		}
		for (let i = 1; i < d2; ++i) {
			this.patterns1.push(new Pattern('d1', c3.addMult(D2, -i).addMult(D1, 1)));
		}
		for (let y = 0; y < d1 + d3 - 1; ++y) {
			const begin = c2.addMult(D1, -y);
			const xl = Math.max(0, y - (d1 - 1));
			const xr = Math.min(y + d2, d2 + d3 - 1);
			for (let x = xl; x < xr; ++x) {
				this.cells.push(new Cell(begin.addMult(D2, x)));
			}
		}

		this.d1 = d1;
		this.d2 = d2;
		this.d3 = d3;

		this.addDOM();
	}

	private removeDOM() {
		[...this.patterns2, ...this.patterns3, ...this.patterns1]
			.forEach((pattern) => this.container.removeChild(pattern.ePattern));
		this.cells.forEach((cell) => this.container.removeChild(cell.eCell));
	}

	private addDOM() {
		[...this.patterns2, ...this.patterns3, ...this.patterns1]
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

class Position {
	constructor(private readonly x: number, private readonly y: number) {}

	addMult(vec: Vector, scale: number): Position {
		return new Position(this.x + vec.x * scale, this.y + vec.y * scale);
	}

	get left(): string { return `calc(var(--sx) * ${this.x})`; }
	get top(): string { return `calc(var(--sy) * ${this.y})`; }
}

class Pattern {
	public readonly ePattern: HTMLInputElement;

	constructor(type: string, pos: Position) {
		this.ePattern = document.createElement('input');
		this.ePattern.setAttribute('type', 'text');
		setPos(this.ePattern, pos);
		this.ePattern.className = `pattern ${type}`;
		this.ePattern.value = '.*';
	}

	get pattern() { return this.ePattern.value; }
}

class Cell {
	public readonly eCell: HTMLOutputElement;

	constructor(pos: Position) {
		this.eCell = document.createElement('output');
		this.eCell.className = 'cell';
		setPos(this.eCell, pos);
	}

	set value(v: string) { this.eCell.value = v || ' '; }
}
