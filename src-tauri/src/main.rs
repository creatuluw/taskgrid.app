#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use tauri::Manager;

fn is_path_safe(base_path: &str, target_path: &str) -> Result<bool, String> {
    let base = Path::new(base_path);
    let target = Path::new(target_path);
    
    let canonical_base = base.canonicalize()
        .map_err(|e| format!("Failed to canonicalize base path: {}", e))?;
    
    let canonical_target = match target.canonicalize() {
        Ok(path) => path,
        Err(_) => return Err(format!("Target path does not exist: {}", target_path)),
    };
    
    Ok(canonical_target.starts_with(&canonical_base))
}

#[tauri::command]
async fn read_file_safe(working_dir: String, file_path: String) -> Result<String, String> {
    let taskgrid_dir = format!("{}/.taskgrid", working_dir);
    
    if !Path::new(&file_path).exists() {
        return Err(format!("File does not exist: {}", file_path));
    }
    
    if !is_path_safe(&taskgrid_dir, &file_path)? {
        return Err("Access denied: Path is outside .taskgrid folder".to_string());
    }
    
    match fs::read_to_string(&file_path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

#[tauri::command]
async fn write_file_safe(working_dir: String, file_path: String, content: String) -> Result<(), String> {
    let taskgrid_dir = format!("{}/.taskgrid", working_dir);
    
    let file_path_normalized = Path::new(&file_path);
    
    if file_path_normalized.exists() {
        if !is_path_safe(&taskgrid_dir, &file_path)? {
            return Err("Access denied: Path is outside .taskgrid folder".to_string());
        }
    } else {
        let parent = file_path_normalized.parent()
            .ok_or("Invalid path: no parent directory".to_string())?;
        
        if !parent.exists() {
            return Err(format!("Parent directory does not exist: {}", parent.display()));
        }
        
        let parent_str = parent.to_string_lossy().to_string();
        if !is_path_safe(&taskgrid_dir, &parent_str)? {
            return Err("Access denied: Path is outside .taskgrid folder".to_string());
        }
    }
    
    if let Some(parent) = file_path_normalized.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directory: {}", e))?;
    }
    
    match fs::write(&file_path, &content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file: {}", e)),
    }
}

#[tauri::command]
async fn list_directory_safe(working_dir: String, dir_path: String) -> Result<Vec<String>, String> {
    let taskgrid_dir = format!("{}/.taskgrid", working_dir);
    
    if !Path::new(&dir_path).exists() {
        return Err(format!("Directory does not exist: {}", dir_path));
    }
    
    if !is_path_safe(&taskgrid_dir, &dir_path)? {
        return Err("Access denied: Path is outside .taskgrid folder".to_string());
    }
    
    match fs::read_dir(&dir_path) {
        Ok(entries) => {
            let paths: Result<Vec<String>, String> = entries
                .map(|entry| {
                    entry
                        .map(|e| e.path().to_string_lossy().to_string())
                        .map_err(|e| format!("Failed to read entry: {}", e))
                })
                .collect();
            paths
        }
        Err(e) => Err(format!("Failed to list directory: {}", e)),
    }
}

#[tauri::command]
async fn delete_file_safe(working_dir: String, file_path: String) -> Result<(), String> {
    let taskgrid_dir = format!("{}/.taskgrid", working_dir);
    
    if !Path::new(&file_path).exists() {
        return Err(format!("File does not exist: {}", file_path));
    }
    
    if !is_path_safe(&taskgrid_dir, &file_path)? {
        return Err("Access denied: Path is outside .taskgrid folder".to_string());
    }
    
    match fs::remove_file(&file_path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete file: {}", e)),
    }
}

#[tauri::command]
async fn create_directory_safe(working_dir: String, dir_path: String) -> Result<(), String> {
    let taskgrid_dir = format!("{}/.taskgrid", working_dir);
    
    let dir_path_normalized = Path::new(&dir_path);
    
    if dir_path_normalized.exists() {
        if !is_path_safe(&taskgrid_dir, &dir_path)? {
            return Err("Access denied: Path is outside .taskgrid folder".to_string());
        }
        return Ok(());
    }
    
    let parent = dir_path_normalized.parent()
        .ok_or("Invalid path: no parent directory".to_string())?;
    
    if parent.as_os_str().is_empty() {
        return Err("Invalid path: cannot create directory at root".to_string());
    }
    
    if parent.exists() {
        let parent_str = parent.to_string_lossy().to_string();
        if !is_path_safe(&taskgrid_dir, &parent_str)? {
            return Err("Access denied: Path is outside .taskgrid folder".to_string());
        }
    }
    
    match fs::create_dir_all(&dir_path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to create directory: {}", e)),
    }
}

#[tauri::command]
async fn backend_ready() -> Result<bool, String> {
    Ok(true)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_file_safe,
            write_file_safe,
            list_directory_safe,
            delete_file_safe,
            create_directory_safe,
            backend_ready
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_theme(Some(tauri::Theme::Dark)).unwrap();
            
            // Show loading screen immediately when webview loads
            let window_clone = window.clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_millis(100));
                let _ = window_clone.eval(r#"
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) {
                        loadingScreen.style.display = 'flex';
                        loadingScreen.style.zIndex = '999999999';
                    }
                    const svelteBody = document.getElementById('svelte-body');
                    if (svelteBody) {
                        svelteBody.style.display = 'none';
                    }
                "#);
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
