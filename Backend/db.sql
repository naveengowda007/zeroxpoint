DROP DATABASE IF EXISTS zeroxpoint;
CREATE DATABASE zeroxpoint;

USE zeroxpoint;

DROP TABLE IF EXISTS payment_info;

CREATE TABLE payment_info (
	id INT NOT NULL AUTO_INCREMENT,
	userid VARCHAR(50) NOT NULL,
	payment_type ENUM('account', 'upi') NOT NULL,
	payment_data JSON NOT NULL,
	is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY (id)
);

DROP TABLE IF EXISTS users;

CREATE TABLE users (
	id INT NOT NULL AUTO_INCREMENT,
	userid VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(50),
	phone VARCHAR(10) UNIQUE,
	email VARCHAR(255) UNIQUE,
	password VARCHAR(255),
	notification_token VARCHAR(100),
	default_location_id INT UNIQUE,
	default_payment_id INT UNIQUE,
	is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
	is_verified ENUM('none', 'phone', 'email', 'both') NOT NULL DEFAULT 'none',
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);

DROP TABLE IF EXISTS user_locations;

CREATE TABLE user_locations (
	id INT NOT NULL AUTO_INCREMENT,
	userid VARCHAR(50) NOT NULL,
	name VARCHAR(50) NOT NULL,
	phone VARCHAR(10) NOT NULL,
	address_text VARCHAR(255) NOT NULL,
	latitude DECIMAL(19, 15) NOT NULL,
	longitude DECIMAL(19, 15) NOT NULL,
	is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY (id)
);

DROP TABLE IF EXISTS shops;

CREATE TABLE shops (
	id INT NOT NULL AUTO_INCREMENT,
	userid VARCHAR(50) NOT NULL UNIQUE,
	vendor_name VARCHAR(50) NOT NULL,
	phone VARCHAR(10) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	shop_name VARCHAR(50) NOT NULL,
	address_text VARCHAR(255) NOT NULL,
	latitude DECIMAL(19, 15) NOT NULL,
	longitude DECIMAL(19, 15) NOT NULL,
	default_payment_id INT,
	default_priceTable_id INT,
	is_deleted BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);

DROP TABLE IF EXISTS delivery_agents;

CREATE TABLE delivery_agents (
	id INT NOT NULL AUTO_INCREMENT,
	userid VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(50),
	phone VARCHAR(10) UNIQUE,
	email VARCHAR(255) UNIQUE,
	password VARCHAR(255),
	notification_token VARCHAR(100),
	default_location_id INT,
	default_payment_id INT,
	is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
	is_verified ENUM('none', 'phone', 'email', 'both') NOT NULL DEFAULT 'none',
	ratings DECIMAL(2, 1) DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);

DROP TABLE IF EXISTS cart;

CREATE TABLE cart (
	id INT NOT NULL AUTO_INCREMENT,
	userid VARCHAR(50) NOT NULL,
	cartid VARCHAR(20) NOT NULL UNIQUE,
	order_details JSON NOT NULL DEFAULT ('{}'),
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);

DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
	id INT NOT NULL AUTO_INCREMENT,
	userid VARCHAR(50) NOT NULL,
	cartid VARCHAR(20) UNIQUE,
	delivery_location JSON NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	shop_id JSON NOT NULL DEFAULT ('[]'),
	delivery_user_id JSON NOT NULL DEFAULT ('[]'),
	pickup_delivery_user_id JSON NOT NULL DEFAULT ('[]'),
	order_details JSON NOT NULL DEFAULT ('{}'),
	order_type ENUM('online', 'pickup') NOT NULL DEFAULT 'online',
	status JSON NOT NULL DEFAULT ('[]'),
	PRIMARY KEY (id)
);

DROP TABLE IF EXISTS otp;

CREATE TABLE otp (
	id INT NOT NULL AUTO_INCREMENT,
	userid VARCHAR(50) NOT NULL,
	otp VARCHAR(10) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);

DROP TABLE IF EXISTS admin;

CREATE TABLE admin (
	id INT NOT NULL AUTO_INCREMENT,
	userid VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(50),
	phone VARCHAR(10) UNIQUE,
	email VARCHAR(255) UNIQUE,
	password VARCHAR(255) NOT NULL,
	level INT NOT NULL DEFAULT 0,
	notification_token VARCHAR(100),
	is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
	is_verified ENUM('none', 'phone', 'email', 'both') NOT NULL DEFAULT 'none',
	PRIMARY KEY (id)
);

DROP TABLE IF EXISTS adminpricetable;

CREATE TABLE adminpricetable (
	id INT NOT NULL AUTO_INCREMENT,
	price_table JSON NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);

DROP TABLE IF EXISTS vendorpricetable;

CREATE TABLE vendorpricetable (
	id INT NOT NULL AUTO_INCREMENT,
	userid VARCHAR(50) NOT NULL,
	price_table JSON NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);


-- User foreign key constraint
ALTER TABLE users ADD FOREIGN KEY (default_location_id) REFERENCES user_locations(id);
ALTER TABLE users ADD FOREIGN KEY (default_payment_id) REFERENCES payment_info(id);


ALTER TABLE delivery_agents ADD FOREIGN KEY (default_location_id) REFERENCES user_locations(id);
ALTER TABLE delivery_agents ADD FOREIGN KEY (default_payment_id) REFERENCES payment_info(id);


ALTER TABLE cart ADD FOREIGN KEY (userid) REFERENCES users(userid);

-- Orders foreign key constraints
ALTER TABLE orders ADD FOREIGN KEY (userid) REFERENCES users(userid);