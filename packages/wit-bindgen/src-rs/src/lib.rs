use std::collections::HashMap;
use std::path::{Path, PathBuf};

use anyhow::{anyhow, Context};
use wasmparser::{Parser, Payload};
use wit_bindgen_c as c;
use wit_bindgen_core::wit_parser::{
    PackageId as BindgenPackageId, Resolve as BindgenResolve, SourceMap as BindgenSourceMap,
};
use wit_bindgen_core::Files;
use wit_bindgen_core::WorldGenerator;
use wit_bindgen_cpp as cpp;
use wit_bindgen_csharp as csharp;
use wit_bindgen_go as go;
use wit_bindgen_markdown as markdown;
use wit_bindgen_moonbit as moonbit;
use wit_bindgen_rust as rust;
use wit_component as wcomp;
use wit_parser::{PackageId, Resolve, SourceMap};

// Generate component model bindings from our WIT file
wit_bindgen::generate!({
    world: "wit-bindgen-wasm",
    path: "wit/wit-bindgen.wit",
});

/// Convert bytes to Latin1 string encoding for safe round-trip conversion
/// Each byte (0-255) maps directly to Unicode code point (0-255)
fn bytes_to_latin1_string(bytes: &[u8]) -> String {
    bytes.iter().map(|&b| b as char).collect()
}

fn normalize_source_path(source_path: Option<&str>) -> Option<PathBuf> {
    source_path.and_then(|value| {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(PathBuf::from(trimmed))
        }
    })
}

fn normalize_optional_text(value: Option<&str>) -> Option<&str> {
    value.and_then(|entry| {
        let trimmed = entry.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    })
}

fn source_label(source_path: Option<&str>) -> String {
    normalize_source_path(source_path)
        .map(|path| path.display().to_string())
        .unwrap_or_else(|| "inline content".to_string())
}

fn load_resolve(
    content: &str,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
    operation: &str,
) -> anyhow::Result<(Resolve, PackageId)> {
    let mut resolve = Resolve::default();
    let package_id = match normalize_optional_text(source_files_json) {
        Some(source_files_json) => {
            let source_files =
                serde_json::from_str::<HashMap<String, String>>(source_files_json)
                    .with_context(|| format!("{operation}: invalid source files payload"))?;
            let mut source_map = SourceMap::default();
            for (file_path, file_contents) in source_files {
                source_map.push_str(&file_path, file_contents);
            }
            let unresolved_group = source_map.parse().map_err(|(_source_map, error)| {
                anyhow!(
                    "{}: {error}",
                    format!("{operation} from {}", source_label(source_path))
                )
            })?;
            resolve
                .push_group(unresolved_group)
                .with_context(|| format!("{operation} from {}", source_label(source_path)))?
        }
        None => {
            let main_path = normalize_source_path(source_path)
                .unwrap_or_else(|| PathBuf::from("inline.wit"))
                .display()
                .to_string();
            resolve
                .push_source(&main_path, content)
                .with_context(|| format!("{operation} from {}", source_label(source_path)))?
        }
    };

    Ok((resolve, package_id))
}

fn load_bindgen_resolve(
    content: &str,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
    operation: &str,
) -> anyhow::Result<(BindgenResolve, BindgenPackageId)> {
    let mut resolve = BindgenResolve::default();
    let package_id = match normalize_optional_text(source_files_json) {
        Some(source_files_json) => {
            let source_files =
                serde_json::from_str::<HashMap<String, String>>(source_files_json)
                    .with_context(|| format!("{operation}: invalid source files payload"))?;
            let mut source_map = BindgenSourceMap::default();
            for (file_path, file_contents) in source_files {
                source_map.push_str(&file_path, file_contents);
            }
            let unresolved_group = source_map.parse().map_err(|(_source_map, error)| {
                anyhow!(
                    "{}: {error}",
                    format!("{operation} from {}", source_label(source_path))
                )
            })?;
            resolve
                .push_group(unresolved_group)
                .with_context(|| format!("{operation} from {}", source_label(source_path)))?
        }
        None => {
            let main_path = normalize_source_path(source_path)
                .unwrap_or_else(|| PathBuf::from("inline.wit"))
                .display()
                .to_string();
            resolve
                .push_source(&main_path, content)
                .with_context(|| format!("{operation} from {}", source_label(source_path)))?
        }
    };

    Ok((resolve, package_id))
}

struct WitBindgenComponent;

export!(WitBindgenComponent);

impl exports::wit_bindgen::wasm::wit_validator::Guest for WitBindgenComponent {
    fn validate_wit_syntax(
        content: String,
        source_path: Option<String>,
        source_files_json: Option<String>,
    ) -> bool {
        let trimmed = content.trim();

        if trimmed.is_empty() {
            return false;
        }

        load_resolve(
            trimmed,
            source_path.as_deref(),
            source_files_json.as_deref(),
            "Failed to validate WIT syntax",
        )
        .is_ok()
    }

    fn validate_wit_syntax_detailed(
        content: String,
        source_path: Option<String>,
        source_files_json: Option<String>,
    ) -> String {
        let trimmed = content.trim();

        if trimmed.is_empty() {
            return serde_json::json!({
                "valid": false,
                "error": "Empty or whitespace-only content is not valid WIT",
                "errorType": "validation"
            })
            .to_string();
        }

        match load_resolve(
            trimmed,
            source_path.as_deref(),
            source_files_json.as_deref(),
            "Failed to validate WIT syntax",
        ) {
            Ok((_resolve, _package_id)) => serde_json::json!({
                "valid": true
            })
            .to_string(),
            Err(e) => {
                let error_message = format!("{e:#}");

                if error_message.contains("package not found")
                    || error_message.contains("interface not found")
                    || error_message.contains("failed to find package")
                {
                    serde_json::json!({
                        "valid": false,
                        "error": format!("Dependency error: {}", error_message),
                        "errorType": "dependency"
                    })
                    .to_string()
                } else {
                    serde_json::json!({
                        "valid": false,
                        "error": error_message,
                        "errorType": "parsing"
                    })
                    .to_string()
                }
            }
        }
    }

    fn extract_interfaces(content: String) -> String {
        let mut interfaces = Vec::new();

        let inline_path = Path::new("inline.wit");
        let mut resolve = Resolve::default();
        match resolve.push_str(inline_path, &content) {
            Ok(package_id) => {
                let package = &resolve.packages[package_id];
                for (interface_name, _interface_id) in &package.interfaces {
                    interfaces.push(interface_name.clone());
                }
            }
            Err(_) => {}
        }

        interfaces.join(", ")
    }

    fn has_world_definition(content: String) -> bool {
        let inline_path = Path::new("inline.wit");
        let mut resolve = Resolve::default();
        match resolve.push_str(inline_path, &content) {
            Ok(package_id) => {
                let package = &resolve.packages[package_id];
                !package.worlds.is_empty()
            }
            Err(_) => content.contains("world "),
        }
    }

    fn version() -> String {
        env!("WIT_BINDGEN_CORE_VERSION").to_string()
    }

    fn generate_bindings(
        content: String,
        language: String,
        world_name: Option<String>,
        source_path: Option<String>,
        source_files_json: Option<String>,
    ) -> String {
        let files = match language.to_lowercase().as_str() {
            "rust" => generate_rust_bindings(
                &content,
                world_name,
                source_path.as_deref(),
                source_files_json.as_deref(),
            ),
            "c" => generate_c_bindings(
                &content,
                world_name,
                source_path.as_deref(),
                source_files_json.as_deref(),
            ),
            "cpp" | "c++" => generate_cpp_bindings(
                &content,
                world_name,
                source_path.as_deref(),
                source_files_json.as_deref(),
            ),
            "csharp" | "c#" => generate_csharp_bindings(
                &content,
                world_name,
                source_path.as_deref(),
                source_files_json.as_deref(),
            ),
            "go" => generate_go_bindings(
                &content,
                world_name,
                source_path.as_deref(),
                source_files_json.as_deref(),
            ),
            "moonbit" => generate_moonbit_bindings(
                &content,
                world_name,
                source_path.as_deref(),
                source_files_json.as_deref(),
            ),
            "markdown" | "md" => generate_markdown_bindings(
                &content,
                world_name,
                source_path.as_deref(),
                source_files_json.as_deref(),
            ),
            _ => {
                let mut error_files = HashMap::new();
                error_files.insert(
                    "error.txt".to_string(),
                    format!("// Unsupported language: {}\n// Supported languages: rust, c, cpp, csharp, go, moonbit, markdown\n// Note: Go bindings moved to go.bytecodealliance.org/cmd/wit-bindgen-go", language)
                );
                error_files
            }
        };

        serde_json::to_string(&files).unwrap_or_else(|_| "{}".to_string())
    }

    fn extract_wit_from_component(bytes: Vec<u8>) -> String {
        match extract_wit_from_component_impl(&bytes) {
            Ok(s) => s,
            Err(e) => {
                eprintln!("WIT extraction failed: {}", e);
                String::new()
            }
        }
    }

    fn extract_core_wasm_from_component(bytes: Vec<u8>) -> String {
        match extract_core_wasm_impl(&bytes) {
            Ok(map) => serde_json::to_string(&map).unwrap_or_else(|_| "{}".to_string()),
            Err(e) => {
                eprintln!("Core wasm extraction failed: {}", e);
                "{}".to_string()
            }
        }
    }

    fn is_wit_file_extension(filename: String) -> bool {
        filename.to_lowercase().ends_with(".wit")
    }

    fn get_wit_bindgen_version() -> String {
        env!("WIT_BINDGEN_CORE_VERSION").to_string()
    }
}

// --- Implementation functions (unchanged logic from previous version) ---

fn extract_wit_from_component_impl(bytes: &[u8]) -> anyhow::Result<String> {
    let decoded =
        wcomp::decode(bytes).with_context(|| "failed to decode component metadata to WIT")?;

    let mut printer = wcomp::WitPrinter::new(wcomp::OutputToString::default());
    let _ = printer.emit_docs(true);

    let resolve: &Resolve = decoded.resolve();
    let main_pkg: PackageId = decoded.package();

    use std::collections::{HashSet, VecDeque};
    let mut visited: HashSet<PackageId> = HashSet::new();
    let mut queue: VecDeque<PackageId> = VecDeque::new();
    queue.push_back(main_pkg);
    visited.insert(main_pkg);
    while let Some(pkg) = queue.pop_front() {
        for dep in resolve.package_direct_deps(pkg) {
            if !visited.contains(&dep) {
                visited.insert(dep);
                queue.push_back(dep);
            }
        }
    }
    let nested: Vec<PackageId> = resolve
        .topological_packages()
        .into_iter()
        .filter(|p| *p != main_pkg && visited.contains(p))
        .collect();

    printer
        .print(resolve, main_pkg, &nested)
        .with_context(|| "failed to render WIT text from decoded component")?;
    let out: String = printer.output.into();
    Ok(out)
}

fn extract_core_wasm_impl(bytes: &[u8]) -> anyhow::Result<HashMap<String, String>> {
    let mut map = HashMap::new();
    let parser = Parser::new(0);
    let mut index: usize = 0;
    for payload in parser.parse_all(bytes) {
        let payload = payload?;
        match payload {
            Payload::ModuleSection {
                unchecked_range, ..
            } => {
                let start = usize::try_from(unchecked_range.start)
                    .with_context(|| "core module start offset exceeds addressable memory")?;
                let end = usize::try_from(unchecked_range.end)
                    .with_context(|| "core module end offset exceeds addressable memory")?;
                let module_bytes = &bytes[start..end];
                let filename = format!("core{index}.wasm");
                map.insert(filename, bytes_to_latin1_string(module_bytes));
                index += 1;
            }
            Payload::ComponentSection { .. } => {}
            _ => {}
        }
    }
    Ok(map)
}

fn generate_rust_bindings(
    content: &str,
    world_name: Option<String>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> HashMap<String, String> {
    match generate_rust_with_wit_bindgen(
        content,
        world_name.as_deref(),
        source_path,
        source_files_json,
    ) {
        Ok(files) => files,
        Err(e) => {
            let mut error_files = HashMap::new();
            error_files.insert(
                "error.txt".to_string(),
                format!("Rust binding generation failed: {e:#}"),
            );
            error_files
        }
    }
}

fn generate_rust_with_wit_bindgen(
    content: &str,
    world_name: Option<&str>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> Result<HashMap<String, String>, anyhow::Error> {
    let (mut resolve, package_id) = load_bindgen_resolve(
        content,
        source_path,
        source_files_json,
        "Failed to parse WIT content for Rust binding generation",
    )?;

    let world_id = resolve.select_world(&[package_id], world_name)?;

    let opts = rust::Opts {
        generate_all: true,
        ..Default::default()
    };
    let mut generator = opts.build();
    let mut files = Files::default();
    generator.generate(&mut resolve, world_id, &mut files)?;

    let mut result = HashMap::new();
    for (filename, content) in files.iter() {
        result.insert(filename.to_string(), bytes_to_latin1_string(content));
    }
    Ok(result)
}

fn generate_c_bindings(
    content: &str,
    world_name: Option<String>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> HashMap<String, String> {
    match generate_c_with_wit_bindgen(
        content,
        world_name.as_deref(),
        source_path,
        source_files_json,
    ) {
        Ok(files) => files,
        Err(e) => {
            let mut error_files = HashMap::new();
            error_files.insert(
                "error.txt".to_string(),
                format!("C binding generation failed: {e:#}"),
            );
            error_files
        }
    }
}

fn generate_c_with_wit_bindgen(
    content: &str,
    world_name: Option<&str>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> Result<HashMap<String, String>, anyhow::Error> {
    let (mut resolve, package_id) = load_bindgen_resolve(
        content,
        source_path,
        source_files_json,
        "Failed to parse WIT content for C binding generation",
    )?;

    let world_id = resolve.select_world(&[package_id], world_name)?;

    let opts = c::Opts::default();
    let mut generator = opts.build();
    let mut files = Files::default();
    generator.generate(&mut resolve, world_id, &mut files)?;

    let mut result = HashMap::new();
    for (filename, content) in files.iter() {
        result.insert(filename.to_string(), bytes_to_latin1_string(content));
    }
    Ok(result)
}

fn generate_cpp_bindings(
    content: &str,
    world_name: Option<String>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> HashMap<String, String> {
    match generate_cpp_with_wit_bindgen(
        content,
        world_name.as_deref(),
        source_path,
        source_files_json,
    ) {
        Ok(files) => files,
        Err(e) => {
            let mut error_files = HashMap::new();
            error_files.insert(
                "error.txt".to_string(),
                format!("C++ binding generation failed: {e:#}"),
            );
            error_files
        }
    }
}

fn generate_cpp_with_wit_bindgen(
    content: &str,
    world_name: Option<&str>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> Result<HashMap<String, String>, anyhow::Error> {
    let (mut resolve, package_id) = load_bindgen_resolve(
        content,
        source_path,
        source_files_json,
        "Failed to parse WIT content for C++ binding generation",
    )?;

    let world_id = resolve.select_world(&[package_id], world_name)?;

    let opts = cpp::Opts::default();
    let mut generator = opts.build(None);
    let mut files = Files::default();
    generator.generate(&mut resolve, world_id, &mut files)?;

    let mut result = HashMap::new();
    for (filename, content) in files.iter() {
        result.insert(filename.to_string(), bytes_to_latin1_string(content));
    }
    Ok(result)
}

fn generate_csharp_bindings(
    content: &str,
    world_name: Option<String>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> HashMap<String, String> {
    match generate_csharp_with_wit_bindgen(
        content,
        world_name.as_deref(),
        source_path,
        source_files_json,
    ) {
        Ok(files) => files,
        Err(e) => {
            let mut error_files = HashMap::new();
            error_files.insert(
                "error.txt".to_string(),
                format!("C# binding generation failed: {e:#}"),
            );
            error_files
        }
    }
}

fn generate_csharp_with_wit_bindgen(
    content: &str,
    world_name: Option<&str>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> Result<HashMap<String, String>, anyhow::Error> {
    let (mut resolve, package_id) = load_bindgen_resolve(
        content,
        source_path,
        source_files_json,
        "Failed to parse WIT content for C# binding generation",
    )?;

    let world_id = resolve.select_world(&[package_id], world_name)?;

    let opts = csharp::Opts::default();
    let mut generator = opts.build();
    let mut files = Files::default();
    generator.generate(&mut resolve, world_id, &mut files)?;

    let mut result = HashMap::new();
    for (filename, content) in files.iter() {
        result.insert(filename.to_string(), bytes_to_latin1_string(content));
    }
    Ok(result)
}

fn generate_go_bindings(
    content: &str,
    world_name: Option<String>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> HashMap<String, String> {
    match generate_go_with_wit_bindgen(
        content,
        world_name.as_deref(),
        source_path,
        source_files_json,
    ) {
        Ok(files) => files,
        Err(e) => {
            let mut error_files = HashMap::new();
            error_files.insert(
                "error.txt".to_string(),
                format!("Go binding generation failed: {e:#}"),
            );
            error_files
        }
    }
}

fn generate_go_with_wit_bindgen(
    content: &str,
    world_name: Option<&str>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> Result<HashMap<String, String>, anyhow::Error> {
    let (mut resolve, package_id) = load_bindgen_resolve(
        content,
        source_path,
        source_files_json,
        "Failed to parse WIT content for Go binding generation",
    )?;

    let world_id = resolve.select_world(&[package_id], world_name)?;

    let opts = go::Opts::default();
    let mut generator = opts.build();
    let mut files = Files::default();
    generator.generate(&mut resolve, world_id, &mut files)?;

    let mut result = HashMap::new();
    for (filename, content) in files.iter() {
        result.insert(filename.to_string(), bytes_to_latin1_string(content));
    }
    Ok(result)
}

fn generate_moonbit_bindings(
    content: &str,
    world_name: Option<String>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> HashMap<String, String> {
    match generate_moonbit_with_wit_bindgen(
        content,
        world_name.as_deref(),
        source_path,
        source_files_json,
    ) {
        Ok(files) => files,
        Err(e) => {
            let mut error_files = HashMap::new();
            error_files.insert(
                "error.txt".to_string(),
                format!("MoonBit binding generation failed: {e:#}"),
            );
            error_files
        }
    }
}

fn generate_moonbit_with_wit_bindgen(
    content: &str,
    world_name: Option<&str>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> Result<HashMap<String, String>, anyhow::Error> {
    let (mut resolve, package_id) = load_bindgen_resolve(
        content,
        source_path,
        source_files_json,
        "Failed to parse WIT content for MoonBit binding generation",
    )?;

    let world_id = resolve.select_world(&[package_id], world_name)?;

    let opts = moonbit::Opts::default();
    let mut generator = opts.build();
    let mut files = Files::default();
    generator.generate(&mut resolve, world_id, &mut files)?;

    let mut result = HashMap::new();
    for (filename, content) in files.iter() {
        result.insert(filename.to_string(), bytes_to_latin1_string(content));
    }
    Ok(result)
}

fn generate_markdown_bindings(
    content: &str,
    world_name: Option<String>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> HashMap<String, String> {
    match generate_markdown_with_wit_bindgen(
        content,
        world_name.as_deref(),
        source_path,
        source_files_json,
    ) {
        Ok(files) => files,
        Err(e) => {
            let mut error_files = HashMap::new();
            error_files.insert(
                "error.txt".to_string(),
                format!("Markdown generation failed: {e:#}"),
            );
            error_files
        }
    }
}

fn generate_markdown_with_wit_bindgen(
    content: &str,
    world_name: Option<&str>,
    source_path: Option<&str>,
    source_files_json: Option<&str>,
) -> Result<HashMap<String, String>, anyhow::Error> {
    let (mut resolve, package_id) = load_bindgen_resolve(
        content,
        source_path,
        source_files_json,
        "Failed to parse WIT content for Markdown generation",
    )?;

    let world_id = resolve.select_world(&[package_id], world_name)?;

    let opts = markdown::Opts::default();
    let mut generator = opts.build();
    let mut files = Files::default();
    generator.generate(&mut resolve, world_id, &mut files)?;

    let mut result = HashMap::new();
    for (filename, content) in files.iter() {
        result.insert(filename.to_string(), bytes_to_latin1_string(content));
    }
    Ok(result)
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;
    use std::time::{SystemTime, UNIX_EPOCH};

    use crate::exports::wit_bindgen::wasm::wit_validator::Guest;
    use crate::WitBindgenComponent;

    fn create_import_fixture() -> (String, String, String) {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock should be after unix epoch")
            .as_nanos();
        let main_path = std::env::temp_dir()
            .join(format!("wit-bindgen-wasm-imports-{suffix}"))
            .join("a.wit");
        let imported_path = main_path.with_file_name("b.wit");

        let main_content = r#"package local:demo;

world my-world {
    import host;

    export another-interface;
}

interface host {
    ping: func();
}
"#
        .to_string();
        let imported_content = r#"interface another-interface {
    pong: func();
}
"#
        .to_string();
        let source_files_json = serde_json::to_string(&HashMap::from([
            (main_path.display().to_string(), main_content.clone()),
            (imported_path.display().to_string(), imported_content),
        ]))
        .expect("source files json should serialize");

        (
            main_path.display().to_string(),
            main_content,
            source_files_json,
        )
    }

    #[test]
    fn test_validate_wit_syntax_with_undefined_type() {
        let invalid_content = r#"package foo:foo;

interface i {
  type type1 = u32;
}

world foo {
  use i.{type1};

  type type2 = u32;

  record type3 {
    r: u32,
  }

  export foo: func() -> tuple<type1, type2, type3, type4>;
}"#;

        let result =
            WitBindgenComponent::validate_wit_syntax(invalid_content.to_string(), None, None);
        assert!(!result, "Should detect undefined type4 as invalid");
    }

    #[test]
    fn test_validate_wit_syntax_with_valid_content() {
        let valid_content = r#"package foo:foo;

world foo {
}"#;

        let result =
            WitBindgenComponent::validate_wit_syntax(valid_content.to_string(), None, None);
        assert!(result, "Should validate correct WIT syntax as valid");
    }

    #[test]
    fn test_validate_wit_syntax_with_empty_content() {
        let result = WitBindgenComponent::validate_wit_syntax("".to_string(), None, None);
        assert!(!result, "Empty content should be invalid");

        let result =
            WitBindgenComponent::validate_wit_syntax("   \n  \t  ".to_string(), None, None);
        assert!(!result, "Whitespace-only content should be invalid");
    }

    #[test]
    fn test_validate_wit_syntax_with_sized_lists() {
        let valid_content = r#"package foo:foo;

interface test {
  get-ipv4-address1: func() -> list<u8, 4>;
  get-ipv4-address2: func() -> tuple<u8, u8, u8, u8>;
}

world test-world {
  export test;
}"#;

        let result =
            WitBindgenComponent::validate_wit_syntax(valid_content.to_string(), None, None);
        assert!(result, "Should validate sized list syntax as valid");
    }

    #[test]
    fn test_validate_wit_syntax_with_local_imports() {
        let (main_path, content, source_files_json) = create_import_fixture();

        let result = WitBindgenComponent::validate_wit_syntax(
            content,
            Some(main_path),
            Some(source_files_json),
        );
        assert!(
            result,
            "Should resolve imported WIT files from the local folder"
        );
    }

    #[test]
    fn test_generate_bindings_with_local_imports() {
        let (main_path, content, source_files_json) = create_import_fixture();

        let result_json = WitBindgenComponent::generate_bindings(
            content,
            "rust".to_string(),
            Some("my-world".to_string()),
            Some(main_path),
            Some(source_files_json),
        );

        let files: std::collections::HashMap<String, String> =
            serde_json::from_str(&result_json).expect("binding generation should return json");
        assert!(
            !files.contains_key("error.txt"),
            "Binding generation should succeed with local imports: {files:?}"
        );
        assert!(
            files.keys().any(|filename| filename.ends_with(".rs")),
            "Rust bindings should include a .rs file"
        );
    }
}
