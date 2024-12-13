from flask import Blueprint, jsonify, request
from ..services import FileService, EquityService

api = Blueprint('api', __name__)


@api.route("/directory/")
@api.route("/directory/<path:subpath>")
def get_directory(subpath=""):
    path = subpath.split('/') if subpath else []
    container = FileService.get_container_at_path(path)

    if container is None:
        return jsonify({"error": "Chemin non trouvé"}), 404

    return jsonify(container["items"])


@api.route("/create", methods=["POST"])
def create_item():
    data = request.json
    path = data.get("path", [])
    name = data.get("name")
    item_type = data.get("type")

    if not name or not item_type:
        return jsonify({"error": "Champs requis manquants"}), 400

    success = FileService.create_item(path, name, item_type)
    return jsonify({"success": success})


@api.route("/delete", methods=["POST"])
def delete_item():
    data = request.json
    path = data.get("path", [])
    name = data.get("name")

    if not name:
        return jsonify({"error": "Champs requis manquants"}), 400

    success = FileService.delete_item(path, name)
    if success:
        return jsonify({"success": True})
    return jsonify({"error": "Élément non trouvé"}), 404


@api.route("/rename", methods=["POST"])
def rename_item():
    data = request.json
    path = data.get("path", [])
    old_name = data.get("oldName")
    new_name = data.get("newName")

    if not old_name or not new_name:
        return jsonify({"error": "Champs requis manquants"}), 400

    success = FileService.rename_item(path, old_name, new_name)
    if success:
        return jsonify({"success": True})
    return jsonify({"error": "Élément non trouvé"}), 404


@api.route("/range", methods=["POST"])
def get_range():
    data = request.json
    path = data.get("path", [])
    name = data.get("name")

    if not name:
        return jsonify({"error": "Champs requis manquants"}), 400

    range_obj = FileService.get_range(path, name)

    if range_obj is None:
        return jsonify({"error": "Range non trouvé"}), 404

    return jsonify(range_obj.to_dict())


@api.route("/update_legend", methods=["POST"])
def update_legend():
    data = request.json
    path = data.get("path", [])
    name = data.get("name")
    legend_index = data.get("index")
    new_color = data.get("color")
    new_description = data.get("description")
    new_hands = data.get("hands")

    if name is None or legend_index is None:
        return jsonify({"error": "Champs requis manquants"}), 400

    file_data = FileService.read_json()

    current = file_data
    for segment in path:
        if "items" in current and segment in current["items"]:
            current = current["items"][segment]
        else:
            return jsonify({"error": "Chemin non trouvé"}), 404

    if name not in current.get("items", {}):
        return jsonify({"error": "Range non trouvé"}), 404

    range_data = current["items"][name]
    if "legend" not in range_data or "items" not in range_data["legend"]:
        return jsonify({"error": "Légende non trouvée"}), 404

    try:
        legend_item = range_data["legend"]["items"][legend_index]
        old_color = legend_item.get("color")

        if new_color:
            legend_item["color"] = new_color
        if new_description:
            legend_item["description"] = new_description

        if new_hands is not None:
            if old_color:
                for row in range_data["matrix"]:
                    for cell in row:
                        if "colors" in cell and old_color in cell["colors"]:
                            cell["colors"].remove(old_color)

            hands_set = set(new_hands)
            for row in range_data["matrix"]:
                for cell in row:
                    if cell["display_name"] in hands_set:
                        if "colors" not in cell:
                            cell["colors"] = []
                        if legend_item["color"] not in cell["colors"]:
                            cell["colors"].append(legend_item["color"])

        if new_color and old_color and old_color != new_color:
            for row in range_data["matrix"]:
                for cell in row:
                    if "colors" in cell and old_color in cell["colors"]:
                        cell["colors"] = [
                            new_color if c == old_color else c
                            for c in cell["colors"]
                        ]

        FileService.write_json(file_data)

        return jsonify({"success": True, "updated_legend": legend_item})
    except IndexError:
        return jsonify({"error": "Index de légende hors limites"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/add_legend_item", methods=["POST"])
def add_legend_item():
    data = request.json
    path = data.get("path", [])
    name = data.get("name")
    color = data.get("color")
    description = data.get("description")

    if not name or not color or not description:
        return jsonify({"error": "Champs requis manquants"}), 400

    success = FileService.add_legend_item(path, name, color, description)
    if success:
        return jsonify({"success": True})
    return jsonify({"error": "Échec de l'ajout de l'élément de légende"}), 500


@api.route("/delete_legend_item", methods=["POST"])
def delete_legend_item():
    data = request.json
    path = data.get("path", [])
    name = data.get("name")
    index = data.get("index")

    if name is None or index is None:
        return jsonify({"error": "Champs requis manquants"}), 400

    success = FileService.delete_legend_item(path, name, index)
    if success:
        return jsonify({"success": True})
    return jsonify({"error": "Échec de la suppression de l'élément de légende"}), 500


@api.route("/calculate_equity", methods=["POST"])
def calculate_equity():
    try:
        data = request.json
        hands = data.get("hands", [])
        board = data.get("board", [])
        iterations = data.get("iterations", 10000)

        if not hands or len(hands) < 2:
            return jsonify({"error": "Au moins deux mains sont requises"}), 400

        print(f"Calcul des équités pour les mains : {hands} avec le tableau : {board}")
        equity_service = EquityService()
        result = equity_service.calculate_equity(hands, board, iterations)
        return jsonify(result.to_dict())
    except Exception as e:
        print(f"Erreur dans calculate_equity : {str(e)}")
        return jsonify({"error": str(e)}), 500
