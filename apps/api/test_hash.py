from passlib.context import CryptContext; ctx = CryptContext(['bcrypt']); print(ctx.verify('admin123', '$2b$12$4KIkubeECPaBOamTZ0HlA.7f56EkTp6RixvAqWr58zajEpypYC0VK'))
