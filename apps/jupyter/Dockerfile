FROM node

RUN apt-get update
RUN apt-get install -y python3-pip
RUN pip install jupyter jupyterlab jupyter-packaging numpy pandas matplotlib openpyxl

RUN git clone https://github.com/niklaskorz/puredit.git /build
WORKDIR /build
RUN npm install
RUN npm -w apps/jupyter run build:prod
RUN pip install apps/jupyter

RUN useradd --create-home jupyter
WORKDIR /home/jupyter
RUN cp -r /build/apps/jupyter/example .
RUN mkdir .jupyter
COPY jupyter_server_config.py .jupyter/
RUN chown -R jupyter:jupyter /home/jupyter

USER jupyter
RUN jupyter serverextension enable --py jupyterlab
EXPOSE 8888
CMD ["jupyter", "lab"]
