# -*- Mode: makefile -*-
#
# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is Mozilla Communicator client code, released
# March 31, 1998.
#
# The Initial Developer of the Original Code is
# Netscape Communications Corporation.
# Portions created by the Initial Developer are Copyright (C) 1998
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#
# Alternatively, the contents of this file may be used under the terms of
# either of the GNU General Public License Version 2 or later (the "GPL"),
# or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****

DEPTH		= .
topsrcdir	= .
srcdir		= .

run_for_side_effects := $(shell echo "MAKE: $(MAKE)")
include $(DEPTH)/config/autoconf.mk

DIRS		= config

ifdef DEHYDRA_PATH
DIRS += analysis-tests
endif

ifdef JS_NATIVE_EDITLINE
DIRS += editline
endif

# editline needs to get built before the shell
ifndef JS_DISABLE_SHELL
DIRS += shell
endif

# FIXME: bug 515383 covers getting these working on wince
ifndef WINCE
ifdef ENABLE_TESTS
DIRS += jsapi-tests
endif
endif

ifdef ENABLE_TESTS
DIRS += tests
endif

MODULE		    = js
LIBRARY_NAME	    = mozjs
STATIC_LIBRARY_NAME = js_static
GRE_MODULE	    = 1

LIBS		= $(NSPR_LIBS) 

ifdef GNU_CXX
ifdef INTEL_CXX
# icc gets special optimize flags
ifdef MOZ_PROFILE_GENERATE
MODULE_OPTIMIZE_FLAGS = -O0
else
MODULE_OPTIMIZE_FLAGS = -O2 -ip
#XXX: do we want different INTERP_OPTIMIZER flags here?
endif
else # not INTEL_CXX
MODULE_OPTIMIZE_FLAGS = -O3 -fstrict-aliasing $(MOZ_OPTIMIZE_SIZE_TWEAK)
# Special optimization flags for jsinterp.c
INTERP_OPTIMIZER = -O3 -fstrict-aliasing
endif
else # not GNU_CXX
ifeq ($(OS_ARCH),SunOS)
MODULE_OPTIMIZE_FLAGS = -xO4
endif
ifeq ($(OS_ARCH),WINNT)
ifdef WINCE
# -GL is not supported on windows mobile while we are using the arm-wince-link command
MODULE_OPTIMIZE_FLAGS = -O2
else
MODULE_OPTIMIZE_FLAGS = -O2 -GL
endif
endif
endif


ifeq (,$(filter-out WINNT WINCE,$(OS_ARCH)))
LIBRARY_NAME	= js$(MOZ_BITS)$(VERSION_NUMBER)
endif

# JavaScript must be built shared, even for static builds, as it is used by
# other modules which are always built shared. Failure to do so results in
# the js code getting copied into xpinstall and jsd as well as mozilla-bin,
# and then the static data cells used for locking no longer work.
#
# In fact, we now build both a static and a shared library, as the
# JS shell would like to link to the static library.

FORCE_SHARED_LIB =
FORCE_STATIC_LIB = 1

VPATH		= $(srcdir)

CPPSRCS		= \
		jsapi.cpp \
		jsarena.cpp \
		jsarray.cpp \
		jsatom.cpp \
		jsbool.cpp \
		jscntxt.cpp \
		jsdate.cpp \
		jsdbgapi.cpp \
		jsdhash.cpp \
		jsdtoa.cpp \
		jsemit.cpp \
		jsexn.cpp \
		jsfun.cpp \
		jsgc.cpp \
		jshash.cpp \
		jsinterp.cpp \
		jsinvoke.cpp \
		jsiter.cpp \
		jslock.cpp \
		jslog2.cpp \
		jsmath.cpp \
		jsnum.cpp \
		jsobj.cpp \
		json.cpp \
		jsopcode.cpp \
		jsparse.cpp \
		jsprf.cpp \
		jsregexp.cpp \
		jsscan.cpp \
		jsscope.cpp \
		jsscript.cpp \
		jsstr.cpp \
		jstask.cpp \
		jsutil.cpp \
		jsxdrapi.cpp \
		jsxml.cpp \
		prmjtime.cpp \
		$(NULL)

ifdef HAVE_DTRACE
CPPSRCS 	+= \
		jsdtracef.cpp
endif

INSTALLED_HEADERS = \
		js-config.h \
		jsautocfg.h \
		jsautokw.h \
		js.msg \
		jsapi.h \
		jsarray.h \
		jsarena.h \
		jsatom.h \
		jsbit.h \
		jsbool.h \
		jsclist.h \
		jscntxt.h \
		jscompat.h \
		jsdate.h \
		jsdbgapi.h \
		jsdhash.h \
		jsdtoa.h \
		jsemit.h \
		jsfun.h \
		jsgc.h \
		jshash.h \
		jsinterp.h \
		jsinttypes.h \
		jsiter.h \
		jslock.h \
		jslong.h \
		jsmath.h \
		jsnum.h \
		jsobj.h \
		jsobjinlines.h \
		json.h \
		jsopcode.tbl \
		jsopcode.h \
		jsotypes.h \
		jsparse.h \
		jsprf.h \
		jsproto.tbl \
		jsprvtd.h \
		jspubtd.h \
		jsregexp.h \
		jsscan.h \
		jsscope.h \
		jsscript.h \
		jsscriptinlines.h \
		jsstaticcheck.h \
		jsstr.h \
		jstask.h \
		jstracer.h \
		jstypes.h \
		jsutil.h \
		jsversion.h \
		jsxdrapi.h \
		jsxml.h \
		$(NULL)

ifdef ENABLE_JIT
VPATH		+= $(srcdir)/nanojit

INSTALLED_HEADERS += \
		jsbuiltins.h    \
		Assembler.h     \
		Allocator.h     \
		CodeAlloc.h     \
		Containers.h    \
		LIR.h		\
		avmplus.h	\
		Fragmento.h	\
		Native.h	\
		Native$(NANOJIT_ARCH).h \
		RegAlloc.h	\
		nanojit.h	\
		$(NULL)

CPPSRCS += \
		jstracer.cpp \
		Assembler.cpp  \
		Allocator.cpp  \
		CodeAlloc.cpp  \
		Containers.cpp \
		Fragmento.cpp  \
		LIR.cpp        \
		RegAlloc.cpp   \
		avmplus.cpp    \
		Native$(NANOJIT_ARCH).cpp \
		jsbuiltins.cpp         \
		$(NULL)

ifdef WINCE
# don't need -c
AS_DASH_C_FLAG =
ASFLAGS += -arch 6
ASFILES += jswince.asm
endif

endif # ENABLE_JIT

ifdef HAVE_DTRACE
INSTALLED_HEADERS += \
		jsdtracef.h \
		$(CURDIR)/javascript-trace.h \
		$(NULL)
endif

ifeq (,$(filter-out WINNT WINCE,$(OS_ARCH)))
INSTALLED_HEADERS += jscpucfg.h
endif

EXPORTS = $(INSTALLED_HEADERS)

JS_SAFE_ARENA	= 1

DASH_R		= -r

ifneq (,$(filter OS2 WINCE WINNT,$(OS_ARCH)))
SDK_LIBRARY = $(IMPORT_LIBRARY)
else
SDK_LIBRARY = $(SHARED_LIBRARY)
endif

include $(topsrcdir)/config/config.mk

EXTRA_DSO_LDOPTS += $(NSPR_LIBS)

ifdef MOZ_MEMORY
ifeq ($(OS_ARCH),SunOS)
EXTRA_DSO_LDOPTS += $(call EXPAND_LIBNAME_PATH,jemalloc,$(DIST)/lib)
endif
endif

ifndef BUILD_OPT
MOCHAFILE	= 1
endif

ifdef MOZ_OJI
ifndef NSBUILDROOT
JSJAVA_STUBHEADERS = \
		-I$(topsrcdir)/sun-java/include/_gen \
		-I$(topsrcdir)/sun-java/netscape/javascript/_jri \
		-I$(topsrcdir)/sun-java/netscape/security/_jri
else
JSJAVA_STUBHEADERS = -I$(JRI_GEN_DIR) -I$(JDK_GEN_DIR)
endif

JSJAVA_CFLAGS	= \
		-I$(topsrcdir)/sun-java/md-include \
		-I$(topsrcdir)/sun-java/include \
		$(JSJAVA_STUBHEADERS)
endif

# Define keyword generator before rules.mk, see bug 323979 comment 50

HOST_SIMPLE_PROGRAMS += host_jskwgen$(HOST_BIN_SUFFIX)
GARBAGE += jsautokw.h host_jskwgen$(HOST_BIN_SUFFIX)

HOST_SIMPLE_PROGRAMS += host_jsoplengen$(HOST_BIN_SUFFIX)
GARBAGE += jsautooplen.h host_jsoplengen$(HOST_BIN_SUFFIX)

USE_HOST_CXX = 1

ifdef HAVE_DTRACE
ifneq ($(OS_ARCH),Darwin)
DTRACE_PROBE_OBJ = $(LIBRARY_NAME)-dtrace.$(OBJ_SUFFIX)
endif
MOZILLA_DTRACE_SRC = $(srcdir)/javascript-trace.d
endif

default::

ifneq (,$(CROSS_COMPILE)$(filter-out WINNT OS2,$(OS_ARCH)))
ifneq (,$(filter-out SYMBIAN WINCE,$(OS_ARCH)))
# nsinstall doesn't get built until we enter config/ in the exports phase,
# so we'll have to manually ensure it gets built here if we want to use
# $(EXPORTS)
export:: config/nsinstall$(HOST_BIN_SUFFIX)
$(PUBLIC) $(SDK_PUBLIC): config/nsinstall$(HOST_BIN_SUFFIX)

config/nsinstall$(HOST_BIN_SUFFIX): $(srcdir)/config/nsinstall.c $(srcdir)/config/pathsub.c
	$(MAKE) -C config/ nsinstall$(HOST_BIN_SUFFIX)
endif
endif

include $(topsrcdir)/config/rules.mk

ifdef MOZ_SYNC_BUILD_FILES
# Because the SpiderMonkey can be distributed and built independently
# of the Mozilla source tree, it contains its own copies of many of
# the files used by the top-level Mozilla build process, from the
# 'config' and 'build' subtrees.
#
# To make it simpler to keep the copies in sync, we follow the policy
# that the SpiderMonkey copies must always be exact copies of those in
# the containing Mozilla tree.  If you've made a change in one, it
# belongs in the other as well.  If the change isn't right for both
# places, then that's something to bring up with the other developers.
#
# Some files are reasonable to diverge; for  example,
# js/config/autoconf.mk.in doesn't need most of the stuff in
# config/autoconf.mk.in.
check-sync-dirs = $(PYTHON) $(srcdir)/config/check-sync-dirs.py
check::
	$(check-sync-dirs) $(srcdir)/config $(MOZ_SYNC_BUILD_FILES)/config
	$(check-sync-dirs) $(srcdir)/build $(MOZ_SYNC_BUILD_FILES)/build

check-valgrind::
	$(check-sync-dirs) $(srcdir)/config $(MOZ_SYNC_BUILD_FILES)/config
	$(check-sync-dirs) $(srcdir)/build $(MOZ_SYNC_BUILD_FILES)/build
endif

ifdef ENABLE_JIT
check::
	$(wildcard $(RUN_TEST_PROGRAM)) $(PYTHON) -u $(srcdir)/trace-test/trace-test.py \
	        --no-slow --no-progress --tinderbox $(DIST)/bin/js$(BIN_SUFFIX)

check-valgrind::
	$(wildcard $(RUN_TEST_PROGRAM)) $(PYTHON) -u $(srcdir)/trace-test/trace-test.py \
	        --valgrind --no-slow --no-progress --tinderbox $(DIST)/bin/js$(BIN_SUFFIX)
endif

DIST_GARBAGE = config.cache config.log config.status \
   config/myrules.mk config/myconfig.mk \
   unallmakefiles js-config js-config.h js-confdefs.h

distclean::
	cat unallmakefiles | $(XARGS) rm -f
	rm -f $(DIST_GARBAGE)

# our build system doesn't handle subdir srcs very gracefully today
export::
	mkdir -p nanojit

DEFINES		+= -DEXPORT_JS_API 

INCLUDES	+= -I$(srcdir)

GARBAGE		+= jscpucfg.o jsautocfg.h jsautocfg.tmp jscpucfg

ifneq (,$(CROSS_COMPILE)$(filter-out WINNT,$(OS_ARCH)))
TARGETS		+= jscpucfg$(HOST_BIN_SUFFIX)
endif

ifdef JS_SAFE_ARENA
DEFINES		+= -DJS_USE_SAFE_ARENA
endif

ifdef JS_THREADSAFE
DEFINES		+= -DJS_THREADSAFE
endif

ifdef JS_NO_THIN_LOCKS
DEFINES		+= -DJS_USE_ONLY_NSPR_LOCKS
endif

ifdef JS_VERSION
DEFINES		+= -DJS_VERSION=$(JS_VERSION)
endif

ifneq ($(findstring -L,$(NSPR_LIBS)),)
NSPR_STATIC_PATH = $(subst -L,,$(findstring -L,$(NSPR_LIBS)))
else
NSPR_STATIC_PATH = $(DIST)/lib
endif

ifdef MOZ_SHARK
CFLAGS += -F/System/Library/PrivateFrameworks
CXXFLAGS += -F/System/Library/PrivateFrameworks
LDFLAGS += -F/System/Library/PrivateFrameworks -framework CHUD
endif

ifdef MOZ_VTUNE
CXXFLAGS += -IC:/Program\ Files/Intel/VTune/Analyzer/Include
EXTRA_DSO_LDOPTS += C:/Program\ Files/Intel/VTune/Analyzer/Lib/VtuneApi.lib
LIBS +=  C:/Program\ Files/Intel/VTune/Analyzer/Lib/VtuneApi.lib
endif

# BeOS and HP-UX do not require the extra linking of "-lm"
ifeq (,$(filter BeOS HP-UX WINNT WINCE OpenVMS,$(OS_ARCH)))
EXTRA_LIBS	+= -lm
endif

# Prevent floating point errors caused by VC++ optimizations
ifeq ($(OS_ARCH)_$(GNU_CC),WINNT_)
ifeq (,$(filter-out 1200 1300 1310,$(_MSC_VER)))
CFLAGS += -Op
else
CFLAGS += -fp:precise
endif
endif # WINNT

ifeq ($(OS_ARCH),FreeBSD)
EXTRA_LIBS	+= -pthread
endif
ifeq ($(OS_ARCH),IRIX)
ifdef USE_N32
DASH_R		+= -n32
endif
endif
ifeq ($(OS_ARCH),Linux)
EXTRA_LIBS	+= -ldl
endif
ifeq ($(OS_ARCH),OSF1)
EXTRA_LIBS	+= -lc_r
endif
ifeq ($(OS_ARCH),SunOS)
ifeq ($(TARGET_CPU),sparc)

ifdef GNU_CC
CFLAGS   += -mcpu=v9
CXXFLAGS += -mcpu=v9
else
ASFLAGS  += -xarch=v8plus -P -L -D_ASM -D__STDC__=0 -K PIC
endif # GNU_CC

endif
ifeq ($(OS_RELEASE),4.1)
EXTRA_LIBS	+= -ldl -lnsl
else
EXTRA_LIBS	+= -lposix4 -ldl -lnsl -lsocket
endif
endif

ifdef MOZ_MEMORY
ifeq ($(OS_ARCH),Darwin)
LDFLAGS += -ljemalloc
endif
endif

# Sun Studio x86 has an optimization bug with LIR.cpp, use -xO2 instead.
ifeq ($(OS_ARCH),SunOS)
ifeq (86,$(findstring 86,$(OS_TEST)))
ifndef GNU_CC
LIR.o: LIR.cpp Makefile.in
	$(REPORT_BUILD)
	@$(MAKE_DEPS_AUTO_CXX)
	$(CXX) -o $@ -c $(patsubst -xO%,-xO2,$(COMPILE_CFLAGS)) $<
endif
endif
endif

# Allow building jsinterp.c with special optimization flags
ifdef INTERP_OPTIMIZER
jsinterp.$(OBJ_SUFFIX): MODULE_OPTIMIZE_FLAGS=$(INTERP_OPTIMIZER)
endif

ifeq ($(OS_ARCH),IRIX)
ifndef GNU_CC
_COMPILE_CFLAGS  = $(patsubst -O%,-O1,$(COMPILE_CFLAGS))
jsapi.o jsxdrapi.o jsarena.o jsarray.o jsatom.o jsemit.o jsfun.o jsinterp.o jsregexp.o jsparse.o jsopcode.o jsscript.o: %.o: %.cpp Makefile.in
	$(REPORT_BUILD)
	@$(MAKE_DEPS_AUTO_CXX)
	$(CXX) -o $@ -c $(_COMPILE_CFLAGS) $<
endif
endif

# An AIX Optimization bug causes PR_dtoa() & JS_dtoa to produce wrong result.
# This suppresses optimization for this single compilation unit.
ifeq ($(OS_ARCH),AIX)
jsatom.o: jsatom.cpp Makefile.in
	$(REPORT_BUILD)
	@$(MAKE_DEPS_AUTO_CXX)
	$(CXX) -o $@ -c $(filter-out $(MOZ_OPTIMIZE_FLAGS), $(COMPILE_CFLAGS)) $<
jsdtoa.o: jsdtoa.cpp Makefile.in
	$(REPORT_BUILD)
	@$(MAKE_DEPS_AUTO_CXX)
	$(CXX) -o $@ -c $(filter-out $(MOZ_OPTIMIZE_FLAGS), $(COMPILE_CFLAGS)) $<
endif

export:: jsautocfg.h

ifeq (,$(CROSS_COMPILE)$(GNU_CC)$(filter-out WINNT,$(OS_ARCH)))
jsautocfg.h:
	touch $@
else
ifeq ($(OS_ARCH),WINCE)
jsautocfg.h:
	touch $@
else
jsautocfg.h: jscpucfg$(HOST_BIN_SUFFIX)
	@rm -f $@ jsautocfg.tmp
	./jscpucfg > jsautocfg.tmp
	mv jsautocfg.tmp $@
endif
endif

# jscpucfg is a strange target
# Needs to be built with the host compiler but needs to include
# the mdcpucfg for the target so it needs the appropriate target defines
ifdef HOST_NSPR_MDCPUCFG
HOST_CXX := $(HOST_CXX) -DMDCPUCFG=$(TARGET_NSPR_MDCPUCFG)
HOST_CXXFLAGS := $(patsubst -DXP_%,,$(HOST_CXXFLAGS))
endif

ifdef CROSS_COMPILE
# jscpucfg needs to know when it's supposed to produce a config for the target
JSCPUCFG_DEFINES = $(ACDEFINES)
endif

ifeq ($(OS_ARCH),QNX)
ifneq ($(OS_TARGET),NTO)
# QNX's compiler apparently can't build a binary directly from a source file.
jscpucfg.o: jscpucfg.cpp Makefile.in
	$(HOST_CXX) $(HOST_CXXFLAGS) -c $(JSCPUCFG_DEFINES) $(DEFINES) $(NSPR_CFLAGS) -o $@ $<

jscpucfg: jscpucfg.o
	$(HOST_CXX) $(HOST_CXXFLAGS) $(JSCPUCFG_DEFINES) $(DEFINES) -o $@ $<
endif
else
ifeq ($(OS_ARCH),WINCE)
jscpucfg$(HOST_BIN_SUFFIX):
	echo no need to build jscpucfg $<
else
jscpucfg$(HOST_BIN_SUFFIX): jscpucfg.cpp Makefile.in
	$(HOST_CXX) $(HOST_CXXFLAGS) $(JSCPUCFG_DEFINES) $(DEFINES) $(NSPR_CFLAGS) $(HOST_OUTOPTION)$@ $<
endif
endif

# Compute the linker flags that programs linking against SpiderMonkey should
# pass to get SpiderMonkey and its dependencies, beyond just the -L and -l
# for the SpiderMonkey library itself.
# - EXTRA_DSO_LDOPTS includes the NSPR -L and -l flags.
# - OS_LIBS includes libraries selected by the configure script.
# - EXTRA_LIBS includes libraries selected by this Makefile.
JS_CONFIG_LIBS=$(EXTRA_DSO_LDOPTS) $(OS_LIBS) $(EXTRA_LIBS) 

# The configure script invokes this rule explicitly at configure time!
# It's important that js-config be ready by the time we're done
# configuring, because we may be running other configure scripts that
# would like to run js-config themselves, before js is built.
#
# This file and rules.mk go through a certain amount of work to decide
# which libraries to build, what to name them, and what flags to pass
# when linking them (and thus what flags its own clients must pass).
# All this information needs to go into the js-config script.  To
# avoid trying to re-compute all that in the configure script, we just
# have the configure script generate this Makefile, and then invoke
# this rule.
at=@
js-config: js-config.in Makefile $(DEPTH)/config/autoconf.mk $(topsrcdir)/config/config.mk $(topsrcdir)/config/rules.mk
	rm -f js-config.tmp
	sed < $< > js-config.tmp \
	-e 's|$(at)prefix$(at)|$(prefix)|' \
	-e 's|$(at)exec_prefix$(at)|$(exec_prefix)|' \
	-e 's|$(at)includedir$(at)|$(includedir)|' \
	-e 's|$(at)libdir$(at)|$(libdir)|' \
	-e 's|$(at)MOZILLA_VERSION$(at)|$(MOZILLA_VERSION)|' \
	-e 's|$(at)LIBRARY_NAME$(at)|$(LIBRARY_NAME)|' \
	-e 's|$(at)NSPR_CFLAGS$(at)|$(NSPR_CFLAGS)|' \
	-e 's|$(at)JS_CONFIG_LIBS$(at)|$(JS_CONFIG_LIBS)|' \
	-e 's|$(at)MOZ_JS_LIBS$(at)|$(MOZ_JS_LIBS)|' \
	&& mv js-config.tmp $@ && chmod +x $@

SCRIPTS = js-config
SDK_BINARY = js-config

install:: $(INSTALLED_HEADERS)
	$(SYSINSTALL) $^ $(DESTDIR)$(includedir)/$(MODULE)

install:: $(SCRIPTS)
	$(SYSINSTALL) $^ $(DESTDIR)$(bindir)

install:: $(LIBRARY) $(SHARED_LIBRARY) $(IMPORT_LIBRARY)
ifneq (,$(LIBRARY))
	$(SYSINSTALL) $(LIBRARY) $(DESTDIR)$(libdir)
endif
ifneq (,$(SHARED_LIBRARY))
	$(SYSINSTALL) $(SHARED_LIBRARY) $(DESTDIR)$(libdir)
endif
ifneq (,$(IMPORT_LIBRARY))
	$(SYSINSTALL) $(IMPORT_LIBRARY) $(DESTDIR)$(libdir)
endif

# Extra dependancies and rules for auto-generated headers
host_jskwgen.$(OBJ_SUFFIX): jsversion.h jskeyword.tbl

# Use CURDIR to avoid finding a jsautokw.h in the source tree (from a
# previous build?) via VPATH when we're building in a separate tree.
jsautokw.h: host_jskwgen$(HOST_BIN_SUFFIX)
	./host_jskwgen$(HOST_BIN_SUFFIX) $@

host_jsoplengen.$(OBJ_SUFFIX): jsopcode.tbl

# Use CURDIR to avoid finding a jsautooplen.h in the source tree (from
# a previous build?) via VPATH when we're building in a separate tree.
$(CURDIR)/jsautooplen.h: host_jsoplengen$(HOST_BIN_SUFFIX)
	./host_jsoplengen$(HOST_BIN_SUFFIX) $@

# Force auto-header generation before compiling any source that may use them
$(CPPSRCS:%.cpp=%.$(OBJ_SUFFIX)): jsautokw.h $(CURDIR)/jsautooplen.h

ifdef HAVE_DTRACE
$(CURDIR)/javascript-trace.h: $(srcdir)/javascript-trace.d
	dtrace -h -s $(srcdir)/javascript-trace.d -o javascript-trace.h.in
	sed 's/if _DTRACE_VERSION/ifdef INCLUDE_MOZILLA_DTRACE/' \
	    javascript-trace.h.in > javascript-trace.h

# We can't automatically generate dependencies on auto-generated headers;
# we have to list them explicitly.
$(addsuffix .$(OBJ_SUFFIX),jsdtracef jsinterp jsobj): $(CURDIR)/javascript-trace.h
endif

ifdef ENABLE_JIT
ifdef GNU_CC
ifndef CROSS_COMPILE
# If we don't have run-mozilla.sh *and* we're linking against NSPR, we don't
# know how to run the JS binary. Oh well

imacro_asm.js: imacro_asm.js.in jsopcode.tbl
	$(CC) -c -x c -E -P -I$(srcdir) $< > $@

GARBAGE += imacros.c.tmp imacro_asm.js

ifneq (,$(wildcard $(RUN_TEST_PROGRAM))$(if $(NSPR_LIBS),,1))
libs:: imacro_asm.js $(srcdir)/imacros.jsasm
	$(wildcard $(RUN_TEST_PROGRAM)) $(DIST)/bin/js$(BIN_SUFFIX) $< $(srcdir)/imacros.jsasm > imacros.c.tmp
	@cmp -s imacros.c.tmp $(srcdir)/imacros.c.out || \
	  (echo "imacros.c.out is out of date. Run 'make update-imacros' to copy it to your source tree."; diff -U 4 $(srcdir)/imacros.c.out imacros.c.out; exit 1)
	@echo "imacros.c.out is up to date"

update-imacros: imacros.c.tmp
	cp $< $(srcdir)/imacros.c.out

.PHONY: update-imacros
endif
endif
endif
endif
