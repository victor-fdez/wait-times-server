#!/bin/sh

link="https://github.com/twbs/bootstrap/archive/v3.1.1.zip"
base=$(basename ${link})
clean=${base%.zip}
clean=${clean#v}
inst_dir="bootstrap"
filename="$inst_dir-$clean"
#clean bootstrap if allready exists
rm -rf $inst_dir/
#get file online
wget $link
unzip $(basename $link)
mkdir $inst_dir/
#move all files to folder
mv $filename/dist/* $inst_dir/
#clean unused files
rm -fv $base
rm -rfv $filename
