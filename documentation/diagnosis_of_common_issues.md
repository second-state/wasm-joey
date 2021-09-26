The following file has a few methods of recovering from common issues with Nodejs MySQL etc. This file also shows you how to restore data from a database backup.

## Diagnose 100 CPU issues
Install tick

```
npm install tick
```
Stop the process (if running)
```
cd /media/nvme/node_rpc/wasm-joey/src
forever stop server.js
```
Start again using logging
```
node --prof server.js
```
This creates a log file with a name similar to the following `isolate-0x103800000-v8.log`.
Then we create a readable text log file from this output (after the specific 100% cpu process has been running)
```
node --prof-process isolate-0x103800000-v8.log > processed.txt
```
Then inspect the log
```
vi processed.txt
```
You will see something obvious like this
```
6  100.0%            LazyCompile: ~isValidJSON /media/nvme/node_rpc/wasm-joey/src/server.js:150:21
```
At this point, go ahead and look at like 150 in the `server.js` file

## MySQL repair (Ubuntu)

```bash
#!/bin/bash
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
Then add the joey user
```mysql
CREATE DATABASE joeydb;
CREATE USER 'joey'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON joeydb . * TO 'joey'@'localhost';
FLUSH PRIVILEGES;
ALTER USER 'joey'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
FLUSH PRIVILEGES;
```
Then run these commands at the mysql prompt
```
ALTER USER 'joey'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
FLUSH PRIVILEGES;
```
```SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
FLUSH PRIVILEGES;
```

Then fetch a backed up sql file to restore the data, as per the instructions below.

```bash
su -
```
```bash
cd /var/lib/automysqlbackup/daily/joeydb
gzip -d the_mysq_.gz_file
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
Then run the following command to restore MySQL to this particular database backup
```bash
mysql -u joey -p joeydb < /var/lib/automysqlbackup/daily/joeydb/joeydb_2020-06-07_23h54m.Sunday.sql
```

# Migrate data
Use the following command to dump the MySQL data to a file
```
cd /media/nvme
mysqldump -u root -p --databases joeydb > backup_2020_10_24.sql
```
Transfer this data to the next machine (perhaps to local machine and then back up to next machine)
```
scp -i "~/.ssh/my.pem" -rp ubuntu@123.45.67:/media/nvme/backup_2020_10_24.sql .
scp -i ~/.ssh/other.pem -rp backup_2020_10_24.sql ubuntu@89.10.11.12:/media/nvme
```
# Restoring an sql file

Please make sure that you have the following values set in the `/etc/mysql/mysql.conf.d/mysqld.cnf` first
```
wait_timeout = 28800
```
Also make sure you set the max allowed packet to avoid the `ERROR 2006 (HY000) at line 57: MySQL server has gone away` error
First log in
```
mysql -u root -p
```
Then update the setting
```
SET GLOBAL max_allowed_packet=1073741824;
```
Then log back out
```
quit
```
Then restore the entire database on the new machine
```
cd /media/nvme
sudo mysql -u root -p joeydb < backup_2020_10_24.sql
```


## Error: ER_NOT_SUPPORTED_AUTH_MODE

If you get an error like this, when trying to start server.js via node command, `Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client`
Perform the following command 
```
ALTER USER 'joey'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
FLUSH PRIVILEGES;
```
## ERROR 1698 (28000): Access denied for user 'root'@'localhost'

```bash
sudo mysql
```
```SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
FLUSH PRIVILEGES;
```

## Blank Wasm executable loaded into Joey
If you ever notice that the sha256 (wasm_sha256) of your wasm executable is `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` this is because it is blank. The most common cause of this is that when you ran the command to upload it, there was an issue. For example 
```
curl --location --request POST 'https://rpc.ssvm.secondstate.io:8081/api/executables' --header 'Content-Type: application/octet-stream' --header 'SSVM-Description: say hello' --data-binary @'pkg/file_that_does_not_exist'
```
## Security
Secure DB
```
sudo mysql_secure_installation
```

## Sock
Plugin mysqlx reported: 'Setup of socket: '/var/run/mysqld/mysqlx.sock' failed
```
sudo mkdir /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld
```

## MYSQL
If the following error occurs
`mysql Access denied for user 'root'@'localhost'`
Then, open /etc/mysql/my.cnf, add a new section at the bottom of the file called `[mysqld]` and then under that add `skip-grant-tables`
Restart Mysql
You should be able to login to mysql now using the below command mysql -u root -p
