import random
from typing import List

from treys import Card, Evaluator

from app.models import EquityResult


class EquityService:
    def __init__(self):
        self.evaluator = Evaluator()

    def calculate_equity(self, hands: List[List[str]], board: List[str], iterations: int = 10000) -> EquityResult:
        parsed_hands = [[Card.new(card) for card in hand] if hand else None for hand in hands]
        parsed_board = [Card.new(card) for card in board] if board else []

        deck = []
        ranks = '23456789TJQKA'
        suits = 'hdcs'
        for r in ranks:
            for s in suits:
                card = Card.new(f'{r}{s}')
                if all(card not in (hand or []) for hand in parsed_hands) and card not in parsed_board:
                    deck.append(card)

        wins = [0] * len(hands)

        for _ in range(iterations):
            sim_deck = deck.copy()
            sim_board = parsed_board.copy()

            sim_hands = []
            for hand in parsed_hands:
                if hand is None:
                    generated_hand = [sim_deck.pop(random.randint(0, len(sim_deck) - 1)) for _ in range(2)]
                    sim_hands.append(generated_hand)
                else:
                    sim_hands.append(hand)

            while len(sim_board) < 5:
                sim_board.append(sim_deck.pop(random.randint(0, len(sim_deck) - 1)))

            scores = [self.evaluator.evaluate(hand, sim_board) for hand in sim_hands]
            min_score = min(scores)
            winners = [i for i, score in enumerate(scores) if score == min_score]

            for winner in winners:
                wins[winner] += 1 / len(winners)

        equities = [win / iterations * 100 for win in wins]
        return EquityResult(equities, iterations)
