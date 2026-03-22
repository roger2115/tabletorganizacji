# Encode WAV files and build final index.html
$sfxDir = "c:\Users\Roger\Downloads\Cyberpunk 2077 UI SFX PACK"
$files = @{
    'boot'       = 'deck_ui_bumper_end_02.wav'
    'click'      = 'deck_ui_default_activation.wav'
    'close'      = 'deck_ui_hide_modal.wav'
    'delete'     = 'deck_ui_switch_toggle_off.wav'
    'edit'       = 'deck_ui_side_menu_fly_in.wav'
    'error'      = 'deck_ui_navigation.wav'
    'firstLogin' = 'deck_ui_achievement_toast.wav'
    'login'      = 'deck_ui_launch_game.wav'
    'logout'     = 'deck_ui_out_of_game_detail.wav'
    'open'       = 'deck_ui_show_modal.wav'
    'save'       = 'deck_ui_switch_toggle_on.wav'
    'select'     = 'deck_ui_into_game_detail.wav'
    'tab'        = 'deck_ui_tab_transition_01.wav'
    'type'       = 'deck_ui_typing.wav'
}

Write-Host "Encoding WAV files..." -ForegroundColor Cyan
$lines = @()
foreach ($key in ($files.Keys | Sort-Object)) {
    $path = Join-Path $sfxDir $files[$key]
    if (Test-Path $path) {
        $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($path))
        $lines += "  ${key}: `"data:audio/wav;base64,${b64}`","
        Write-Host "  $key : OK" -ForegroundColor Green
    } else {
        Write-Host "  $key : MISSING" -ForegroundColor Red
    }
}
$sfxBlock = $lines -join "`n"

Write-Host "`nInjecting into index_new.html..." -ForegroundColor Cyan
$html = [IO.File]::ReadAllText("index_new.html", [Text.Encoding]::UTF8)
$html = $html.Replace("SFX_PLACEHOLDER_NEW", $sfxBlock)

Write-Host "Writing final index.html..." -ForegroundColor Cyan
[IO.File]::WriteAllText("index.html", $html, [Text.Encoding]::UTF8)

$size = [math]::Round((Get-Item "index.html").Length / 1MB, 2)
Write-Host "`nDone! File size: ${size} MB" -ForegroundColor Green
Write-Host "`nNowe funkcje:" -ForegroundColor Cyan
Write-Host "  - Dźwięk pisania (automatyczny)" -ForegroundColor Green
Write-Host "  - Muzyka w tle (włącz w Zarządzanie)" -ForegroundColor Green
Write-Host "  - Suwaki do kontroli audio i wizualizacji" -ForegroundColor Green
Write-Host "  - Body scan 3D dla pacjentów" -ForegroundColor Green
Write-Host "  - Kod Veritas do usunięcia głównego admina" -ForegroundColor Green
Write-Host "  - Powiadomienia na środku ekranu" -ForegroundColor Green
Write-Host "  - Progress bary dla długich operacji" -ForegroundColor Green
Write-Host "  - Więcej opcji konfiguracji" -ForegroundColor Green

