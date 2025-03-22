#!/usr/bin/env python3

from yolov8_basketball.yolov8 import YOLOv8
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--input", type=str, default="../assets/follow.jpg", help="path to image or video")
    parser.add_argument("-o", "--output", type=str, default="../feedback", help="path to output directory")
    parser.add_argument("-m", "--mode", type=str, default="debug", help="mode to run the model")
    args = parser.parse_args()

    yolo = YOLOv8(capture_index=args.input, save_path=args.output, mode=args.mode)
    yolo.load_model('model/copyme.pt')
    yolo.load_keypoint_model()
    print(f'results: {yolo.capture()}')