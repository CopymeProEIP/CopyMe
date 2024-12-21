#!/bin/bash

MODEL_PATH="yolov8m.pt"

FRAME_MODEL_PATH='../copyme.pt'

ALPHA_SCRIPT_PATH='alpha.py'

KEY_POINT_PATH='annotate_frame.py'

FRAME_SAVE_DIR="../shoot"

REFERENCE_DIR="../shoot/ref"

ANNOTATED_DIR="../annotate_frames"
mkdir -p $ANNOTATED_DIR

VIDEO_PATH=$1

if [[ -f $1 ]]; then
  VIDEO_PATH=$1
else
  VIDEO_PATH='../max.mp4'
fi

echo -e "Getting frame..."
python $ALPHA_SCRIPT_PATH -v "$VIDEO_PATH" -m $FRAME_MODEL_PATH -s $FRAME_SAVE_DIR
echo -e "Frame saved successfully"

for frame in $FRAME_SAVE_DIR/*.jpg; do
    echo -e "Getting frame..."
    frame_name=$(basename $frame)
    reference_frame="$REFERENCE_DIR/$frame_name"

    if [ -f "$reference_frame" ]; then
        echo -e "Frame annotation ${frame_name} in progress.."
        python $KEY_POINT_PATH --amateur_frame $frame --reference_frame $reference_frame --output_frame "$ANNOTATED_DIR/$frame_name"
        echo -e "Annotation [${reference_frame}] successfully"
    else
        echo -e "No such file or directory"
    fi
done

echo "Analysis and annotation completed. Check the $ANNOTATED_DIR directory for the results."
