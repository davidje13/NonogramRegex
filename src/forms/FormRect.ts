import RevExp from 'revexp';
import { solve } from '../solver';
import { display, elNamed } from '../utils';
import CommonForm from './CommonForm';

export default class FormSingle extends CommonForm {
	override init() {
		super.init();
		this.addRow = this.addRow.bind(this);
		this.addCol = this.addCol.bind(this);
		this.removeRow = this.removeRow.bind(this);
		this.removeCol = this.removeCol.bind(this);
		this.eAddRow.addEventListener('click', this.addRow);
		this.eAddCol.addEventListener('click', this.addCol);
		this.eRemoveRow.addEventListener('click', this.removeRow);
		this.eRemoveCol.addEventListener('click', this.removeCol);
	}

	override refresh() {
		this.grid.resize(this.rows, this.cols, this.double);

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

	private addRow() {
		++this.rows;
		this.refresh();
	}

	private addCol() {
		++this.cols;
		this.refresh();
	}

	private removeRow() {
		if (this.rows > 1) {
			--this.rows;
			this.refresh();
		}
	}

	private removeCol() {
		if (this.cols > 1) {
			--this.cols;
			this.refresh();
		}
	}

	private get rows() { return Number.parseInt(this.eRows.value, 10); }
	private set rows(v: number) { this.eRows.value = String(v); }
	private get cols() { return Number.parseInt(this.eCols.value, 10); }
	private set cols(v: number) { this.eCols.value = String(v); }
	private get double() { return this.eDouble.checked; }

	private set error(v: string | null) {
		if (v !== null) {
			this.form.classList.add('fail');
		} else {
			this.form.classList.remove('fail');
		}
		this.eError.innerText = v ?? '';
	}

	private readonly eRows = elNamed(this.form, 'rows') as HTMLInputElement;
	private readonly eCols = elNamed(this.form, 'cols') as HTMLInputElement;
	private readonly eDouble = elNamed(this.form, 'double') as HTMLInputElement;
	private readonly eAddRow = elNamed(this.form, 'add-row') as HTMLButtonElement;
	private readonly eAddCol = elNamed(this.form, 'add-col') as HTMLButtonElement;
	private readonly eRemoveRow = elNamed(this.form, 'remove-row') as HTMLButtonElement;
	private readonly eRemoveCol = elNamed(this.form, 'remove-col') as HTMLButtonElement;
	private readonly eError = this.form.querySelector('.error') as HTMLElement;
	private readonly grid = new Grid2D(this.form.querySelector('.grid') as HTMLElement);
}

class Grid2D {
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

	resize(rows: number, cols: number, double: boolean) {
		const oldRows = this.patternRows.length;
		const oldCols = this.patternCols.length;
		if (rows === oldRows && cols === oldCols && double === this.isDouble) {
			return;
		}

		// remove all from DOM
		[...this.patternRows, ...this.patternCols]
			.forEach((pattern) => this.container.removeChild(pattern.ePattern));
		if (this.isDouble) {
			[...this.patternAltRows, ...this.patternAltCols]
				.forEach((pattern) => this.container.removeChild(pattern.ePattern));
		}
		this.cells.forEach((r) => r.forEach((cell) => this.container.removeChild(cell.eCell)));

		// update elements
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
		this.isDouble = double;

		// update DOM
		this.patternCols.forEach((pattern) => this.container.appendChild(pattern.ePattern));
		for (let row = 0; row < rows; ++row) {
			this.container.appendChild(this.patternRows[row].ePattern);
			this.cells[row].forEach((cell) => this.container.appendChild(cell.eCell));
			if (double) {
				this.container.appendChild(this.patternAltRows[row].ePattern);
			}
		}
		if (double) {
			this.patternAltCols.forEach((pattern) => this.container.appendChild(pattern.ePattern));
		}
		this.container.style.width = `calc(var(--w) * ${cols})`;
		this.container.style.height = `calc(var(--h) * ${rows})`;
	}
}

export interface RawClue {
	name: string;
	pattern: string;
	indices: number[];
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
