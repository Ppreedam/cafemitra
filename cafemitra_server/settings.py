
# Production domain configuration
ALLOWED_HOSTS = list(dict.fromkeys(list(globals().get('ALLOWED_HOSTS', [])) + ['api.repetigo.com', 'repetigo.com', 'www.repetigo.com', '157.173.221.183', 'localhost', '127.0.0.1']))
CSRF_TRUSTED_ORIGINS = list(dict.fromkeys(list(globals().get('CSRF_TRUSTED_ORIGINS', [])) + ['https://repetigo.com', 'https://www.repetigo.com', 'https://api.repetigo.com']))
CORS_ALLOWED_ORIGINS = list(dict.fromkeys(list(globals().get('CORS_ALLOWED_ORIGINS', [])) + ['https://repetigo.com', 'https://www.repetigo.com']))
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
