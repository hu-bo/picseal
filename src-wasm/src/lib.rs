mod utils;

use gloo_utils::format::JsValueSerdeExt;
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Debug, Serialize)]
struct ExifData {
    tag: String,
    value: String,
    value_with_unit: String,
}

#[wasm_bindgen(start)]
pub fn run() {
    utils::set_panic_hook();
}

#[wasm_bindgen]
pub fn get_exif(raw: Vec<u8>) -> JsValue {
    let mut exif_data: Vec<ExifData> = Vec::new();
    let exif_reader = exif::Reader::new();
    let mut bufreader = std::io::Cursor::new(raw.as_slice());

    // Try to read EXIF data, fallback to empty if it fails
    match exif_reader.read_from_container(&mut bufreader) {
        Ok(exif) => {
            for field in exif.fields() {
                exif_data.push(ExifData {
                    tag: field.tag.to_string(),
                    value: field.display_value().to_string(),
                    value_with_unit: field.display_value().with_unit(&exif).to_string(),
                });
            }
        }
        Err(_) => {
            // Use empty EXIF data if parsing fails
        }
    }

    <wasm_bindgen::JsValue as JsValueSerdeExt>::from_serde(&exif_data).unwrap()
}
