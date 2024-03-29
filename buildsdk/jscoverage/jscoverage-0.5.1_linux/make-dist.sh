#!/bin/sh

set -e

version=0.5.1
distdir=jscoverage-${version}

rm -fr $distdir
mkdir $distdir

# copy all files in SVN
for file in $(svn status -qv | sed 's/.* //' | sort)
do
  if [ -f "$file" ]
  then
    cp -a --parents "$file" $distdir
  fi
done

# add generated files
cp -a --parents aclocal.m4 \
                configure \
                config.h.in \
                Makefile.in config.guess config.sub depcomp install-sh missing \
                $distdir
cp -a --parents tests/Makefile.in $distdir
cp -a --parents doc/instrumented $distdir
cp -a --parents doc/instrumented-inverted $distdir

# remove unnecessary files
rm $distdir/TIMESTAMP
rm $distdir/bootstrap.sh
rm $distdir/make-maintainer-clean.sh
rm -r $distdir/scriptaculous*
rm -r $distdir/selenium

timestamp=`cat TIMESTAMP`
find $distdir -exec touch -d "$timestamp" {} \;

tarfile=${distdir}.tar
tar cvf $tarfile --owner=0 --group=0 $distdir
bzip2 -c $tarfile > ${tarfile}.bz2
xz -c $tarfile > ${tarfile}.xz
