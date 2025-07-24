# Define variables
$winscpPath = "C:\Program Files (x86)\WinSCP\WinSCP.com"  # Update if WinSCP is installed in a different location
$sftpHost = "pdx1-shared-a1-07.dreamhost.com"
$sftpPort = 22
$sftpUsername = "dh_676hzs"
$sftpPassword = "f3oHCjb7*1"

# Local and remote paths
# $localApiPath = "E:/Dropbox/Development/AIBot/api"  # Use forward slashes
# $remoteApiPath = "/home/dh_ehpxen/crantastic.click/api"
$localDistPath = "E:/Dropbox/Development/classList/dist"  # Use forward slashes
$remoteDistPath = "/home/dh_676hzs/classassistant.art/"

# Exclude file
$excludeFile = "upload.ps1"

# Temporary script file for WinSCP
$tempScriptFile = [System.IO.Path]::GetTempFileName()

# Create WinSCP script content
$scriptContent = @"
open sftp://$($sftpUsername):$($sftpPassword)@$($sftpHost):$($sftpPort) -hostkey=*
option batch abort
option confirm off
option transfer binary

# Upload API files
# lcd $localApiPath
# cd $remoteApiPath
# put * -filemask=|.config.json

# Upload Dist files
lcd $localDistPath
cd $remoteDistPath
put * -filemask=|.upload.ps1

exit
"@

# Write script to temp file
Set-Content -Path $tempScriptFile -Value $scriptContent -Force

# Define log file path
$logFilePath = "E:/Dropbox/Development/winscp.log"

# Execute WinSCP script with logging
& $winscpPath /script=$tempScriptFile /log=$logFilePath

# Clean up
Remove-Item $tempScriptFile

Write-Host "SFTP upload completed. Log saved to $logFilePath."
