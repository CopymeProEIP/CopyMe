start:
	$(SHELL) -c "conda create -n copyme-env -y && \
		source /opt/anaconda3/etc/profile.d/conda.sh && \
		conda activate copyme-env && \
		conda config --env --add channels conda-forge && \
		conda install -y pytorch torchvision torchaudio -c pytorch && \
		pip install -r requirements.txt"

