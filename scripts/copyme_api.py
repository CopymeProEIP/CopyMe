import os
from flask import Flask, request, jsonify, send_file
from yolov8 import YOLOv8
from flask_cors import CORS
from pymongo import MongoClient
import logging


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
        collection_name = "angles_collection"
        collection = db[collection_name]

        latest_data = collection.find_one(sort=[("_id", -1)])
        if not latest_data:
            return jsonify({"status": "error", "message": "Aucune collection d'angles disponible."}), 404

        # Convertir l'ObjectId en chaîne de caractères
        latest_data["_id"] = str(latest_data["_id"])
        return jsonify({"status": "success", "data": latest_data}), 200
    except Exception as e:
        logging.exception("Erreur dans /latest-angle-collection")
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)