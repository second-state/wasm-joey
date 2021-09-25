The following information provides enough detail to install and deploy wasm-joey on an Amazon EC2 instance with:
- Additional storage device
- MySQL Database; including user, tables, sample data etc.
- All relevant dependencies; CORS, SSL etc.

If installing on alternative infrastructure where you are provided with root access, please create a new group and user like this
```
groupadd -g2021 ubuntu
useradd ubuntu -g ubuntu -s "/bin/bash" -d "/home/ubuntu" -m 
```
Set new user's password
```
passwd ubuntu
```
Add sudo privileges for the new user
```
adduser ubuntu sudo
```
Change to new user
```
su ubuntu
```

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
(on Azure it would be something like `sudo mkfs -t ext4 /dev/sdb`)
Part of the output from the above mkfs command will include the Filesystem UUID. Cut and paste this UUID because it will be used in an upcoming command.
```bash
Filesystem UUID: 6f6177fe-947a-46a2-b593-c36dfaaa8407
```
Create an easily accesible mount point on the main drive (where the operating system runs) and then set the permissions of this mount point to the ubuntu user.
```bash
sudo mkdir /media/nvme
sudo chown -R $USER:$USER /media/nvme/
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
sudo chown -R $USER:$USER /media/nvme/
```

## Rust
Just a quick word about Rust; it is suggested that you use the SSD mount point because the `.rustup` folder can get quite large and max out disk space. To install Rust on the SSD just put these two lines in your `~/.profile` file before you install Rust (using the standard command)
```
vi ~/.profile
```
Add these lines
```
export CARGO_HOME="/media/nvme"
export RUSTUP_HOME="/media/nvme"
```
Execute profile
```
source ~/.profile
```
Once you have performed the config above, please then follow [these official Rust installation instructions](https://www.rust-lang.org/tools/install) to install Rust. Essentially running the following command should do it.
```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

```

# Application

Create dir to house the application 
```bash
mkdir /media/nvme/node_rpc
```
Alter permissions
```
sudo chown -R $USER:$USER /media/nvme/node_rpc
```

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
curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
```
Install Node.js on the system
```bash
sudo apt-get install -y nodejs
```

## Node libraries

**NOTE** If you ever need to unistall and reinstall all of the node dependencies you can use [this automated_node.sh script](../automated_node.sh). Just `sudo chmod a+x automated_node.sh` then `./automated_node.sh`.

The following are instruction on installing all of the node dependencies manually.

Content Type
```
npm install file-type
```
Axios
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install axios
```
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
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install randomstring
```
```bash
cd /media/nvme/node_rpc/wasm-joey/src
npm install express-rate-limit
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
sudo chown -R mysql:mysql /media/nvme/joey_database/
sudo chmod 750 /media/nvme/joey_database/
```
## Purge all MySQL and install afresh

```#!/bin/bash
sudo apt-get -y remove --purge mysql*
sudo rm -rf /etc/mysql /var/lib/mysql
sudo apt-get -y autoremove
sudo apt-get -y autoclean
sudo apt install -y mysql-server
echo 'datadir = /media/nvme/joey_database' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf
echo 'max_allowed_packet = 128M' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf
echo 'wait_timeout = 28800' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf
sudo mysqld --initialize --user=mysql
sudo /etc/init.d/mysql start
sudo mysql
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
    wasm_state LONGTEXT NOT NULL,
    storage_key LONGTEXT NOT NULL,
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
Alter root user
```SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
FLUSH PRIVILEGES;
```
Then exit
```bash
quit
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

## Deployment

### SSL
```bash
sudo apt-get update
sudo apt-get -y upgrade
npm install helmet
sudo apt-get install -y certbot
sudo certbot certonly --manual
```

Run the following command to enable sufficient permissions for the files that certbot created on our behalf
```bash
sudo chown $USER:$USER -R /etc/letsencrypt
```

### Permanent storage

Create the infrastructure for the permanent storage by following [these rust_native_storage_library instructions](https://github.com/second-state/rust_native_storage_library#installing-database-rocksdb) specifically the `Installing database (RocksDB)` section at the bottom of the aforementioned link.

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

### Install wasmedge-extensions from source

The following `ssvm-napi-extensions` allows the SSVM runtime to access permanent storage.
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

```bash
cd /media/nvme/node_rpc/wasm-joey/src
```

### Install the required dependencies for ssvm-napi-extensions
Please visit [this link which details the requirements to continue](https://github.com/second-state/ssvm-napi-extensions#requirements) and ensure that your system has these required dependencies before proceeding.

#### Temporarily downgrade npm
The following installation will require that npm is downgraded to `6.14.9`. There is [an npm cli issue](https://github.com/npm/cli/issues/1865) which prevents us from using the latest npm for this particular build from source task.

Because of the complexity of dependency management, please install aptitude because it provides a way to automatically resolve depencency conflicts.
```
sudo apt install aptitude
sudo aptitude install npm
```
The following command is used to alter the npm version.
```
sudo npm install -g npm@6.14.9
```
#### Install from source
Once you have temporarily downgraded npm, please go ahead and install the latest ssvm-napi-extensions like this
```bash
npm install --build-from-source https://github.com/second-state/wasmedge-extensions
```
If getting the error `does not have permission to access the dev dir "/root/.cache/node-gyp` then try the following instead.

Make a new global cache dir and update profile i.e.

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
```
Then update your `~/.profile` file
```bash
export PATH=~/.npm-global/bin:$PATH
```
Then run `source ~/.profile` command 

Then run the command like this instead

```bash
npm install --unsafe-perm -g --build-from-source https://github.com/second-state/wasmedge-extensions
```
If you receive an error about permissions such as this `Missing write access to /usr/local/lib/node_modules` then please run the following command and then try the `npm install --build-from-source` command, outlined above, again.
```
sudo chown -R $USER /usr/local/lib/node_modules
```
Following the successful installation of the above, please go ahead and run the following command to return npm to the latest version
```
npm install npm@latest -g
```

Please note, if this is not a new installation (i.e. you are upgrading extensions) please delete all .so files from the /media/nvme/aot section and ensure that the manifest.txt file is blank/empty before restarting the FaaS.

### Create directory for usage statistics
Gas and invocation details are gathered for all wasm executables. Please create the following directory and adjust the permissions as follows.

```
mkdir /media/nvme/usage
```
```
sudo chown -R $user:$user /media/nvme/usage
```
Also be sure that this path is present in the `/media/nvme/node_rpc/wasm-joey/src/.env` configuration file as follows 
```
usage_dir=/media/nvme/usage
```
If you want to turn usage statistics off and on, open the `/media/nvme/node_rpc/wasm-joey/src/.env` file and update the value for `measure_gas_and_invocations` i.e. use `0` for off and `1` for on.

To stop/pause gathering statistics, turn usage off like this.
```
measure_gas_and_invocations=0
```

To start/recommence gathering statistics, turn usage on like this.
```
measure_gas_and_invocations=1
```

### Create directory for AOT compiler files

SSVM generates AOT files which need to be stored on the solid state file system. Please create the following directory and adjust the permissions as follows.

```
mkdir /media/nvme/aot
```
```
sudo chown -R $user:$user /media/nvme/aot
```
Also be sure that this path is present in the `/media/nvme/node_rpc/wasm-joey/src/.env` configuration file as follows 
```
aot_dir=/media/nvme/aot
```

Lastly, create a blank file which will be the future manifest of all wasm_ids and AOT file paths. Each time the system restarts or Joey is restarted we will need to import the wasm_id and AOT file paths. 

```
touch /media/nvme/aot/manifest.txt
```

Obviously if you ever need to flush this manifest you would just remove and recreate a blank file

### http_proxy functionality

Fetch the code 
```
mkdir /media/nvme/AIaaS
sudo chown -R $USER:$USER /media/nvme/AIaaS/
cd /media/nvme/AIaaS/
git clone https://github.com/second-state/AI-as-a-Service.git
```
Compile the necessary binaries to `/usr/bin/` (/usr/bin is default setting as per the [Cargo.toml's install settings](https://github.com/second-state/AI-as-a-Service/blob/master/native_model_zoo/image_classification_mobilenet/Cargo.toml#L18))
```
rustup update nightly
rustup update stable
cd /media/nvme/AIaaS/AI-as-a-Service/native_model_zoo/http_proxy
cargo install --path .
```
Ensure that all of those binaries are available in the user (who is running Joey's path).
Set the system path so it can find the binaries via `vi ~/.profile` (then log out and back in again as shown above)
```
export PATH="/usr/bin:$PATH"
export PATH="/media/nvme/AIaaS/AI-as-a-Service/native_model_zoo/http_proxy/target/release:$PATH"
```

### Optical Character Recognition (OCR) functionality

Follow [these instructions to install tesseract OCR](https://tesseract-ocr.github.io/tessdoc/Compiling.html#linux). If you would like to add extra languages (other than the English default) then download [this repo](https://github.com/tesseract-ocr/tessdata), copy all of the `.traineddata` files to the `/usr/share/tesseract-ocr/4.00/tessdata` folder and then add this line to your `~/.profile` file `export TESSDATA_PREFIX="/usr/share/tesseract-ocr/4.00/tessdata"`.

### Translation functionality

Install translation software using the following command
```
sudo apt install translate-shell
```

# Joey hostname config
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

# Configuration before starting

## Measuring gas and invocations

If you want to turn usage statistics off and on, open the `/media/nvme/node_rpc/wasm-joey/src/.env` file and update the value for `measure_gas_and_invocations` i.e. use `0` for off and `1` for on.

For example, to stop/pause gathering statistics, turn usage off like this.
```
measure_gas_and_invocations=0
```

To start/recommence gathering statistics, turn usage on like this.
```
measure_gas_and_invocations=1
```

# Starting (Serving) Joey
```bash
cd /media/nvme/node_rpc/wasm-joey/src
nodejs server.js
```

# Testing Joey
This section shows you how to build, compile, deploy and call a FaaS.

# FaaS example
There are many pre-made functions that you can implement. Perhaps the simplest of them all is this [hello world](https://github.com/second-state/wasm-learning/tree/master/faas/hello) FaaS.

# Logging via a browser
At present you can access the server logs via [this URL](http://rpc.ssvm.secondstate.io:9001/)

To set up the logging please install the following node package
```
npm i frontail -g
```
Then instead of just starting using `forever start server.js` use this more verbose command that creates a deliberate log file for frontail to access
```
forever start -o out.log -e err.log server.js
```
Then start frontail and allow it to serve the out.log file
```
nohup frontail out.log &
```
# Purging temp files (server maintenance)

Node.js will store temporary files in `/tmp` as `upload_*`

Create a shell script with the following syntax in `/home/ubuntu/purge_temp.sh`
It will delete all tmp files which are older than 5 minutes

```
#!/bin/bash
find /tmp/upload_* -mmin +5 -type f -exec rm -fv {} \;
```
Then create the following cron which will execute once per minute

```
* * * * * /home/ubuntu/purge_temp.sh
```

# Rate limiting
If you would like to rate limit usage please perform the following steps

```
npm install --save express-rate-limit
```
Then add the following to the top of your server.js file
```
const rateLimit = require("express-rate-limit");
 
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2 // limit each IP to 2 requests per windowMs
});
 
//  apply to all requests
app.use(limiter);
```

# GPU toolkit
This is the [base installer](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&target_distro=Ubuntu&target_version=2004&target_type=deblocal) for the NVIDIA CUDA toolkit
```
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-ubuntu2004.pin
sudo mv cuda-ubuntu2004.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/11.1.0/local_installers/cuda-repo-ubuntu2004-11-1-local_11.1.0-455.23.05-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu2004-11-1-local_11.1.0-455.23.05-1_amd64.deb
sudo apt-key add /var/cuda-repo-ubuntu2004-11-1-local/7fa2af80.pub
sudo apt-get update
sudo apt-get -y install cuda
```

Follow these instructions on CUDA and FFMPEG

https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html

https://docs.nvidia.com/video-technologies/video-codec-sdk/ffmpeg-with-nvidia-gpu/index.html

Be sure to modify the `configure` file by updating any instances of `compute_30` with `compute_35`

Be sure to use the following configure command for ffmpeg
```
./configure --enable-cuda-nvcc --enable-cuvid --enable-nvenc --enable-nonfree --enable-libnpp --extra-cflags=-I/usr/local/cuda-11.1/include --extra-ldflags=-L/usr/local/cuda-11.1/lib64
```

# Monitoring GPU usage
The following package will allow you to monitor GPU and Memory whilst executing Wasm executables
```
sudo apt-get install -y python3-pip
sudo pip3 install glances[gpu]
```
To run glances, use
```
sudo glances 
```
