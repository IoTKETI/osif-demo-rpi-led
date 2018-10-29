#!/bin/sh

docker build -f Dockerfile.rpi -t ciot/iotweek-demo-led:rpi .
docker tag ciot/iotweek-demo-led:rpi dev.synctechno.com:5000/iotweek-ciot-demo-led:rpi

