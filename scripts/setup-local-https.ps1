[CmdletBinding()]
param(
  [string]$DatabasePath,
  [string]$DataDirectory = (Join-Path $env:LOCALAPPDATA 'PitchProof/local-https')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Path $DataDirectory -Force | Out-Null
$httpsAcl = [System.IO.Directory]::GetAccessControl($DataDirectory, [System.Security.AccessControl.AccessControlSections]::Access)
$httpsAcl.SetAccessRuleProtection($true, $false)
foreach ($httpsExistingRule in $httpsAcl.Access) { $httpsAcl.RemoveAccessRuleSpecific($httpsExistingRule) }
$httpsUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
$httpsRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
  $httpsUser, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
$httpsAcl.AddAccessRule($httpsRule)
[System.IO.Directory]::SetAccessControl($DataDirectory, $httpsAcl)
$httpsConfigurationPath = Join-Path $DataDirectory 'config.json'

if (Test-Path -LiteralPath $httpsConfigurationPath) {
  $httpsExisting = Get-Content -Raw -LiteralPath $httpsConfigurationPath | ConvertFrom-Json
  if ($DatabasePath -and [System.IO.Path]::GetFullPath($DatabasePath) -ne $httpsExisting.databasePath) {
    throw 'This HTTPS fixture already has a database. Use a separate DataDirectory to select another one.'
  }
  $DatabasePath = $httpsExisting.databasePath
}

if (-not $DatabasePath) { $DatabasePath = Join-Path $DataDirectory 'accounts.sqlite' }
$DatabasePath = [System.IO.Path]::GetFullPath($DatabasePath)
if (-not (Test-Path -LiteralPath (Split-Path -Parent $DatabasePath) -PathType Container)) {
  throw 'The private database parent directory must exist.'
}

$httpsPublicPath = Join-Path $DataDirectory 'localhost.cer'
$httpsPfxPath = Join-Path $DataDirectory 'localhost.pfx'
$httpsPasswordPath = Join-Path $DataDirectory 'pfx-password.txt'
$httpsSecretPath = Join-Path $DataDirectory 'auth-secret.txt'
$httpsCertificate = $null
if ((Test-Path -LiteralPath $httpsPublicPath) -and (Test-Path -LiteralPath $httpsPfxPath) -and (Test-Path -LiteralPath $httpsPasswordPath) -and (Test-Path -LiteralPath $httpsSecretPath)) {
  $httpsPriorPublic = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($httpsPublicPath)
  $httpsPriorStorePath = 'Cert:/CurrentUser/My/' + $httpsPriorPublic.Thumbprint
  if ((Test-Path -LiteralPath $httpsPriorStorePath) -and $httpsPriorPublic.NotAfter -gt (Get-Date).AddHours(1)) {
    $httpsCertificate = Get-Item -LiteralPath $httpsPriorStorePath
  }
}
$httpsUtf8 = New-Object System.Text.UTF8Encoding($false)
if (-not $httpsCertificate) {
  $httpsCertificate = New-SelfSignedCertificate -DnsName 'localhost' -Type SSLServerAuthentication -CertStoreLocation Cert:/CurrentUser/My -FriendlyName 'Pitch Proof localhost HTTPS test (7 days)' -NotBefore (Get-Date).AddMinutes(-5) -NotAfter (Get-Date).AddDays(7) -KeyAlgorithm RSA -KeyLength 2048 -HashAlgorithm SHA256 -KeyExportPolicy Exportable -KeyUsage DigitalSignature,KeyEncipherment
  $httpsRandom = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $httpsRandomBytes = New-Object byte[] 48
    $httpsRandom.GetBytes($httpsRandomBytes)
    $httpsPassword = [Convert]::ToBase64String($httpsRandomBytes)
    $httpsRandom.GetBytes($httpsRandomBytes)
    $httpsSecret = [Convert]::ToBase64String($httpsRandomBytes)
  } finally { $httpsRandom.Dispose() }

  $httpsSecurePassword = ConvertTo-SecureString -String $httpsPassword -AsPlainText -Force
  Export-PfxCertificate -Cert $httpsCertificate -FilePath $httpsPfxPath -Password $httpsSecurePassword -CryptoAlgorithmOption AES256_SHA256 -Force | Out-Null
  Export-Certificate -Cert $httpsCertificate -FilePath $httpsPublicPath -Force | Out-Null
  [System.IO.File]::WriteAllText($httpsPasswordPath, $httpsPassword, $httpsUtf8)
  if (-not (Test-Path -LiteralPath $httpsSecretPath)) {
    [System.IO.File]::WriteAllText($httpsSecretPath, $httpsSecret, $httpsUtf8)
  }
}

# Trust only this short-lived server certificate, not a certificate-signing CA.
$httpsRootPath = 'Cert:/CurrentUser/Root/' + $httpsCertificate.Thumbprint
if (-not (Test-Path -LiteralPath $httpsRootPath)) {
  & certutil.exe -user -f -addstore Root $httpsPublicPath | Out-Null
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $httpsRootPath)) {
    throw 'The localhost certificate was not trusted; setup is incomplete.'
  }
}

$httpsConfiguration = @{
  origin = 'https://localhost:31318'
  thumbprint = $httpsCertificate.Thumbprint
  expires = $httpsCertificate.NotAfter.ToUniversalTime().ToString('o')
  databasePath = $DatabasePath
  pfxPath = $httpsPfxPath
  certificatePath = $httpsPublicPath
  pfxPassphraseFile = $httpsPasswordPath
  authSecretFile = $httpsSecretPath
}
[System.IO.File]::WriteAllText($httpsConfigurationPath, ($httpsConfiguration | ConvertTo-Json), $httpsUtf8)
[pscustomobject]@{ origin = $httpsConfiguration.origin; expires = $httpsConfiguration.expires; thumbprint = $httpsConfiguration.thumbprint; currentUserTrusted = $true } | ConvertTo-Json -Compress
