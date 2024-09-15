use clipboard_rs::{common::RustImage, Clipboard, ClipboardContext, ContentFormat};
use home::home_dir;
use image::DynamicImage;
use tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use webp::Encoder;

use crate::{
    common::{get_hash, FrontendData, OwnedClipboardData},
    local_bin_store::LocalBinaryStorage,
};

pub async fn spawn_data_pipeline(
    mut data_rx: UnboundedReceiver<OwnedClipboardData>,
    tx: UnboundedSender<FrontendData>,
    local_bin_store: LocalBinaryStorage,
) {
    let mut last_hash = None;
    while let Some(data) = data_rx.recv().await {
        match data {
            OwnedClipboardData::Text(text) => {
                if text.trim().is_empty() {
                    continue;
                }
            }
            OwnedClipboardData::Image(image) => {
                let (image_width, image_height) = (image.width(), image.height());
                // Thumbnail
                let thumbnail = if image_width > 512 || image_height > 256 {
                    image.thumbnail(512, 256)
                } else {
                    image.clone()
                };
                let hash = get_hash(&thumbnail.as_bytes());
                if let Some(last_hash) = last_hash {
                    if last_hash == hash {
                        continue; //skip if the image is the same
                    }
                }
                last_hash = Some(hash);

                let compressed = tokio::task::spawn_blocking(move || {
                    let quality = 80.0;
                    let encoder: Encoder = Encoder::from_image(&image).unwrap();
                    let webp = encoder.encode(quality);
                    webp.to_vec()
                })
                .await
                .unwrap();
                let file_name = format!("{}.webp", hash);
                let path = local_bin_store.save(compressed, file_name).await.unwrap();
                println!("Saved image to {:?}", path);
                tx.send(FrontendData {
                    path: path.to_string_lossy().to_string(),
                })
                .unwrap();
            }
            OwnedClipboardData::File(file) => {}
        }
    }
}

pub struct ClipboardHandler {
    data_sender: UnboundedSender<OwnedClipboardData>,
    clipboard: ClipboardContext,
}

impl ClipboardHandler {
    pub fn new(data_sender: UnboundedSender<OwnedClipboardData>) -> Self {
        Self {
            data_sender,
            clipboard: clipboard_rs::ClipboardContext::new().unwrap(),
        }
    }
    pub fn handle_text(&self, text: String) {
        self.data_sender
            .send(OwnedClipboardData::Text(text))
            .unwrap();
    }
    pub fn handle_image(&self, image: DynamicImage) {
        self.data_sender
            .send(OwnedClipboardData::Image(image))
            .unwrap();
    }
    pub fn handle_files(&self, file: Vec<String>) {
        self.data_sender
            .send(OwnedClipboardData::File(file))
            .unwrap();
    }
}

impl clipboard_rs::ClipboardHandler for ClipboardHandler {
    fn on_clipboard_change(&mut self) {
        println!("Clipboard change happened!");
        std::thread::sleep(std::time::Duration::from_millis(100));
        if self.clipboard.has(ContentFormat::Files) {
            let files = self.clipboard.get_files().unwrap();
            println!("Clipboard files: {:?}", files);
            self.handle_files(files);
        } else if self.clipboard.has(ContentFormat::Text) {
            let text = self.clipboard.get_text().unwrap();
            println!("Clipboard text: {:?}", text);
            self.handle_text(text);
        } else if let Ok(image) = self.clipboard.get_image() {
            println!("image size: {:?}", image.get_size());
            let dyn_image = image.get_dynamic_image().unwrap();
            self.handle_image(dyn_image);
        } else {
            println!("Clipboard has no content");
        }
    }
}
