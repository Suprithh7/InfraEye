$ErrorActionPreference = "Stop"

$baseUrl = if ($env:SLUMSAFE_API_URL) { $env:SLUMSAFE_API_URL } else { "http://localhost:8080" }

Write-Host "Checking gateway health at $baseUrl ..."
$health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
$cities = Invoke-RestMethod -Uri "$baseUrl/v1/cities" -Method Get
$summary = Invoke-RestMethod -Uri "$baseUrl/v1/dashboard/summary?cityId=mumbai-dharavi" -Method Get
$queue = Invoke-RestMethod -Uri "$baseUrl/v1/risk-queue?cityId=mumbai-dharavi&role=Supervisor" -Method Get -Headers @{ "x-demo-role" = "Supervisor" }
$audit = Invoke-RestMethod -Uri "$baseUrl/v1/audit/logs?cityId=mumbai-dharavi&role=Supervisor" -Method Get -Headers @{ "x-demo-role" = "Supervisor" }

[pscustomobject]@{
  health_status = $health.status
  city_count = $cities.Count
  top_structure = $queue.items[0].structureId
  audit_count = $audit.items.Count
  high_risk_structures = $summary.highRiskStructures
}
