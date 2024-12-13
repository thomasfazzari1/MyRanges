from typing import List, Dict


class Hand:
    def __init__(self, display_name: str, treys_name: str):
        self.display_name = display_name
        self.treys_name = treys_name
        self.colors: List[str] = []

    def add_color(self, color: str) -> None:
        self.colors.append(color)

    def clear_colors(self) -> None:
        self.colors.clear()

    def get_colors(self) -> List[str]:
        return self.colors

    def __str__(self) -> str:
        return self.display_name

    def to_dict(self) -> Dict:
        return {
            "display_name": self.display_name,
            "treys_name": self.treys_name,
            "colors": self.colors
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Hand':
        display_name = data.get("display_name")
        treys_name = data.get("treys_name")
        colors = data.get("colors", [])

        hand = cls(display_name, treys_name)
        for color in colors:
            hand.add_color(color)
        return hand
