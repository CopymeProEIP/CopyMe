
from ultralytics import YOLO

model_path='../copyme.pt'

model = YOLO(model_path).to('cuda')

results = model('toto.mp4', save=True)

for result in results:
    result.save(filename='res.mov')
