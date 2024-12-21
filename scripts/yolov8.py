#----------------------------------------------------
# YOLOv8 class to train, validate and infer the model
from ultralytics import YOLO
import torch
import cv2
import os
from sys import platform
import tools.tools as utils

class_csv = 'shoot.csv'
window_name='ShootAnalysis'

# out = cv2.VideoWriter('output.mp4', cv2.VideoWriter_fourcc('m', 'p', '4', 'v'), 10, (640, 480))

class YOLOv8:
    def __init__(self, capture_index: str):
        """
        Initialize the YOLOv8 class.
        
        :param capture_index: Index of the capture device or path to the image/video file.
        """
        # check the device if cuda is available use it otherwise use cpu
        # check the platform and use mps to improve performance on mac
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.device = 'mps' if platform == 'darwin' else self.device
        self.capture_index = "0" if capture_index == None else capture_index
        self.CLASS_NAMES_DICT = None
        self.is_model_loaded = False
        # we load the class names from the csv file
        self.shoot_classes = utils.load_labels(class_csv)

    # load given model with YOLO
    def load_model(self, model_path: str = 'yolov8m.pt') -> None:
        """
        Load the YOLO model.

        :param model_path: Path to the model file.
        """
        self.is_model_loaded = True
        self.model = YOLO(model_path)
        # get the class names
        self.CLASS_NAMES_DICT = self.model.model.names
        self.model.fuse()

    # function that trains the model with given parameters
    def train(self, epochs: int = 100, image_size: int = 640, models: str = 'yolov8m.pt', data: str = 'data.yaml', eval: bool = True) -> None:
        """
        Train the YOLO model.

        :param epochs: Number of epochs to train.
        :param image_size: Size of the input images.
        :param models: Path to the model file.
        :param data: Path to the data configuration file.
        :param eval: Whether to evaluate the model after training.
        """
        self.load_model(models)
        self.model.train(data, epochs=epochs, imgsz=image_size, device=self.device)
        if eval:
            self.val()

    # function that validates the model with test dataset
    # with that we can see the model performance and statistics
    def val(self) -> None:
        """
        Validate the YOLO model.
        """
        self.model.val()

    # function that infer given image of video or camera and return the results
    def infer(self, frame: torch.Tensor) -> list:
        """
        Perform inference on a given frame.

        :param frame: Input frame for inference.
        :return: Inference results.
        """
        assert self.is_model_loaded, "Model not loaded"
        return self.model(frame)
    
    def detect(self, image_path: str, save_path: str = 'output.jpg') -> list:
        """
        Detect objects in an image.

        :param image_path: Path to the input image.
        :param save_path: Path to save the output image.
        :return: Detection results.
        """
        assert self.is_model_loaded, "Model not loaded"
        return self.model.predict(image_path, save_path=save_path)

    def plot_result(self, results: list, frame: torch.Tensor) -> torch.Tensor:
        """
        Plot the detection results on the frame.

        :param results: List of detection results.
        :param frame: Input frame.
        :return: Frame with plotted results.
        """
        # loop over the results
        for result in results:
            # extract the boxes from cpu in numpy format for easy access and manipulation
            boxes = result.boxes.cpu().numpy()
            for box in boxes:
                # get the coordinates left top and right bottom of the box
                r = box.xyxy[0].astype(int)
                class_id = int(box.cls[0])  # Get class ID
                class_name = self.CLASS_NAMES_DICT[class_id] # Get class name
                print(f"Class: {class_name}, Box: {r}")
                cv2.rectangle(frame, r[:2], r[2:], (0, 255, 0), 2)

                # save the frame with the class name
                self.save_frame(frame, 'feedback', class_name)
        return frame
    
    def save_frame(self, frame: torch.Tensor, output_path: str, class_name: str) -> None:
        """
        Save the frame with detected objects.

        :param frame: Input frame.
        :param output_path: Path to save the frame.
        :param class_name: Name of the detected class.
        """
        if class_name in self.shoot_classes:
            class_folder = os.path.join(output_path, class_name)
            if not os.path.exists(class_folder):
                os.makedirs(class_folder)
            print(f"Saving frame with class {class_name}")
            img_id = len(os.listdir(class_folder)) + 1
            cv2.imwrite(f"{class_folder}/{class_name}_{img_id}.jpg", frame)
        else:
            print(f"Class {class_name} not found in the class csv file")

    def capture(self) -> None:
        """
        Capture and process frames from the input source.
        """
        # check if is an image or video
        if utils.check_fileType(self.capture_index) == 'image':
            frame = cv2.imread(self.capture_index)
            results = self.infer(frame)
            self.plot_result(results, frame)
        elif utils.check_fileType(self.capture_index) == 'video':
            cap = cv2.VideoCapture(self.capture_index)
            while cap.isOpened():
                success, frame = cap.read()
                if success:
                    results = self.infer(frame)
                    self.plot_result(results, frame)
                    cv2.imshow(window_name, frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                else:
                    break
            cap.release()
            cv2.destroyAllWindows()

if __name__ == '__main__':
    yolo = YOLOv8(capture_index='videos/pro.mov')
    yolo.load_model('best.pt')
    yolo.capture()
#------------------------------------------------
