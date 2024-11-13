# CopyMe

CopyMe is a project aimed at optimizing sports performance, particularly in basketball, using artificial intelligence. This project utilizes the YOLOv8 model for motion detection and analysis.

## Description

The CopyMe project leverages advanced computer vision techniques to analyze basketball players' movements. By using the YOLOv8 model, we can detect and annotate key movements, calculate joint angles, and provide real-time feedback to improve performance.

## Features

- Detection of shooting and dribbling movements
- Annotation of images with key points and angles
- Saving annotated images for later analysis
- Real-time display of results with frames per second (FPS)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/mpJunot/CopyMe.git
   cd Copyme
   ```

2. Install the dependencies:

   ```sh
   pip install -r requirements.txt
   ```

## Usage

### Motion Detection

To run motion detection on a video, use the following command:

```sh
python [alpha.py](http://_vscodecontentref_/0) --video path/to/video.mp4 --model yolov8m.pt --save_dir path/to/save_directory
```
