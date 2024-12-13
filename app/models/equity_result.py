from typing import List, Dict


class EquityResult:
    def __init__(self, hand_equities: List[float], iterations: int):
        self.hand_equities = hand_equities
        self.iterations = iterations

    def to_dict(self) -> Dict:
        return {
            "hand_equities": self.hand_equities,
            "iterations": self.iterations
        }
