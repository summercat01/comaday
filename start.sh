#!/bin/bash

APP_NAME="comaday"

pm2 delete "$APP_NAME"

pm2 start dist/main.js --name "$APP_NAME"

pm2 status "$APP_NAME"
