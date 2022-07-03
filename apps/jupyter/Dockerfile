FROM node:18

RUN apt-get update
RUN apt-get install -y python3-pip

WORKDIR /build
COPY . .
RUN pip3 install -r apps/jupyter/requirements.txt
RUN npm install
RUN npm -w apps/jupyter run build:prod
RUN pip3 install apps/jupyter

RUN useradd --create-home jupyter
WORKDIR /home/jupyter
RUN cp -r /build/apps/jupyter/example .
RUN chown -R jupyter:jupyter /home/jupyter

USER jupyter
EXPOSE 8888
CMD ["jupyter", "lab", "--ip=0.0.0.0", "--no-browser"]
