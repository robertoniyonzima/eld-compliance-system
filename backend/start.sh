#!/bin/bash
# backend/start.sh

echo "Starting ELD Compliance System Backend..."

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@eldsystem.com', 'admin123')" | python manage.py shell

# Start server
python manage.py runserver 0.0.0.0:8000