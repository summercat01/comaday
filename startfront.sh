#!/bin/bash

APP_NAME="comaday-front"

pm2 delete "$APP_NAME"

pm2 start npm --name "$APP_NAME" -- start

pm2 status "$APP_NAME"
