@echo on
REM ==========================================================
REM Project :- HTML5 SDK
REM ==========================================================
setlocal

if not defined BCPSDK_HOME	goto :NoBCPSDKFound

call "%~dp0..\..\setenv.bat"
cd /d "%~dp0"

if not defined JAVA_HOME 	goto :NoJavaFound


"%JAVA_HOME%\bin\java.exe" -Xmx256M -cp "%ANT_CP%" org.apache.tools.ant.Main "-Droot.dir=%BUILD_HOME%" "-Dsdk.dir=%BCPSDK_HOME%" %* -verbose
goto :end

:NoBCPSDKFound
echo BCPSDK_HOME environment variable is not set.
goto :end

:NoJavaFound
echo JAVA_HOME environment variable is not set.
goto :end

:end
endlocal
if "%EXIT_BUILD%" == "TRUE" exit
