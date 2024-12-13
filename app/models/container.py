import json

from typing import List, Optional, Union, Dict
from .legend import LegendItem, Legend
from .range import Range


class Container:
    def __init__(self, name: str):
        self.name = name
        self.items: Dict[str, Union['Container', Range]] = {}

    def add_item(self, item: Union['Container', Range]) -> None:
        self.items[item.name] = item

    def remove_item(self, name: str) -> None:
        if name in self.items:
            del self.items[name]

    def get_item(self, name: str) -> Optional[Union['Container', Range]]:
        return self.items.get(name)

    def get_path(self, path: List[str]) -> Optional[Union['Container', Range]]:
        if not path:
            return self

        current_item = self.get_item(path[0])
        if not current_item:
            return None

        if len(path) == 1:
            return current_item

        if isinstance(current_item, Container):
            return current_item.get_path(path[1:])

        return None

    def to_dict(self) -> Dict:

        def to_dict(self) -> Dict:
            return {
                "type": "container",
                "name": self.name,
                "items": {name: item.to_dict() for name, item in self.items.items()}
            }

    def save_to_json(self, filename: str) -> None:
        with open(filename, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def load_from_json(cls, filename: str) -> 'Container':
        with open(filename, 'r') as f:
            data = json.load(f)
        return cls.from_dict(data)

    @classmethod
    def from_dict(cls, data: Dict) -> Union['Container', Range]:
        if data["type"] == "container":
            container = cls(data["name"])
            for name, item_data in data["items"].items():
                container.add_item(cls.from_dict(item_data))
            return container
        else:
            legend = Legend()
            for item_data in data["legend"]["items"]:
                legend.add_item(LegendItem(**item_data))

            range = Range(data["name"], legend)
            for i, row in enumerate(data["matrix"]):
                for j, hand_data in enumerate(row):
                    hand = range.matrix[i][j]
                    hand.colors = hand_data["colors"]

            return range
