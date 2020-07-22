The following file has a few methods of recovering from common issues with Nodejs MySQL etc. This file also shows you how to restore data from a database backup.


## MySQL repair (Ubuntu)

```bash
sudo apt-get -y remove --purge mysql*
sudo rm -rf /etc/mysql /var/lib/mysql
sudo apt-get -y autoremove
sudo apt-get -y autoclean
sudo apt install -y mysql-server

sudo /etc/init.d/mysql start

sudo mysqld --initialize --user=mysql

sudo mysql_secure_installation
```

Open MySQL config using `sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf`. 

Then change the datadir line from the default to what is listed directly below this line
```
datadir = /media/nvme/joey_database
```
In that same Open MySQL conf file (`sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf`), also go ahead and change the max_allowed_packet so that large Wasm files can be uploaed
```
max_allowed_packet = 1000M
```

Then fetch a backed up sql file to restore the data, as per the instructions below.

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

## Error: ER_NOT_SUPPORTED_AUTH_MODE

If you get an error like this, when trying to start server.js via node command, `Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client`
Perform the following command 
```
ALTER USER 'joey'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here'
```
## ERROR 1698 (28000): Access denied for user 'root'@'localhost'

```bash
sudo mysql
```
```SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
```
