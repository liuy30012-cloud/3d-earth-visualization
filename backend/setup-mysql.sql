-- 创建数据库
CREATE DATABASE IF NOT EXISTS earth3d DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户（默认密码: earth3d_pass）
CREATE USER IF NOT EXISTS 'earth3d_user'@'localhost' IDENTIFIED BY 'earth3d_pass';

-- 授权
GRANT ALL PRIVILEGES ON earth3d.* TO 'earth3d_user'@'localhost';
FLUSH PRIVILEGES;
