mkdir certs
openssl req -x509 -newkey rsa:4096 -nodes -keyout certs/key.pem -out certs/cert.pem -days 365
