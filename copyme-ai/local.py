#!/usr/bin/env python3

import logging
from logging_setup import setup_logging
from yolov8_basketball.phase_detection import PhaseDetection
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-a', '--model', type=str, default="model/copyme.pt", help='model path')
    parser.add_argument("-i", "--input", type=str, default="../assets/sample_video.mp4", help="path to image or video")
    parser.add_argument("-o", "--output", type=str, default="../feedback", help="path to output directory")
    parser.add_argument("-m", "--mode", type=str, default="debug", help="mode to run the model")
    args = parser.parse_args()
    # Set up logging
    setup_logging()

    # Get the logger
    logger = logging.getLogger(__name__)

    yolo = PhaseDetection(
        input=args.input,
        save_dir=args.output,
        model_path=args.model,
        kalman_filter=True,
        temporal_smoothing=True,
        verbose=False
    )
    results = yolo.run()
    result = "["
    for i, res in enumerate(results):
        print(f"{res.model_dump_json(indent=4)}")
        if i < len(results) - 1:
            print(",")
    print("]")
