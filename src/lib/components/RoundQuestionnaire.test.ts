import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import RoundQuestionnaire from './RoundQuestionnaire.svelte';
import type { Player } from '$lib/game/types';

function createTestPlayers(): Player[] {
	return [
		{ id: 'p1', name: 'Alice', role: 'impostor', word: null, score: 0 },
		{ id: 'p2', name: 'Bob', role: 'regular', word: 'Dog', score: 0 },
		{ id: 'p3', name: 'Charlie', role: 'regular', word: 'Dog', score: 0 },
		{ id: 'p4', name: 'Diana', role: 'regular', word: 'Dog', score: 0 }
	];
}

function getBackButton() {
	return screen.getByRole('button', { name: '←' });
}

function getNextButton() {
	return screen.getByRole('button', { name: '→' });
}

function getYesButton() {
	return screen.getByRole('button', { name: 'Sí' });
}

function getNoButton() {
	return screen.getByRole('button', { name: 'No' });
}

describe('RoundQuestionnaire Navigation', () => {
	describe('Initial state (Question 0)', () => {
		it('Disables back button on first question', () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			expect(getBackButton()).toBeDisabled();
		});

		it('Disables next button when no answer selected', () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			expect(getNextButton()).toBeDisabled();
		});

		it('Enables next button when Yes is selected', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			await fireEvent.click(getYesButton());

			expect(getNextButton()).not.toBeDisabled();
		});

		it('Keeps next button disabled when No is selected (no more questions)', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			await fireEvent.click(getNoButton());

			expect(getNextButton()).toBeDisabled();
		});
	});

	describe('Navigation flow when impostor expelled', () => {
		it('Navigates to question 1 (expellers) after selecting Yes', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());

			expect(screen.getByText('¿Quién expulsó al impostor?')).toBeInTheDocument();
		});

		it('Enables back button on question 1', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());

			expect(getBackButton()).not.toBeDisabled();
		});

		it('Returns to question 0 when clicking back from question 1', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());
			await fireEvent.click(getBackButton());

			expect(screen.getByText('¿Fue expulsado el impostor?')).toBeInTheDocument();
		});

		it('Disables next button on question 1 until expeller selected', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());

			expect(getNextButton()).toBeDisabled();
		});

		it('Enables next button on question 1 after selecting expeller', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());

			const bobButton = screen.getByRole('button', { name: 'Bob' });
			await fireEvent.click(bobButton);

			expect(getNextButton()).not.toBeDisabled();
		});

		it('Navigates through all 4 questions when impostor expelled', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			// Q0: Was impostor expelled? -> Yes
			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());

			// Q1: Who expelled? -> Select Bob
			const bobButton = screen.getByRole('button', { name: 'Bob' });
			await fireEvent.click(bobButton);
			await fireEvent.click(getNextButton());

			// Q2: Rounds survived
			expect(screen.getByText('¿Cuántas rondas sobrevivió el impostor?')).toBeInTheDocument();
			await fireEvent.click(getNextButton());

			// Q3: Did impostor guess word?
			expect(screen.getByText('¿Adivinó la palabra el impostor?')).toBeInTheDocument();
		});

		it('Disables next button on last question (question 3)', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			// Navigate to Q3
			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());
			const bobButton = screen.getByRole('button', { name: 'Bob' });
			await fireEvent.click(bobButton);
			await fireEvent.click(getNextButton());
			await fireEvent.click(getNextButton());

			expect(getNextButton()).toBeDisabled();
		});
	});

	describe('Player filtering on expellers question', () => {
		it('Shows only regular players, not the impostor', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());

			// Regular players should be visible
			expect(screen.getByRole('button', { name: 'Bob' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Charlie' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Diana' })).toBeInTheDocument();

			// Impostor should NOT be visible
			expect(screen.queryByRole('button', { name: 'Alice' })).not.toBeInTheDocument();
		});

		it('Allows selecting multiple expellers', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());

			const bobButton = screen.getByRole('button', { name: 'Bob' });
			const charlieButton = screen.getByRole('button', { name: 'Charlie' });

			await fireEvent.click(bobButton);
			await fireEvent.click(charlieButton);

			// Both should be selectable (next button enabled means selection works)
			expect(getNextButton()).not.toBeDisabled();
		});

		it('Toggles expeller selection on repeated clicks', async () => {
			render(RoundQuestionnaire, { props: { players: createTestPlayers() } });

			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());

			const bobButton = screen.getByRole('button', { name: 'Bob' });

			// Select Bob
			await fireEvent.click(bobButton);
			expect(getNextButton()).not.toBeDisabled();

			// Deselect Bob
			await fireEvent.click(bobButton);
			expect(getNextButton()).toBeDisabled();
		});
	});

	describe('getRoundResult', () => {
		it('Returns correct result when impostor not expelled', async () => {
			const { component } = render(RoundQuestionnaire, {
				props: { players: createTestPlayers() }
			});

			await fireEvent.click(getNoButton());

			const result = component.getRoundResult();
			expect(result.impostorExpelled).toBe(false);
		});

		it('Returns correct result after full questionnaire', async () => {
			const { component } = render(RoundQuestionnaire, {
				props: { players: createTestPlayers() }
			});

			// Q0: Yes
			await fireEvent.click(getYesButton());
			await fireEvent.click(getNextButton());

			// Q1: Select expeller (Bob)
			await fireEvent.click(screen.getByRole('button', { name: 'Bob' }));
			await fireEvent.click(getNextButton());

			// Q2: Rounds survived (default 0)
			await fireEvent.click(getNextButton());

			// Q3: Did impostor guess? -> Yes
			await fireEvent.click(getYesButton());

			const result = component.getRoundResult();
			expect(result.impostorExpelled).toBe(true);
			expect(result.expellers).toContain('p2'); // Bob's id
			expect(result.roundsSurvived).toBe(0);
			expect(result.impostorGuessedWord).toBe(true);
		});
	});
});
