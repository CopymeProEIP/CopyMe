import os
from flask import Flask, request, jsonify, send_file
from scripts.yolov8 import YOLOv8
from scripts.recommendation_engine import analyze_phase
from flask_cors import CORS
from pymongo import MongoClient
import logging

reference_data = [
    {
        "gender": "men",
        "phase": "shot_position",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    },
    {
        "gender": "men",
        "phase": "shot_realese",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    },
    {
        "gender": "men",
        "phase": "shot_followthrough",
        "angles": {
            "hip": {"ref": 158.89, "tolerance": 6.16},
            "knee": {"ref": 116.7, "tolerance": 7.4},
            "ankle": {"ref": 108.39, "tolerance": 10.58},
            "elbow": {"ref": 90, "tolerance": 5},
        },
    }
]


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config["CORS_HEADERS"] = "Content-Type"

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


client = MongoClient("mongodb+srv://copyme:dgg5kQCAVmGoJ4qD@cluster0.iea0zmj.mongodb.net/CopyMe?retryWrites=true&w=majority&appName=Cluster0")
db = client["CopyMe"]

angle_collections = []

@app.route('/demo', methods=['POST'])
def demo():
    try:
        if 'image' not in request.files:
            logging.error("Aucune image envoyée.")
            return jsonify({"status": "error", "message": "Aucune image envoyée."}), 400

        file = request.files['image']
        if file.filename == '':
            logging.error("Aucun fichier sélectionné.")
            return jsonify({"status": "error", "message": "Aucun fichier sélectionné."}), 400

        # Sauvegarder l'image
        filename = file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        logging.info(f"Sauvegarde de l'image dans : {file_path}")
        file.save(file_path)

        # Exécuter YOLOv8
        logging.info("Chargement du modèle YOLO...")
        yolo = YOLOv8(capture_index=file_path, save_path="feedback", mode="debug")
        yolo.load_model('shotv1.pt')
        yolo.load_keypoint_model()
        yolo.capture()
        logging.info("Traitement YOLO terminé.")

        return send_file(file_path, mimetype='image/jpeg')
    except Exception as e:
        logging.exception("Erreur dans /demo")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/latest-angle-collection', methods=['GET'])
def latest_angle_collection():
    try:
        video = request.args.get('video')
        print(f"Video parameter: {video}")
        if not video:
            return jsonify({"status": "error", "message": "Le paramètre 'video' est requis."}), 400

        collection_name = "angles_collection"
        collection = db[collection_name]

        # Recherche des données les plus récentes pour la vidéo spécifiée
        latest_data = collection.find_one({"video": f"./uploads/{video}"}, sort=[("_id", -1)])
        if not latest_data:
            return jsonify({"status": "error", "message": "Aucune donnée disponible pour cette vidéo."}), 404

        # Convertir l'ObjectId en chaîne de caractères
        latest_data["_id"] = str(latest_data["_id"])

        # Vérifier si 'class_name' est présent dans les données
        class_name = latest_data.get("class_name")
        if not class_name:
            return jsonify({"status": "error", "message": "'class_name' est absent des données."}), 400

        # Récupérer la phase et les angles mesurés à partir des données les plus récentes
        measured_angles = latest_data.get('angles')

        # Trouver les données de référence associées à la phase actuelle
        phase_data = None
        if (class_name == 'shot_position'):
            phase_data = reference_data[0]
        elif (class_name == 'shot_realese'):
            phase_data = reference_data[1]
        else:
            phase_data = reference_data[2]

        print("conseil ", measured_angles[0]['angle'])
        if phase_data:
            # Analyser les angles mesurés par rapport aux données de référence
            result_messages = analyze_phase({
                "hip": int(measured_angles[0]['angle']),
                "knee": int(measured_angles[1]['angle']),
                "ankle": int(measured_angles[2]['angle']),
                "elbow": int(measured_angles[3]['angle']),
            }, phase_data)
            latest_data['feedback'] = result_messages  # Ajouter le retour de l'analyse dans les données retournées

        return jsonify({"status": "success", "data": latest_data}), 200

    except Exception as e:
        logging.exception("Erreur dans /latest-angle-collection")
        return jsonify({"status": "error", "message": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)