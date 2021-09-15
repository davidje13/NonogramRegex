export function el(id: string) {
	return document.getElementById(id)!;
}

export function elNamed(base: HTMLElement, name: string) {
	return base.querySelector(`[name="${name}"]`)!;
}

export function display(v: string): string {
	return v
		.replace(/\u0000/g, '\u2400')
		.replace(/\u0001/g, '\u2401')
		.replace(/\u0002/g, '\u2402')
		.replace(/\u0003/g, '\u2403')
		.replace(/\u0004/g, '\u2404')
		.replace(/\u0005/g, '\u2405')
		.replace(/\u0006/g, '\u2406')
		.replace(/\u0007/g, '\u2407')
		.replace(/\u0008/g, '\u2408')
		.replace(/\u0009/g, '\u2409')
		.replace(/\u000A/g, '\u240A')
		.replace(/\u000B/g, '\u240B')
		.replace(/\u000C/g, '\u240C')
		.replace(/\u000D/g, '\u240D')
		.replace(/\u000E/g, '\u240E')
		.replace(/\u000F/g, '\u240F')
		.replace(/\u0010/g, '\u2410')
		.replace(/\u0011/g, '\u2411')
		.replace(/\u0012/g, '\u2412')
		.replace(/\u0013/g, '\u2413')
		.replace(/\u0014/g, '\u2414')
		.replace(/\u0015/g, '\u2415')
		.replace(/\u0016/g, '\u2416')
		.replace(/\u0017/g, '\u2417')
		.replace(/\u0018/g, '\u2418')
		.replace(/\u0019/g, '\u2419')
		.replace(/\u001A/g, '\u241A')
		.replace(/\u001B/g, '\u241B')
		.replace(/\u001C/g, '\u241C')
		.replace(/\u001D/g, '\u241D')
		.replace(/\u001E/g, '\u241E')
		.replace(/\u001F/g, '\u241F')
		.replace(/\s/g, '\u2420');
}
