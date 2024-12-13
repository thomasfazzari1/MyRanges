from typing import List, Optional, Dict
from .legend import Legend
from .hand import Hand


class Range:
    def __init__(self, name: str, legend: Optional[Legend] = None):
        self.name = name
        self.legend = legend if legend is not None else Legend()
        self.matrix: List[List[Hand]] = self._initialize_matrix()

    @staticmethod
    def _initialize_matrix() -> List[List[Hand]]:
        ranks = "AKQJT98765432"
        matrix = []

        for i, rank1 in enumerate(ranks):
            row = []
            for j, rank2 in enumerate(ranks):
                if i == j:
                    display_name = f"{rank1}{rank1}"
                    treys_name = f"{rank1}h{rank1}d"
                elif i < j:
                    display_name = f"{rank1}{rank2}s"
                    treys_name = f"{rank1}h{rank2}h"
                else:
                    display_name = f"{rank2}{rank1}o"
                    treys_name = f"{rank2}h{rank1}d"

                row.append(Hand(display_name, treys_name))
            matrix.append(row)

        return matrix

    def get_hand(self, row: int, col: int) -> Optional[Hand]:
        if 0 <= row < 13 and 0 <= col < 13:
            return self.matrix[row][col]
        return None

    def get_hand_by_name(self, display_name: str) -> Optional[Hand]:
        for row in self.matrix:
            for hand in row:
                if hand.display_name == display_name:
                    return hand
        return None

    def get_display_matrix(self) -> List[List[str]]:
        return [[hand.display_name for hand in row] for row in self.matrix]

    def get_treys_matrix(self) -> List[List[str]]:
        return [[hand.treys_name for hand in row] for row in self.matrix]

    def set_hand_colors(self, display_name: str, colors: List[str]) -> None:
        hand = self.get_hand_by_name(display_name)
        if hand:
            hand.clear_colors()
            for color in colors:
                hand.add_color(color)

    def to_dict(self) -> Dict:
        hands_played = [
            hand.to_dict() for row in self.matrix for hand in row if hand.colors
        ]

        return {
            "type": "range",
            "name": self.name,
            "legend": self.legend.to_dict(),
            "matrix": [[hand.to_dict() for hand in row] for row in self.matrix],
            "hands": hands_played
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Range':
        if not isinstance(data, dict):
            raise ValueError("Les données doivent être un dictionnaire.")

        name = data.get("name")
        if not name:
            raise ValueError("Le nom de la range est requis.")

        legend_data = data.get("legend", {})
        legend = Legend.from_dict(legend_data)

        matrix_data = data.get("matrix", [])
        if not isinstance(matrix_data, list):
            raise ValueError("La matrice doit être une liste de listes.")

        matrix = []
        for row in matrix_data:
            if not isinstance(row, list):
                raise ValueError("Chaque ligne de la matrice doit être une liste.")
            matrix_row = [Hand.from_dict(hand_data) for hand_data in row]
            matrix.append(matrix_row)

        range_instance = cls(name=name, legend=legend)
        range_instance.matrix = matrix
        return range_instance
