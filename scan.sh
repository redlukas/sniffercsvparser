#!/bin/bash

#wait for startup
sleep 30

#start monitor mode
sudo -u root -H sh -c "airmon-ng start wlan0"

cd ~/sniffs || exit

sudo -u root -H sh -c "airodump-ng -w ad --output-format csv --write-interval 30 wlan0mon"

