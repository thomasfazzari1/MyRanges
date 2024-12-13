import os
import json
from typing import Dict, Optional, List
from ..config import Config
from app.models import Range, Container


class FileService:
    @staticmethod
    def read_json() -> Dict:
        with open(Config.RANGES_FILE, 'r') as f:
            return json.load(f)

    @staticmethod
    def write_json(data: Dict) -> None:
        with open(Config.RANGES_FILE, 'w') as f:
            json.dump(data, f, indent=2)

    @classmethod
    def initialize_ranges_file(cls) -> None:
        Config.ensure_data_dir_exists()

        if not os.path.exists(Config.RANGES_FILE):
            initial_data = {
                "type": "container",
                "name": "Mes Ranges",
                "items": {}
            }
            cls.write_json(initial_data)

    @staticmethod
    def load_root_container() -> Container:
        try:
            return Container.load_from_json(Config.RANGES_FILE)
        except FileNotFoundError:
            return Container("Mes Ranges")

    @classmethod
    def get_container_at_path(cls, path: List[str]) -> Optional[Dict]:
        data = cls.read_json()
        current = data

        for segment in path:
            if "items" in current and segment in current["items"]:
                current = current["items"][segment]
            else:
                return None

        return current

    @classmethod
    def create_item(cls, path: List[str], name: str, item_type: str) -> bool:
        data = cls.read_json()
        current = data

        for segment in path:
            current = current["items"][segment]

        if item_type == "container":
            new_item = {
                "type": "container",
                "name": name,
                "items": {}
            }
        else:
            new_item = {
                "type": "range",
                "name": name,
                "legend": {
                    "items": [
                        {
                            "color": "#FF9800",
                            "description": "Call"
                        },
                        {
                            "color": "#2196F3",
                            "description": "Raise"
                        },
                        {
                            "color": "#4CAF50",
                            "description": "All in"
                        }
                    ]
                },
                "matrix": cls._create_empty_matrix()
            }

        current["items"][name] = new_item
        cls.write_json(data)
        return True

    @classmethod
    def delete_item(cls, path: List[str], name: str) -> bool:
        data = cls.read_json()
        current = data

        for segment in path:
            if "items" in current and segment in current["items"]:
                current = current["items"][segment]
            else:
                return False

        if name in current["items"]:
            del current["items"][name]
            cls.write_json(data)
            return True

        return False

    @staticmethod
    def _create_empty_matrix() -> List[List[Dict]]:
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

                hand = {
                    "display_name": display_name,
                    "treys_name": treys_name,
                    "colors": []
                }
                row.append(hand)
            matrix.append(row)

        return matrix

    @classmethod
    def rename_item(cls, path: List[str], old_name: str, new_name: str) -> bool:
        data = cls.read_json()
        current = data

        for segment in path:
            current = current["items"].get(segment, {})

        if old_name in current["items"]:
            current["items"][new_name] = current["items"].pop(old_name)
            cls.write_json(data)
            return True

        return False

    @staticmethod
    def get_range(path: List[str], name: str) -> Optional[Range]:
        container_dict = FileService.get_container_at_path(path)
        if container_dict is None:
            return None

        item_dict = container_dict.get("items", {}).get(name)
        if item_dict is None:
            return None

        if item_dict.get("type") == "range":
            range_instance = Range.from_dict(item_dict)
            return range_instance
        else:
            return None

    @classmethod
    def add_legend_item(cls, path: List[str], name: str, color: str, description: str) -> bool:
        data = cls.read_json()
        current = data

        for segment in path:
            if "items" in current and segment in current["items"]:
                current = current["items"][segment]
            else:
                return False

        if name not in current["items"]:
            return False

        range_data = current["items"][name]

        if "legend" not in range_data or "items" not in range_data["legend"]:
            return False

        new_legend_item = {
            "color": color,
            "description": description
        }
        range_data["legend"]["items"].append(new_legend_item)

        cls.write_json(data)
        return True

    @classmethod
    def delete_legend_item(cls, path: List[str], name: str, index: int) -> bool:
        data = cls.read_json()
        current = data

        for segment in path:
            if "items" in current and segment in current["items"]:
                current = current["items"][segment]
            else:
                return False

        if name not in current["items"]:
            return False

        range_data = current["items"][name]

        if "legend" not in range_data or "items" not in range_data["legend"]:
            return False

        legend_items = range_data["legend"]["items"]
        if index < 0 or index >= len(legend_items):
            return False

        old_color = legend_items[index]["color"]

        del legend_items[index]

        for row in range_data["matrix"]:
            for cell in row:
                if "colors" in cell and old_color in cell["colors"]:
                    cell["colors"].remove(old_color)

        cls.write_json(data)
        return True
