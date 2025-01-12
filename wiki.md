# Basketball Shot Phase Detection

## Overview

This project focuses on detecting the different phases of a basketball shot using computer vision techniques.

## Resources

- **Model**: YOLOv8
- **Annotation Tool**: Roboflow
- **Phases Analysis**: [Analysis of Shooting a Free Throw](https://amandastowe.weebly.com/uploads/1/6/6/8/16683754/analysis_of_shooting_a_free_throw.pdf)
- **Shoot Analysis**: [Basketball 101: Free Throws](https://youtu.be/TVNZrYdriTM)

## Phases of a Basketball Shot

1. **Position**: The player gets into the correct stance and position.
   - Feet should be shoulder-width apart.
   - Knees slightly bent.
   - Body balanced.
2. **Preparation**: The player prepares to take the shot.
   - Focus on the target.
   - Grip the ball properly.
   - Align the body.
3. **Release**: The ball is released from the player's hands.
   - Use a smooth motion.
   - Extend the shooting arm.
   - Snap the wrist.
4. **Follow-through**: The player's hands follow through after releasing the ball.
   - Maintain balance.
   - Keep eyes on the target.
   - Hold the follow-through position.

## Tools and Technologies

- **YOLOv8**: Used for training the model to detect the different phases.
- **Roboflow**: Used for annotating the training data.

## Steps to Train the Model

1. **Data Collection**: Collect videos of basketball shots.
2. **Annotation**: Use Roboflow to annotate the different phases in the videos.
3. **Training**: Train the YOLOv8 model with the annotated data.
4. **Evaluation**: Evaluate the model's performance on a test dataset.
5. **Deployment**: Deploy the model for real-time phase detection.

## References

- [YOLOv8 Documentation](https://github.com/ultralytics/yolov8)
- [Roboflow Documentation](https://roboflow.com/docs)
