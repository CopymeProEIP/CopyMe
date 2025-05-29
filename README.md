# Basketball Free Throw Phases Detection

## Overview

This project focuses on detecting the different phases of a basketball shot using computer vision techniques.

 <p align="center">
   <a href="https://universe.roboflow.com/copyme/shotanalysis">
     <img src="https://app.roboflow.com/images/download-dataset-badge.svg" alt="Download Dataset"/>
   </a> <span>&nbsp;</span> <a href="https://universe.roboflow.com/copyme/shotanalysis/model/">
    <img src="https://app.roboflow.com/images/try-model-badge.svg" alt="Try Model"/>
   </a>
 </p>

## Tools and Technologies

- **Model**: YOLOv8 by Ultralytics ([link](https://docs.ultralytics.com/models/yolov8/))
- **Annotation Tool**: Roboflow ([link](https://www.roboflow.com/))

## Resources

- **Free Throws**: [How to Shoot Free Throws: Perfect Your Form & Shot](https://www.wikihow.com/Shoot-a-Free-Throw)
- **Shoot Analysis**: [Basketball 101: Free Throws](https://youtu.be/TVNZrYdriTM?si=t3HkHX_j3dvFoV8A)

---

## Phases of a Basketball Shot

1. **Preparation**: The player prepares to take the shot.

   <p align="left">
       <img src="https://www.wikihow.com/images/thumb/8/86/Shoot-a-Free-Throw-Step-1-Version-5.jpg/v4-728px-Shoot-a-Free-Throw-Step-1-Version-5.jpg.webp" width="450" alt="preparation phase"/>
   </p>

   - Focus on the target.
   - Grip the ball properly.
   - Align the body.

2. **Position**: The player gets into the correct stance and position.

   <p align="left">
       <img src="https://www.wikihow.com/images/thumb/3/3b/Shoot-a-Three-Pointer-Step-1-Version-7.jpg/aid25450-v4-728px-Shoot-a-Three-Pointer-Step-1-Version-7.jpg.webp" width="450" alt="position phase"/>
   </p>

   - Feet should be shoulder-width apart.
   - Knees slightly bent.
   - Body balanced.

3. **Release**: The ball is released from the player's hands.

   <p align="left">
       <img src="https://www.wikihow.com/images/thumb/3/35/Shoot-a-Three-Pointer-Step-7-Version-7.jpg/aid25450-v4-728px-Shoot-a-Three-Pointer-Step-7-Version-7.jpg.webp" width="450" alt="release phase"/>
   </p>

   - Use a smooth motion.
   - Extend the shooting arm.
   - Snap the wrist.

4. **Follow-through**: The player's hands follow through after releasing the ball.

   <p align="left">
       <img src="https://www.wikihow.com/images/thumb/b/bb/Shoot-a-Free-Throw-Step-11-Version-5.jpg/v4-728px-Shoot-a-Free-Throw-Step-11-Version-5.jpg.webp" width="450" alt="follow through"/>
   </p>

   > Be careful not to twist your wrist as you snap it forward, or else the ball may angle away from the hoop.

   - Maintain balance.
   - Keep eyes on the target.
   - Hold the follow-through position.

## Steps to Train the Model

1. **Data Collection**: Collect videos of basketball shots.
2. **Annotation**: Use Roboflow to annotate the different phases in the videos.
3. **Training**: Train the YOLOv8 model with the annotated data.
4. **Evaluation**: Evaluate the model's performance on a test dataset.
5. **Deployment**: Deploy the model for real-time phase detection.

---

## References

- [YOLOv8](https://docs.ultralytics.com/)
- [Roboflow](https://docs.roboflow.com/)
