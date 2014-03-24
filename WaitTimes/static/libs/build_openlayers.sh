#!/bin/sh

#add compiler javascript to tools
cd openlayers/tools/
curl -O http://dl.google.com/closure-compiler/compiler-latest.zip
unzip -o compiler-latest.zip
rm -f compiler-latest.zip
mv -f compiler.jar closure-compiler.jar

#build openlayers
cd ../build
python build.py -c closure full OpenLayers-closure.js

#add all required libs and resources to new openlayers directory
cd ../../
mkdir -p openlayers.min/
mv openlayers/build/OpenLayers-closure.js openlayers.min/OpenLayers.js
cp -rfv openlayers/theme/ openlayers.min/theme/
cp -rfv openlayers/img/ openlayers.min/img/
