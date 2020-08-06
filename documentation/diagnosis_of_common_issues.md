The following file has a few methods of recovering from common issues with Nodejs MySQL etc. This file also shows you how to restore data from a database backup.


## MySQL repair (Ubuntu)

```bash
#!/bin/bash
sudo apt-get -y remove --purge mysql*
sudo rm -rf /etc/mysql /var/lib/mysql
sudo apt-get -y autoremove
sudo apt-get -y autoclean
sudo apt install -y mysql-server
echo 'datadir = /media/nvme/joey_database' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf
echo 'max_allowed_packet = 1000M' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf
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
