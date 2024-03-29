#!/bin/sh

set -e

version=0.5.1
distdir=jscoverage-${version}
zipfile=${distdir}-windows.zip

rm -fr $distdir
mkdir $distdir

cp -a doc $distdir
cp -a jscoverage.exe jscoverage-server.exe $distdir
strip $distdir/*.exe
cp -a COPYING $distdir
unix2dos $distdir/COPYING
cp -a README $distdir/README.txt
unix2dos $distdir/README.txt

timestamp=`cat TIMESTAMP`
find $distdir -exec touch -d "$timestamp" {} \;

rm -f $zipfile
zip -X -r $zipfile $distdir -x '*/.svn/*'
