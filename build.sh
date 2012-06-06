#!/bin/bash

# build.sh for products

if [ ! -n "$BCPSDK_HOME" ]
then
        echo 'Please set BCPSDK_HOME env variable pointing to sdk checkout'
        exit 1
fi

export BUILD_HOME=$PWD
source $BUILD_HOME/setenv.sh

"$JAVA_HOME/bin/java" $JAVA_ARGS -cp "$ANT_CP" org.apache.tools.ant.Main "-Droot.dir=$BUILD_HOME" "-Dsdk.dir=$BCPSDK_HOME" $*



