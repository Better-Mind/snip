use common::AppState;
use tauri::{async_runtime, Emitter};
use tauri_plugin_fs::FsExt;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

pub mod clipboard;
pub mod common;
pub mod local_bin_store;
pub mod window;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(
    mut frontend_rx: tokio::sync::mpsc::UnboundedReceiver<common::FrontendData>,
    app_state: AppState,
) {
    let mut ctx = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_theme::init(ctx.config_mut()))
        .setup(move |app| {
            let scope = app.fs_scope();
            scope.allow_directory(app_state.local_binary_storage.path(), true);
            let runtime = async_runtime::handle();
            let app_handle = app.handle().clone();
            if let Err(e) = window::apply_vibrancy(app_handle.clone(), "main") {
                println!("Failed to apply vibrancy: {:?}", e);
            }
            runtime.spawn(async move {
                loop {
                    let message = frontend_rx.recv().await.unwrap();
                    println!("Frontend message: {:?}", message);
                    app_handle
                        .emit("new_screenshot", Some(&message))
                        .expect("failed to emit clipboard message");
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(ctx)
        .expect("error while running tauri application");
}
