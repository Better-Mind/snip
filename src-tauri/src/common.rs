use std::hash::{self, DefaultHasher, Hasher};

use image::DynamicImage;
use serde::{Deserialize, Serialize};

use crate::local_bin_store::LocalBinaryStorage;

pub enum OwnedClipboardData {
    Text(String),
    Image(DynamicImage),
    File(Vec<String>),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FrontendData {
    pub path: String,
}

pub fn get_hash<H>(content: H) -> u64
where
    H: hash::Hash,
{
    let mut s = DefaultHasher::new();
    content.hash(&mut s);
    s.finish()
}
#[derive(Clone)]
pub struct AppState {
    pub local_binary_storage: LocalBinaryStorage,
}
