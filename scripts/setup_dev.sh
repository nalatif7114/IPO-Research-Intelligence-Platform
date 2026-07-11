#!/usr/bin/env bash
echo "Setting up development environment..."
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
echo "Environment ready!"
