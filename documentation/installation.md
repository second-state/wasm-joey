The following information provides enough detail to install and deploy wasm-joey on an Amazon EC2 instance with:
- Additional storage device
- MySQL Database; including user, tables, sample data etc.
- All relevant dependencies; CORS, SSL etc.

# Automatic installation
There is a [feature enhancement/issue](https://github.com/second-state/wasm-joey/issues/1) which requests that the following commands are all written into a bash script. This will make it much quicker to install.

# Manual installation
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

Create dir to house the application 
```bash
mkdir /media/nvme/node_rpc
```

# Rust
Just a quick word about Rust, if you are planning on using Rust on this system it is suggested that you use the SSD mount point because the `.rustup` folder can get quite large and max out disk space. To install Rust on the SSD just put these two lines in your `~/.profile` file before you install Rust (using the standard command)
```
export CARGO_HOME="/media/nvme"
export RUSTUP_HOME="/media/nvme"
```

# Application

## Install
Fetch the application code
```bash
cd /media/nvme/node_rpc
git clone https://github.com/second-state/wasm-joey.git
cd /media/nvme/node_rpc/wasm-joey/src
```

# Node.js on the system
Fetch
```bash
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
```
Install Node.js on the system
```bash
sudo apt-get install -y nodejs
```

## Node libraries
Node cache
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install node-cache
```
uuid
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install uuid
```
Urllib
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install urllib
```
Dotenv
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install dotenv
```
Express
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install express
```
Body parser
```
npm install body-parser
```
MySQL driver
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install mysql
```
CORS
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install cors
```
HTTPS
```bash
npm install https
```
Formidable
```bash
npm install formidable
```
```bash
npm install buffer-string-to-array
```

# System timezone
```bash
timedatectl set-timezone Australia/Brisbane
```
You can find your own timezone using the following command
```bash
timedatectl list-timezones | grep Los_Angeles
# returns America/Los_Angeles
```

# MySQL Server on the system
Install MySQL on the system
```bash
sudo apt-get install -y mysql-server
```

## MySQL data directory
Create dir to house the database and update the default MySQL config
```bash
mkdir /media/nvme/joey_database
```
Open MySQL config using `sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf`. 

Then change the datadir line from the default to what is listed directly below this line
```bash
datadir = /media/nvme/joey_database
```
In that same Open MySQL conf file (`sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf`), also go ahead and change the max_allowed_packet so that large Wasm files can be uploaed
```
max_allowed_packet = 1000M
```
Configure Ubuntu to allow new MySQL directory
```bash
sudo vi /etc/apparmor.d/tunables/alias
```
Add the following line
```bash
alias /var/lib/mysql/ -> /media/nvme/joey_database,
```
Then restart AppArmor
```bash
sudo systemctl restart apparmor
```
## MySQL Security
Tighten MySQL security
```bash
sudo mysql_secure_installation utility
```
## MySQL startup
Autostart MySQL on reboot
```bash
sudo systemctl enable mysql
```
## MySQL setup for application
Access MySQL console use the following
```bash
sudo mysql -u root -p
```

Create new user and database for the application
```SQL
CREATE DATABASE joeydb;
CREATE USER 'joey'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON joeydb . * TO 'joey'@'localhost';
FLUSH PRIVILEGES;
```

Request to use this newly created database
```SQL
use joeydb;
```

Create blank tables for the application to use
```SQL
CREATE TABLE wasm_executables(
    wasm_id INT(6) NOT NULL AUTO_INCREMENT,
    wasm_description CHAR(255) NOT NULL,
    wasm_binary LONGBLOB NOT NULL,
    wasm_state JSON NOT NULL,
    wasm_callback_object JSON NOT NULL,
    usage_key binary(36),
    admin_key binary(36),
    PRIMARY KEY(wasm_id)
);
```
Create a blank table which will store the logs for particular wasm_id
```SQL
CREATE TABLE wasm_execution_log(
    log_id INT(6) NOT NULL AUTO_INCREMENT,
    wasm_executable_id INT(6) NOT NULL,
    wasm_executable_state LONGTEXT NOT NULL,
    execution_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    execution_object LONGTEXT NOT NULL,
    INDEX we_index (wasm_executable_id),
    PRIMARY KEY(log_id),
    FOREIGN KEY (wasm_executable_id) REFERENCES wasm_executables(wasm_id) ON DELETE CASCADE
);
```

## MySQL backup and restore
Install automysqlbackup
```bash
sudo apt-get install automysqlbackup
```
Start backup
```bash
sudo automysqlbackup
```
Backed up files are stored at
```bash
/var/lib/automysqlbackup
```
To restore, use the following to decompress the database backup
```bash
gzip -d /var/lib/automysqlbackup/daily/joeydb/joeydb_2020-06-07_23h54m.Sunday.sql.gz
# creates /var/lib/automysqlbackup/daily/joeydb/joeydb_2020-06-07_23h54m.Sunday.sql
```
The run the following command to restore MySQL to this particular database backup
```bash
mysql -u joey -p joeydb < /var/lib/automysqlbackup/daily/joeydb/joeydb_2020-06-07_23h54m.Sunday.sql
```

## Deployment

### SSL
```bash
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get -y upgrade
npm install helmet
sudo apt-get install certbot
sudo certbot certonly --manual
```
Place the file locations of the above command in the server.js file
Run the following command to enable sufficient permissions
```bash
sudo chown $USER:$USER -R /etc/letsencrypt
```

### SSVM
https://www.npmjs.com/package/ssvm-napi#setup-for-ssvm-addon

https://www.npmjs.com/package/ssvm#setup-for-rust-nodejs-and-ssvmup

`npm install ssvm`

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`
`npm i -g ssvmup`

### Serve
```bash
cd /media/nvme/node_rpc/wasm-joey/src
nodejs server.js
```







