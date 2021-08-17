#!/bin/bash

set +x
echo "Starting deploy"
ssh deploy@sudokugeni.us "bash -c 'rm -rf /var/sudokugeni.us/html/*' && echo 'success deleted' " && echo "ssh deploy@sudokugeni.us deleted /var/..."
echo $TRAVIS_BUILD_DIR
ls -la
rsync -r --delete-after --quiet $TRAVIS_BUILD_DIR/dist/ deploy@sudokugeni.us:/var/sudokugeni.us/html/ && echo "rsync"
