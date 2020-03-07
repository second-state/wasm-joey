The following information provides enough detail to install and deploy wasm-joey on an Amazon EC2 instance with:
- Additional storage device
- MySQL Database; including user, tables, sample data etc.
- All relevant dependencies; CORS, SSL etc.

To begin, create a new EC2 Ubuntu Server instance which has an additional SSD i.e. m5d.large (which has 1 x 75 NVMe SSD).

# Software (OS)
```bash
sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get install -y build-essential
```

# Auxillary hardware
View NVMe volume (which is not yet mounted/mapped/formatted)
```bash
lsblk
```
There is a ~300Gb drive with the name of nvme0n1
```bash
nvme0n1     259:2    0 279.4G  0 disk 
```
Create a file system
```bash
sudo mkfs -t ext4 /dev/nvme0n1 
```
Part of the output from the above mkfs command will include the Filesystem UUID. Cut and paste this UUID because it will be used in an upcoming command.
```bash
Filesystem UUID: 6f6177fe-947a-46a2-b593-c36dfaaa8407
```
Create an easily accesible mount point on the main drive (where the operating system runs) and then set the permissions of this mount point to the ubuntu user.
```bash
sudo mkdir /media/nvme
sudo chown -R ubuntu:ubuntu /media/nvme/
```
Ensure that this drive is mounted each time the system is restarted. Add this line to the */etc/fstab* file (remember the UUID from the previous step?).
```bash
UUID=37c7e8b0-a595-4046-9a43-5e7928a4a15a /media/nvme ext4 defaults 0 0
```
Once the above commands have succeeded, reboot the instance.
```bash
sudo shutdown -r now
```
After the reboot, see the mounted ~300Gb NVMe SSD using the df command
```bash
df -h
/dev/nvme0n1    275G   65M  260G   1% /media/nvme
```
```bash
#ensure that the /media/nvme directory is owned by ubuntu by typing ls -la /media/nvme If it is not then type the following command
sudo chown -R ubuntu:ubuntu /media/nvme/
```

Create dir for data 
```bash
mkdir /media/nvme/node_rpc
```
# Node
Fetch
```bash
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
```
Install
```bash
sudo apt-get install -y nodejs
```

MySQL
```bash
sudo apt-get install -y mysql-server
```

Tighten MySQL security
```bash
sudo mysql_secure_installation utility
```

Autostart MySQL on reboot
```bash
sudo systemctl enable mysql
```

Access MySQL console use the following
```bash
sudo mysql -u root -p
```

Create new user and database for the application
```bash
CREATE DATABASE joeydb;
CREATE USER 'joey'@'localhost' IDENTIFIED BY 'your_password_goes_here';
GRANT ALL PRIVILEGES ON joeydb . * TO 'joey'@'localhost';
FLUSH PRIVILEGES;
```

Create configuration storage so that application can access username, passwords and config
```bash
npm install dotenv
```

Raptor and other libraries
```bash
npm install raptor-rpc
```

MySQL driver
```bash
npm install mysql
```

Application code
```
cd ~
git clone https://github.com/second-state/wasm-joey.git
cd ~/wasm-joey/src
```

Serve
```
node server.js
```






