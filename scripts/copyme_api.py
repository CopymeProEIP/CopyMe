import os
from flask import Flask, request, jsonify, send_file
from yolov8 import YOLOv8
from recommendation_engine import analyze_phase
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
        yolo.load_model('model/copyme.pt')
        yolo.load_keypoint_model()
        yolo.capture()
        logging.info("Traitement YOLO terminé.")

        return jsonify({"status": "success", "message": "L'image a été traitée avec succès."}), 200
    except Exception as e:
        logging.exception("Erreur dans /demo")
        return jsonify({"status": "error", "message": str(e)}), 500



@app.route('/image', methods=['GET'])
def serve_image_with_param():
    try:
        # Récupérer le paramètre 'filename' de la requête
        filename = request.args.get('filename')
        if not filename:
            return jsonify({"status": "error", "message": "Le paramètre 'filename' est requis."}), 400

        # Construire le chemin vers le fichier
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            logging.error(f"Fichier non trouvé : {file_path}")
            return jsonify({"status": "error", "message": "Fichier non trouvé."}), 404

        # Envoyer le fichier si trouvé
        return send_file(file_path, mimetype='image/jpeg')
    except Exception as e:
        logging.exception("Erreur dans /image")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/latest-angle-collection', methods=['GET'])
def latest_angle_collection():
    try:
        video = request.args.get('video')
        print(f"Video parameter: {video}")
        if not video:
            return jsonify({"status": "error", "message": "Le paramètre 'video' est requis."}), 400

        collection_name = "processed_image"
        collection = db[collection_name]

        # Recherche du document correspondant à la vidéo spécifiée
        latest_data = collection.find_one({"url": f"./uploads/{video}"}, sort=[("_id", -1)])
        if not latest_data:
            logging.exception("Aucune donnée disponible pour cette vidéo.")
            return jsonify({"status": "error", "message": "Aucune donnée disponible pour cette vidéo."}), 404

        # Convertir l'ObjectId en chaîne de caractères pour l'affichage
        latest_data["_id"] = str(latest_data["_id"])

        # Accéder au tableau 'data' et récupérer le dernier document
        data_entry = latest_data.get('data', [])
        if not data_entry:
            return jsonify({"status": "error", "message": "Aucune donnée d'angle trouvée."}), 404

        # Récupérer le dernier document dans le tableau 'data'
        document = data_entry[-1]  # Dernier document dans le tableau 'data'

        # Extraire 'class_name' et les angles mesurés
        class_name = document.get("class_name")
        measured_angles = document.get("angles")

        if not class_name or not measured_angles:
            return jsonify({"status": "error", "message": "'class_name' ou 'angles' manquants dans les données."}), 400

        # Trouver les données de référence associées à la phase actuelle
        phase_data = None
        if class_name == 'shot_position':
            phase_data = reference_data[0]
        elif class_name == 'shot_realese':
            phase_data = reference_data[1]
        else:
            phase_data = reference_data[2]

        if phase_data:
            # Analyser les angles mesurés par rapport aux données de référence
            result_messages = analyze_phase({
                "hip": int(measured_angles[0]['angle']),
                "knee": int(measured_angles[1]['angle']),
                "ankle": int(measured_angles[2]['angle']),
                "elbow": int(measured_angles[3]['angle']),
            }, phase_data)
            document['feedback'] = result_messages  # Ajouter le retour de l'analyse dans le document retourné

        latest_data['data'] = document  # Mettre à jour 'data' avec le feedback

        return jsonify({"status": "success", "data": latest_data}), 200

    except Exception as e:
        logging.exception("Erreur dans /latest-angle-collection")
        return jsonify({"status": "error", "message": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)