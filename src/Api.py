import os
from flask import Flask, request, jsonify, send_file
from yolov8 import YOLOv8
from recommendation_engine import analyze_phase
from flask_cors import CORS
from pymongo import MongoClient
import logging
from bson import ObjectId

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
assert os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


client = MongoClient("mongodb+srv://copyme:dgg5kQCAVmGoJ4qD@cluster0.iea0zmj.mongodb.net/CopyMe?retryWrites=true&w=majority&appName=Cluster0")
db = client["CopyMe"]

angle_collections = []

@app.route('/demo', methods=['POST'])
def demo():
    try:
        if 'image' not in request.files:
            logging.error("No image sent.")
            return jsonify({"status": "error", "message": "No image sent."}), 400

        file = request.files['image']
        if file.filename == '':
            logging.error("No file selected.")
            return jsonify({"status": "error", "message": "No file selected."}), 400

        # Save the image
        filename = file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        logging.info(f"Saving image to: {file_path}")
        file.save(file_path)

        # Run YOLOv8
        logging.info("Loading YOLO model...")
        yolo = YOLOv8(capture_index=file_path, save_path="feedback", mode="debug")
        yolo.load_model('model/copyme.pt')
        yolo.load_keypoint_model()
        yolo.capture()
        logging.info("YOLO processing completed.")

        collection_name = "processed_image"
        collection = db[collection_name]

        latest_data = collection.find_one({"url": f"./uploads/{filename}"}, sort=[("_id", -1)])

        # Search for the document corresponding to the specified video
        if not latest_data:
            logging.exception("No data available for this video.")
            return jsonify({"status": "error", "message": "No data available for this video."}), 404

        latest_data["_id"] = str(latest_data["_id"])

        frames_entry = latest_data.get('frames', [])
        if not frames_entry:
            logging.exception("No data in frames.")
            return jsonify({"status": "error", "message": "No data in frames."}), 404

        # Update frames with feedbacks
        updated_frames = []

        for frame in frames_entry:
            data_entry = frame.get('data', [])
            updated_data = []

            if not data_entry:
                continue  # If 'data' is empty or missing in this frame, skip to the next

            for document in data_entry:
                class_name = document.get("class_name")
                measured_angles = document.get("angles")

                if not class_name or not measured_angles:
                    updated_data.append(document)  # If class_name or angles are missing, skip to the next element
                    continue

                phase_data = None
                if class_name == 'shot_position':
                    phase_data = reference_data[0]
                elif class_name == 'shot_realese':
                    phase_data = reference_data[1]
                else:
                    phase_data = reference_data[2]

                if phase_data and len(measured_angles) >= 4:
                    result_messages = analyze_phase({
                        "hip": int(measured_angles[0]['angle']),
                        "knee": int(measured_angles[1]['angle']),
                        "ankle": int(measured_angles[2]['angle']),
                        "elbow": int(measured_angles[3]['angle']),
                    }, phase_data)

                    document['feedback'] = result_messages  # Add the analysis feedback to the document
                updated_data.append(document)

            updated_frame = frame.copy()
            updated_frame['data'] = updated_data
            updated_frames.append(updated_frame)
        # Update the document with the modified frames
        collection.update_one(
            {"_id": ObjectId(latest_data["_id"])},
            {"$set": {"frames": updated_frames}}  # Update with the modified frames
        )

        return jsonify({"status": "success", "message": "Image processed successfully."}), 200

    except Exception as e:
        logging.exception("Error in /demo")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/image', methods=['GET'])
def serve_image_with_param():
    try:
        # Get the 'filename' parameter from the request
        filename = request.args.get('filename')
        if not filename:
            return jsonify({"status": "error", "message": "The 'filename' parameter is required."}), 400

        # Build the file path
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            logging.error(f"File not found: {file_path}")
            return jsonify({"status": "error", "message": "File not found."}), 404

        # Send the file if found
        return send_file(file_path, mimetype='image/jpeg')
    except Exception as e:
        logging.exception("Error in /image")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/latest-angle-collection', methods=['GET'])
def latest_angle_collection():
    try:
        video = request.args.get('video')
        print(f"Video parameter: {video}")
        if not video:
            return jsonify({"status": "error", "message": "The 'video' parameter is required."}), 400

        collection = db["processed_image"]

        latest_data = collection.find_one({"url": f"./uploads/{video}"}, sort=[("_id", -1)])

        # Search for the document corresponding to the specified video
        if not latest_data:
            logging.exception("No data available for this video.")
            return jsonify({"status": "error", "message": "No data available for this video."}), 404

        # Convert the ObjectId to a string for display
        latest_data["_id"] = str(latest_data["_id"])

        return jsonify({"status": "success", "data": latest_data}), 200

    except Exception as e:
        logging.exception("Error in /latest-angle-collection")
        return jsonify({"status": "error", "message": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)