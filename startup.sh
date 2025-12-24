#!/bin/bash
set -e

echo "Starting Socrates..."

rm -rf backend temp

echo "Cloning latest backend..."
git clone https://github.com/Saadajee/socrates.git temp

echo "Installing fresh backend..."
cp -r temp/backend .

export PYTHONPATH="$(pwd)/backend:$PYTHONPATH"

# Persistent index directory
mkdir -p backend/app/data


echo "Launching API..."
uvicorn backend.app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload
  --log-level info
