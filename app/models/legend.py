from typing import List, Optional, Dict
from dataclasses import dataclass


@dataclass
class LegendItem:
    color: str
    description: str

    def __str__(self) -> str:
        return f"{self.description} ({self.color})"

    def to_dict(self) -> Dict:
        return {
            "color": self.color,
            "description": self.description
        }


class Legend:
    def __init__(self, items: Optional[List[LegendItem]] = None):
        self.items: List[LegendItem] = items if items is not None else []

    def add_item(self, color: str, description: str) -> None:
        self.items.append({
            "color": color,
            "description": description
        })

    def remove_item(self, index: int) -> None:
        if 0 <= index < len(self.items):
            self.items.pop(index)

    def get_items(self) -> List[LegendItem]:
        return self.items

    def to_dict(self) -> Dict:
        return {
            "items": self.items
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Legend':
        if not isinstance(data, dict):
            raise ValueError("Les données fournies doivent  être un dictionnaire.")

        items = data.get("items", [])
        if not isinstance(items, list):
            raise ValueError("Les items doivent être une liste.")

        legend = cls()
        for item in items:
            color = item.get("color")
            description = item.get("description")
            if color and description:
                legend.add_item(color, description)
        return legend
