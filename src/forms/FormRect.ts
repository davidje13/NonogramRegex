import RevExp from 'revexp';
import type LRUCache from '../LRUCache';
import { solve, Clue } from '../solver';
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
		this.grid.resize(this.rows, this.cols);

		const data = this.grid.getBlankData();
		try {
			const clues = this.grid.getClues(this.patternCache);
			const resolvedData = solve(data, clues);
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
	private readonly eAddRow = elNamed(this.form, 'add-row') as HTMLButtonElement;
	private readonly eAddCol = elNamed(this.form, 'add-col') as HTMLButtonElement;
	private readonly eRemoveRow = elNamed(this.form, 'remove-row') as HTMLButtonElement;
	private readonly eRemoveCol = elNamed(this.form, 'remove-col') as HTMLButtonElement;
	private readonly eError = this.form.querySelector('.error') as HTMLElement;
	private readonly grid = new Grid2D(this.form.querySelector('.grid') as HTMLElement);
}

class Grid2D {
	readonly patternRows: Pattern[] = [];
	readonly patternCols: Pattern[] = [];
	readonly cells = new Set<Cell>();

	constructor(
		private container: HTMLElement,
	) {}

	getCell(row: number, col: number): Cell | null {
		for (const cell of this.cells) {
			if (cell.row === row && cell.col === col) {
				return cell;
			}
		}
		return null;
	}

	get rows() { return this.patternRows.length; }
	get cols() { return this.patternCols.length; }

	getBlankData(): RevExp.CharacterClass[] {
		const { rows, cols } = this;
		const data: RevExp.CharacterClass[] = [];
		for (let i = 0; i < rows * cols; ++i) {
			data.push(RevExp.CharacterClass.ANY);
		}
		return data;
	}

	clearData() {
		for (const cell of this.cells) {
			cell.eCell.classList.remove('solved');
			cell.value = '';
		}
	}

	setData(data: RevExp.CharacterClass[]) {
		const { cols } = this;
		for (const cell of this.cells) {
			const value = data[cell.row * cols + cell.col];
			if (value.isSingular()) {
				cell.eCell.classList.add('solved');
				cell.value = display(value.singularChar());
			} else {
				cell.eCell.classList.remove('solved');
				cell.value = String(value);
			}
		}
	}

	getClues(patternCache: LRUCache<string, RevExp>): Clue[] {
		const { rows, cols } = this;

		const clues: Clue[] = [];
		for (let r = 0; r < rows; ++r) {
			const pattern = patternCache.get(this.patternRows[r].pattern);
			const indices: number[] = [];
			for (let c = 0; c < cols; ++c) {
				indices.push(r * cols + c);
			}
			clues.push({ name: `row ${r + 1}`, pattern, indices });
		}
		for (let c = 0; c < cols; ++c) {
			const pattern = patternCache.get(this.patternCols[c].pattern);
			const indices: number[] = [];
			for (let r = 0; r < rows; ++r) {
				indices.push(r * cols + c);
			}
			clues.push({ name: `column ${c + 1}`, pattern, indices });
		}

		return clues;
	}

	resize(rows: number, cols: number) {
		const oldRows = this.patternRows.length;
		const oldCols = this.patternCols.length;
		if (rows < oldRows || cols < oldCols) {
			for (const cell of this.cells) {
				if (cell.row >= rows || cell.col >= cols) {
					cell.remove();
					this.cells.delete(cell);
				}
			}
		}
		for (let r = oldRows; r < rows; ++r) {
			for (let c = 0; c < Math.min(oldCols, cols); ++c) {
				this.cells.add(new Cell(this.container, r, c));
			}
			this.patternRows.push(new Pattern(this.container, r, -1));
		}
		for (let r = rows; r < oldRows; ++r) {
			this.patternRows[r].remove();
		}
		this.patternRows.length = rows;

		for (let c = oldCols; c < cols; ++c) {
			for (let r = 0; r < rows; ++r) {
				this.cells.add(new Cell(this.container, r, c));
			}
			this.patternCols.push(new Pattern(this.container, -1, c));
		}
		for (let c = cols; c < oldCols; ++c) {
			this.patternCols[c].remove();
		}
		this.patternCols.length = cols;
		this.container.style.width = `calc(var(--x) + var(--w) * ${cols})`;
		this.container.style.height = `calc(var(--y) + var(--h) * ${rows})`;
	}
}

class Pattern {
	private readonly ePattern: HTMLInputElement;

	constructor(
		private readonly grid: HTMLElement,
		public readonly row: number,
		public readonly col: number,
	) {
		this.ePattern = document.createElement('input');
		this.ePattern.setAttribute('type', 'text');
		this.ePattern.setAttribute('name', `pattern_${row}_${col}`);
		if (row === -1) {
			this.ePattern.style.left = `calc(var(--x) + var(--w) * ${col})`;
			this.ePattern.className = 'pattern col';
		} else {
			this.ePattern.style.top = `calc(var(--y) + var(--h) * ${row})`;
			this.ePattern.className = 'pattern row';
		}
		this.ePattern.value = '.*';
		grid.appendChild(this.ePattern);
	}

	get pattern() { return this.ePattern.value; }

	remove() {
		this.grid.removeChild(this.ePattern);
	}
}

class Cell {
	public readonly eCell: HTMLOutputElement;

	constructor(
		private readonly grid: HTMLElement,
		public readonly row: number,
		public readonly col: number,
	) {
		this.eCell = document.createElement('output');
		this.eCell.setAttribute('name', `out_${row}_${col}`);
		this.eCell.className = 'cell';
		this.eCell.style.top = `calc(var(--y) + var(--h) * ${row})`;
		this.eCell.style.left = `calc(var(--x) + var(--w) * ${col})`;
		grid.appendChild(this.eCell);
	}

	set value(v: string) { this.eCell.value = v || ' '; }

	remove() {
		this.grid.removeChild(this.eCell);
	}
}
