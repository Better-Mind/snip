use tauri::{AppHandle, Manager, Runtime};

pub fn apply_vibrancy<R: Runtime>(handle: AppHandle<R>, label: &str) -> Result<(), String> {
    let window = handle
        .get_webview_window(label)
        .ok_or_else(|| format!("Window with label '{}' not found", label))?;

    #[cfg(target_os = "macos")]
    {
        use window_vibrancy::{
            apply_vibrancy as apply_macos_vibrancy, NSVisualEffectMaterial, NSVisualEffectState,
        };

        apply_macos_vibrancy(
            &window,
            NSVisualEffectMaterial::Sidebar,
            Some(NSVisualEffectState::Active),
            Some(12.0),
        )
        .map_err(|e| format!("Failed to apply macOS vibrancy: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        use window_vibrancy::apply_acrylic;
        apply_acrylic(&window, None)
            .map_err(|e: window_vibrancy::Error| format!("Failed to apply Mica effect: {}", e))?;
    }

    Ok(())
}
