import RevExp from 'revexp';
import type LRUCache from '../LRUCache';
import { display, elNamed } from '../utils';
import FormGridBase, { Grid, RawClue } from './FormGridBase';

export default class FormRect extends FormGridBase<Grid2D> {
	constructor(
		form: HTMLFormElement,
		patternCache: LRUCache<string, RevExp>,
	) {
		super(
			form,
			patternCache,
			['row', 'col'],
			new Grid2D(form.querySelector('.grid') as HTMLElement),
		);
	}

	override refresh() {
		this.grid.updateDouble(this.eDouble.checked);
		super.refresh();
	}

	private readonly eDouble = elNamed(this.form, 'double') as HTMLInputElement;
}

class Grid2D implements Grid {
	private readonly patternRows: Pattern[] = [];
	private readonly patternCols: Pattern[] = [];
	private readonly patternAltRows: Pattern[] = [];
	private readonly patternAltCols: Pattern[] = [];
	private readonly cells: Cell[][] = [];
	private isDouble = false;

	constructor(
		private container: HTMLElement,
	) {}

	getBlankData(): RevExp.CharacterClass[] {
		const data: RevExp.CharacterClass[] = [];
		this.cells.forEach((r) => r.forEach(() => data.push(RevExp.CharacterClass.ANY)));
		return data;
	}

	clearData() {
		this.cells.forEach((r) => r.forEach((cell) => {
			cell.eCell.classList.remove('solved');
			cell.value = '';
		}));
	}

	setData(data: RevExp.CharacterClass[]) {
		const cols = this.patternCols.length;
		this.cells.forEach((r, row) => r.forEach((cell, col) => {
			const value = data[row * cols + col];
			if (value.isSingular()) {
				cell.eCell.classList.add('solved');
				cell.value = display(value.singularChar());
			} else {
				cell.eCell.classList.remove('solved');
				cell.value = String(value);
			}
		}));
	}

	getClues(): RawClue[] {
		const rows = this.patternRows.length;
		const cols = this.patternCols.length;

		const clues: RawClue[] = [];
		for (let r = 0; r < rows; ++r) {
			const indices: number[] = [];
			for (let c = 0; c < cols; ++c) {
				indices.push(r * cols + c);
			}
			clues.push({
				name: `row ${r + 1}`,
				pattern: this.patternRows[r].pattern,
				indices,
			});
			if (this.isDouble) {
				clues.push({
					name: `alt row ${r + 1}`,
					pattern: this.patternAltRows[r].pattern,
					indices,
				});
			}
		}
		for (let c = 0; c < cols; ++c) {
			const indices: number[] = [];
			for (let r = 0; r < rows; ++r) {
				indices.push(r * cols + c);
			}
			clues.push({
				name: `column ${c + 1}`,
				pattern: this.patternCols[c].pattern,
				indices,
			});
			if (this.isDouble) {
				clues.push({
					name: `alt column ${c + 1}`,
					pattern: this.patternAltCols[c].pattern,
					indices,
				});
			}
		}
		return clues;
	}

	updateDouble(double: boolean) {
		if (double === this.isDouble) {
			return;
		}

		this.removeDOM();
		this.isDouble = double;
		this.addDOM();
	}

	resize([rows, cols]: number[]) {
		const oldRows = this.patternRows.length;
		const oldCols = this.patternCols.length;
		if (rows === oldRows && cols === oldCols) {
			return;
		}

		this.removeDOM();

		for (let row = oldRows; row < rows; ++row) {
			this.cells.push([]);
			this.patternRows.push(new Pattern('row', row));
			this.patternAltRows.push(new Pattern('altrow', row));
		}
		for (let col = oldCols; col < cols; ++col) {
			this.patternCols.push(new Pattern('col', col));
			this.patternAltCols.push(new Pattern('altcol', col));
		}
		for (let row = 0; row < rows; ++row) {
			const r = this.cells[row];
			for (let col = r.length; col < cols; ++col) {
				r.push(new Cell(row, col));
			}
			r.length = cols;
		}
		this.patternRows.length = rows;
		this.patternCols.length = cols;
		this.patternAltRows.length = rows;
		this.patternAltCols.length = cols;
		this.cells.length = rows;

		this.addDOM();
	}

	private removeDOM() {
		[...this.patternRows, ...this.patternCols]
			.forEach((pattern) => this.container.removeChild(pattern.ePattern));
		if (this.isDouble) {
			[...this.patternAltRows, ...this.patternAltCols]
				.forEach((pattern) => this.container.removeChild(pattern.ePattern));
		}
		this.cells.forEach((r) => r.forEach((cell) => this.container.removeChild(cell.eCell)));
	}

	private addDOM() {
		const rows = this.patternRows.length;
		const cols = this.patternCols.length;

		this.patternCols.forEach((pattern) => this.container.appendChild(pattern.ePattern));
		for (let row = 0; row < rows; ++row) {
			this.container.appendChild(this.patternRows[row].ePattern);
			this.cells[row].forEach((cell) => this.container.appendChild(cell.eCell));
			if (this.isDouble) {
				this.container.appendChild(this.patternAltRows[row].ePattern);
			}
		}
		if (this.isDouble) {
			this.patternAltCols.forEach((pattern) => this.container.appendChild(pattern.ePattern));
		}
		this.container.style.width = `calc(var(--w) * ${cols})`;
		this.container.style.height = `calc(var(--h) * ${rows})`;
	}
}

class Pattern {
	public readonly ePattern: HTMLInputElement;

	constructor(type: string, num: number) {
		this.ePattern = document.createElement('input');
		this.ePattern.setAttribute('type', 'text');
		this.ePattern.setAttribute('name', `pattern_${type}_${num}`);
		if (type === 'col' || type === 'altcol') {
			this.ePattern.style.left = `calc(var(--w) * ${num})`;
		} else {
			this.ePattern.style.top = `calc(var(--h) * ${num})`;
		}
		this.ePattern.className = `pattern ${type}`;
		this.ePattern.value = '.*';
	}

	get pattern() { return this.ePattern.value; }
}

class Cell {
	public readonly eCell: HTMLOutputElement;

	constructor(row: number, col: number) {
		this.eCell = document.createElement('output');
		this.eCell.setAttribute('name', `out_${row}_${col}`);
		this.eCell.className = 'cell';
		this.eCell.style.top = `calc(var(--h) * ${row})`;
		this.eCell.style.left = `calc(var(--w) * ${col})`;
	}

	set value(v: string) { this.eCell.value = v || ' '; }
}
