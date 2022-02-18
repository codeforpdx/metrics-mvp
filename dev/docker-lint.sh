#!/bin/bash

DEV_DIR=$(cd `dirname $0` && pwd)
ROOT_DIR=`dirname $DEV_DIR`

set -eux

docker run -v "$ROOT_DIR/frontend/src:/app/frontend/src" opentransit-metrics-react-dev:latest npm run lint
