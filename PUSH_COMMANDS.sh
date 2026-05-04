#!/bin/bash

# First, create a repository on GitHub called "anime-tracker"
# Then replace YOUR_USERNAME with your actual GitHub username below

echo "Add your GitHub repository as remote:"
git remote add origin https://github.com/YOUR_USERNAME/anime-tracker.git

echo "Push to GitHub:"
git branch -M main
git push -u origin main

# Example (replace YOUR_USERNAME):
# git remote add origin https://github.com/johnsmith/anime-tracker.git
# git branch -M main
# git push -u origin main
