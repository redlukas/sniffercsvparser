#!/bin/bash

#start with curl -s https://raw.githubusercontent.com/redlukas/sniffercsvparser/master/bootstrap.sh?token=ABQPI7H57ENJVZ4YZPK4Y43BSARSW | bash

echo "Enter your zerotier network ID"
read -p -r 'Type something and hit space: ' '-d zerotierid';
echo "The zerotier ID is ${zerotierid}"

#update the system
sudo -u root -H sh -c "apt update"
sudo -u root -H sh -c "apt upgrade -y"

#install zerotier
DV_SAVE=$(cat /etc/debian_version)
echo buster | sudo tee /etc/debian_version >/dev/null
sudo -u root -H sh -c "curl -s https://install.zerotier.com | bash && zerotier-cli join ${zerotierid}"
echo "${DV_SAVE}" | sudo tee /etc/debian_version >/dev/null


#install docker
sudo -u root -H sh -c "install docker.io -y"
sudo -u root -H sh -c "systemctl enable docker --now"

#run the container
direc="$(pwd)"
mkdir "${direc}"/sniffs
sudo -u root -H sh -c "docker run redlukas/sniffercsvparser -p 3000:3000 -v ${direc}/sniffs:/app/csvdir"




