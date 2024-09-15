// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use clipboard_rs::{ClipboardWatcher, ClipboardWatcherContext};
use home::home_dir;
use htn_2024_lib::{
    clipboard::ClipboardHandler, common::AppState, local_bin_store::LocalBinaryStorage,
};

fn main() {
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap();
    let (frontend_tx, frontend_rx) = tokio::sync::mpsc::unbounded_channel();
    let app_state = runtime.block_on(async {
        AppState {
            local_binary_storage: LocalBinaryStorage::init(
                home_dir()
                    .expect("Failed to get home directory")
                    .join(".htn_2024"),
            )
            .await
            .unwrap(),
        }
    });

    runtime.spawn({
        let app_state = app_state.clone();
        async move {
            let (clipboard_tx, clipboard_rx) = tokio::sync::mpsc::unbounded_channel();
            let clipboard_handler = ClipboardHandler::new(clipboard_tx);
            let mut watcher = ClipboardWatcherContext::new().unwrap();
            let _watcher_shutdown = watcher
                .add_handler(clipboard_handler)
                .get_shutdown_channel();

            let pipeline_handle = tokio::spawn(htn_2024_lib::clipboard::spawn_data_pipeline(
                clipboard_rx,
                frontend_tx,
                app_state.local_binary_storage.clone(),
            ));
            let watcher_handle = tokio::task::spawn_blocking(move || watcher.start_watch());
            tokio::select! {
                _ = pipeline_handle => {
                    eprintln!("Data pipeline unexpectedly finished. Exiting...");
                    std::process::exit(1);
                }
                _ = watcher_handle => {
                    eprintln!("Clipboard watcher unexpectedly finished. Exiting...");
                    std::process::exit(1);
                }
            }
        }
    });
    htn_2024_lib::run(frontend_rx, app_state)
}
