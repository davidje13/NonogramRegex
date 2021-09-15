import CommonForm from './CommonForm';
import { elNamed, display } from '../utils';

export default class FormSingle extends CommonForm {
	override refresh() {
		try {
			const result = this.patternCache.get(this.pattern).reverse(this.input, '?');
			if (result === null) {
				this.output = '';
				this.error = 'No match';
			} else {
				this.output = display(String(result));
				this.error = null;
			}
		} catch (e: unknown) {
			this.output = '';
			this.error = String(e);
		}
	}

	private get pattern() { return this.ePattern.value; }
	private get input() { return this.eInput.value; }
	private set output(v: string) { this.eOutput.value = v || ' '; }
	private set error(v: string | null) {
		if (v !== null) {
			this.form.classList.add('fail');
		} else {
			this.form.classList.remove('fail');
		}
		this.eError.innerText = v ?? '';
	}

	private readonly ePattern = elNamed(this.form, 'pattern') as HTMLInputElement;
	private readonly eInput = elNamed(this.form, 'input') as HTMLInputElement;
	private readonly eOutput = elNamed(this.form, 'output') as HTMLOutputElement;
	private readonly eError = this.form.querySelector('.error') as HTMLElement;
}
