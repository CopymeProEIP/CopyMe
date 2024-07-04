from ultralytics import YOLO
import argparse
from sys import platform
import torch

class YOLOTrainer:
    def __init__(self, data, epoch, size, mode):
        self.epoch = epoch
        self.size = size
        if platform in ['linux', 'win32'] and torch.cuda.is_available():
            self.device = '0'
        elif platform == 'darwin': # mac os
            self.device = 'mps'
        else:
            self.device = 'cpu'
        print(f'using Device: {self.device}')
        if mode == 'small':
            self.mode = 'n'
        elif mode == 'medium':
            self.mode = 'm'
        else:
            self.mode = 'x'
        self.model = YOLO(f'yolov8{self.mode}.pt')
        self.data = data

    def train(self):
        print(f'Training {self.epoch} epochs')
        self.model.train(data=self.data, epochs=self.epoch, imgsz=self.size, device=self.device)

    def __call__(self):
        self.train()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Dataset Trainer Yolov8 Model')
    parser.add_argument('-d', '--data', type=str, default='data.yaml', help='path to dataset')
    parser.add_argument('-e', '--epochs', type=int, help='Number of epochs', default=100)
    parser.add_argument('-i', '--size', type=int, help='Image size', default=640)
    parser.add_argument('-m', '--mode', type=str, choices=['small', 'medium', 'large'], default='small', help='train mode')
    args = parser.parse_args()
    trainer = YOLOTrainer(args.data, args.epochs, args.size, mode=args.mode)
    trainer()
