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

Ensure that the /media/nvme directory is owned by ubuntu by typing ls -la /media/nvme If it is not then type the following command

```bash
sudo chown -R ubuntu:ubuntu /media/nvme/
```

Create dir to house the application 
```bash
mkdir /media/nvme/node_rpc
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
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
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
```bash
cd /media/nvme/node_rpc/wasm-joey/src
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
cd /media/nvme/node_rpc/wasm-joey/src
npm install https
```
Formidable
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install formidable
```
```bash
cd /media/nvme/node_rpc/wasm-joey/src
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
## Init MySQL data dir
```bash
sudo chown -R mysql:mysql /media/nvme/joey_database/
sudo chmod 750 /media/nvme/joey_database/
sudo mysqld --initialize --user=mysql
```
## Start MySQL
```bash
sudo /etc/init.d/mysql
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

Run the following command to enable sufficient permissions for the files that certbot created on our behalf
```bash
sudo chown $USER:$USER -R /etc/letsencrypt
```

### SSVM
```bash
cd ~
```
```bash
git clone git@github.com:second-state/SSVM.git
cd SSVM
git checkout 0.6.3
```
```bash
sudo apt install -y \
	software-properties-common \
	cmake \
	libboost-all-dev
```
```bash
sudo apt install -y \
	llvm-dev \
	liblld-10-dev
```
```bash
sudo apt install -y gcc g++
```
```bash
mkdir -p build && cd build
```
```bash
cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTS=ON .. && make
```
### SSVM Nodejs add-on
```bash
sudo apt-get install libboost-all-dev
```
```bash
sudo apt-get install -y llvm
```
```bash
sudo apt-get install -y liblld-10-dev
```
```bash
sudo apt-get install -y libstdc++6
```
```bash
sudo apt-get install -y g++
```
```bash
cd /media/nvme/node_rpc/wasm-joey/src
```
```bash
export CXX=g++-9
```
The following `ssvm-napi-storage` allows the SSVM runtime to access permanent storage.
You will need to alter the Git configuration on the machine where this installation procedure is being performed. Reason being, this machine will not have the SSH keys to communicate with git@github. If you add the following config, you will be able to successfully run the `npm install --build-from-source ...` below.
```bash
git config --global url."https://github.com/".insteadOf git@github.com:
git config --global url."https://".insteadOf git://
```
You can check that this config worked by typing 
```bash
git config -l
```
You can reverse/revert this Git config by typing `git config --global --edit` and then commenting out the appropriate sections.

#### Install SSVM Nodejs add-on from source

```bash
npm install --build-from-source https://github.com/second-state/ssvm-napi-storage
```
### Hostname config
Open the `.env` file and ensure that the base domain name is correct i.e.
```bash
vi /media/nvme/node_rpc/wasm-joey/src/.env
```
```bash
server_name=dev.rpc.ssvm.secondstate.io
```
Or
```bash
server_name=rpc.ssvm.secondstate.io
```
etc.

### Serve
```bash
cd /media/nvme/node_rpc/wasm-joey/src
nodejs server.js
```

# Testing it out

## Rust
Just a quick word about Rust; it is suggested that you use the SSD mount point because the `.rustup` folder can get quite large and max out disk space. To install Rust on the SSD just put these two lines in your `~/.profile` file before you install Rust (using the standard command)
```
export CARGO_HOME="/media/nvme"
export RUSTUP_HOME="/media/nvme"
```
Once you have performed the config above, please then follow [these official Rust installation instructions](https://www.rust-lang.org/tools/install) to install Rust.

You can install the following software that will enable you to compile your Rust to Wasm (and then deploy it on Joey)

## wasm32-wasi
First of all, install the wasm32-wasi target
```bash
rustup target add wasm32-wasi
```

## ssvmup
Then install ssvmup
```bash
 curl https://raw.githubusercontent.com/second-state/ssvmup/master/installer/init.sh -sSf | sh
```
Then create a simple Rust application
```bash
cargo new --lib hello
```
Edit the source file
```bash
vi hello/src/lib.rs
```
Adding the following code to the `lib.rs` file that you now have open
```Rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn say(s: &str) -> String {
  let r = String::from("hello ");
  return r + s;
}
```
Edit the Cargo.toml file
```bash
vi hello/Cargo.toml
```
Appending the following code to the end of the `Cargo.toml` file
```
[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "=0.2.61"
```
The compile this Rust to Wasm
```bash
cd hello
ssvmup build
```
Then deploy this Wasm executable to Joey via HTTP request
```bash
curl --location --request POST 'https://rpc.ssvm.secondstate.io:8081/api/executables' \
--header 'Content-Type: application/octet-stream' \
--header 'SSVM-Description: say hello' \
--data-binary @'pkg/hello_bg.wasm'
```
The above command will return the following JSON object
```bash
{"wasm_id":21,"wasm_sha256":"0x544031db56e706a151c056f6f673abfb1f8f158389e51a77cc99a53b849e1c14","SSVM_Usage_Key":"00000000-0000-0000-0000-000000000000","SSVM_Admin_Key":"b14ce42c-8eea-4d4c-9b05-74a785d5fa4e"}
```
To execute the function that you wrote above, please use the following HTTP request
```bash
curl --location --request POST 'https://rpc.ssvm.secondstate.io:8081/api/run/21/say' \
--header 'Content-Type: text/plain' \
--data-raw 'World'
```
Returns
```bash
hello World
```





