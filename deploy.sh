#!/bin/bash
read -p "Commit message: " msg
git add .
git commit -m "$msg"
npm run build
firebase deploy
