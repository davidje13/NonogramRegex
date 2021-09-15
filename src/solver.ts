import type RevExp from 'revexp';

function isSolved(data: RevExp.CharacterClass[]) {
	return data.every((c) => c.isSingular());
}

function equals(a: RevExp.CharacterClass[], b: RevExp.CharacterClass[]) {
	if (a.length !== b.length) {
		return false;
	}
	for (let i = 0; i < a.length; ++i) {
		if (!a[i].equals(b[i])) {
			return false;
		}
	}
	return true;
}

export function solve(
	data: RevExp.CharacterClass[],
	clues: Clue[],
): RevExp.CharacterClass[] {
	let previousData = data;
	while (true) {
		const currentData = [...previousData];
		for (const { name, pattern, indices } of clues) {
			const updated = pattern.reverse(indices.map((i) => currentData[i]));
			if (!updated) {
				throw new Error(`Failed to match ${name}`);
			}
			indices.forEach((i, p) => { currentData[i] = updated[p]; });
		}
		if (isSolved(currentData) || equals(previousData, currentData)) {
			return currentData;
		}
		previousData = currentData;
	}
}

export interface Clue {
	name: string;
	pattern: RevExp;
	indices: number[];
}
