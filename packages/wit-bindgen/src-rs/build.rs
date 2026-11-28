// Build script to extract wit-bindgen-core version
use std::fs;
use std::path::Path;

fn main() {
    // Tell Cargo to rerun this build script if Cargo.toml changes
    println!("cargo:rerun-if-changed=Cargo.toml");

    // Read and parse Cargo.toml to extract wit-bindgen-core version
    let cargo_toml_path = Path::new("Cargo.toml");
    match fs::read_to_string(cargo_toml_path) {
        Ok(cargo_toml_content) => match extract_wit_bindgen_core_version(&cargo_toml_content) {
            Ok(version) => {
                println!("cargo:rustc-env=WIT_BINDGEN_CORE_VERSION={}", version);
            }
            Err(e) => {
                eprintln!("Warning: Failed to parse wit-bindgen-core version: {}", e);
                println!("cargo:rustc-env=WIT_BINDGEN_CORE_VERSION=unknown");
            }
        },
        Err(e) => {
            eprintln!("Warning: Failed to read Cargo.toml: {}", e);
            println!("cargo:rustc-env=WIT_BINDGEN_CORE_VERSION=unknown");
        }
    }
}

/// Extract wit-bindgen-core version from Cargo.toml content
fn extract_wit_bindgen_core_version(
    cargo_toml_content: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    let parsed: toml::Value = toml::from_str(cargo_toml_content)?;

    // Look in dependencies section
    if let Some(dependencies) = parsed.get("dependencies") {
        if let Some(wit_bindgen_core) = dependencies.get("wit-bindgen-core") {
            return extract_version_from_dependency(wit_bindgen_core);
        }
    }

    // Look in dev-dependencies section
    if let Some(dev_dependencies) = parsed.get("dev-dependencies") {
        if let Some(wit_bindgen_core) = dev_dependencies.get("wit-bindgen-core") {
            return extract_version_from_dependency(wit_bindgen_core);
        }
    }

    // Look in build-dependencies section
    if let Some(build_dependencies) = parsed.get("build-dependencies") {
        if let Some(wit_bindgen_core) = build_dependencies.get("wit-bindgen-core") {
            return extract_version_from_dependency(wit_bindgen_core);
        }
    }

    Err("wit-bindgen-core dependency not found".into())
}

/// Extract version string from a TOML dependency value
fn extract_version_from_dependency(
    dependency: &toml::Value,
) -> Result<String, Box<dyn std::error::Error>> {
    match dependency {
        // Simple version string: wit-bindgen-core = "0.42.1"
        toml::Value::String(version) => Ok(version.clone()),

        // Table format: wit-bindgen-core = { version = "0.42.1", features = [...] }
        toml::Value::Table(table) => {
            if let Some(toml::Value::String(version)) = table.get("version") {
                Ok(version.clone())
            } else {
                Err("version field not found in dependency table".into())
            }
        }

        _ => Err("unsupported dependency format".into()),
    }
}
