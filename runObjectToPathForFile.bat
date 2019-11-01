@if (@CodeSection == @Batch) @then

@echo off

rem Use %SendKeys% to send keys to the keyboard buffer
set SendKeys=CScript //nologo //E:JScript "%~F0"

start "" /B inkscape %1 --verb EditSelectAll --verb ObjectToPath --verb FileSave --verb FileQuit

ping -n 2 -w 1 127.0.0.1 > NUL
%SendKeys% "{ENTER}"

ping -n 4 -w 1 127.0.0.1 > NUL
%SendKeys% "{ENTER}"

ping -n 3 -w 1 127.0.0.1 > NUL
%SendKeys% "{LEFT}"
ping -n 1 -w 1 127.0.0.1 > NUL
%SendKeys% "{LEFT}"
ping -n 1 -w 1 127.0.0.1 > NUL
%SendKeys% "{ENTER}"

goto :EOF


@end


// JScript section

var WshShell = WScript.CreateObject("WScript.Shell");
WshShell.SendKeys(WScript.Arguments(0));