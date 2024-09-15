use color_eyre::eyre::Result;
use std::path::{Path, PathBuf};
use tokio::fs::File;

use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[derive(Clone)]
pub struct LocalBinaryStorage {
    path: PathBuf,
}

impl LocalBinaryStorage {
    pub async fn init(path: PathBuf) -> Result<Self> {
        tokio::fs::create_dir_all(&path).await?;
        Ok(Self { path })
    }
    pub async fn save(
        &self,
        data: impl AsRef<[u8]>,
        file_name: impl AsRef<str>,
    ) -> Result<PathBuf> {
        let file_name = file_name.as_ref();
        let data = data.as_ref();
        let file_path = self.path.join(file_name);
        let mut file = File::create(&file_path).await?;
        file.write_all(data).await?;
        Ok(file_path)
    }
    pub async fn retrieve(&self, file_name: impl AsRef<str>) -> Result<Vec<u8>> {
        let file_name = file_name.as_ref();
        let mut file = File::open(&self.path.join(file_name)).await?;
        let mut data = Vec::new();
        file.read_to_end(&mut data).await?;
        Ok(data)
    }
    pub async fn retrieve_multiple(&self, file_names: Vec<String>) -> Vec<Result<Vec<u8>>> {
        let mut results = Vec::new();
        for file_name in file_names {
            results.push(self.retrieve(file_name).await);
        }
        results
    }
    pub async fn delete(
        &self,
        file_name: impl AsRef<str>,
        ignored_non_existent_file: bool,
    ) -> Result<()> {
        if !self.exists(&file_name).await? && ignored_non_existent_file {
            return Ok(());
        }
        let file_name = file_name.as_ref();
        let path = self.path.join(file_name);
        tokio::fs::remove_file(path).await?;
        Ok(())
    }
    pub async fn delete_multiple(
        &self,
        file_names: Vec<String>,
        ignored_non_existent_file: bool,
    ) -> Vec<Result<()>> {
        let mut results = Vec::new();
        for file_name in file_names {
            results.push(self.delete(file_name, ignored_non_existent_file).await);
        }
        results
    }
    pub async fn exists(&self, file_name: impl AsRef<str>) -> Result<bool> {
        let file_name = file_name.as_ref();
        let path = self.path.join(file_name);
        Ok(path.exists())
    }
    pub fn path(&self) -> &Path {
        &self.path
    }
}
