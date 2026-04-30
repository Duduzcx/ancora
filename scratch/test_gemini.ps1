$apiKey = "AIzaSyDAyY3nwBDlxjDrxI06ip7-9-u-rDIRjN0"
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey"

$body = '{
    "contents": [{
        "parts": [{ "text": "Olá, você está funcionando?" }]
    }]
}'

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ SUCESSO! A IA respondeu:" -ForegroundColor Green
    Write-Host ($response.candidates[0].content.parts[0].text)
} catch {
    Write-Host "❌ ERRO! Detalhes do erro:" -ForegroundColor Red
    $errorDetails = $_.Exception.Message
    Write-Host $errorDetails
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $respBody = $reader.ReadToEnd()
        Write-Host "Corpo da resposta: $respBody"
    }
}
