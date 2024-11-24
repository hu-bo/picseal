mod utils;

use chrono::{DateTime, Local};
use gloo_utils::format::JsValueSerdeExt;
use once_cell::sync::Lazy;
use serde::Serialize;
use serde_json::{json, Value};
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

fn get_current_time() -> String {
    let now: DateTime<Local> = Local::now();
    now.format("%Y-%m-%d %H:%M:%S").to_string()
}

static DEFAULT_EXIF_INFO: Lazy<Vec<Value>> = Lazy::new(|| {
    vec![
        json!({
            "tag": "Make",
            "value": "Leica",
            "value_with_unit": "Leica"
        }),
        json!({
            "tag": "Model",
            "value": "XIAOMI 13 ULTRA",
            "value_with_unit": "XIAOMI 13 ULTRA"
        }),
        json!({
            "tag": "DateTime",
            "value": get_current_time(),
            "value_with_unit": get_current_time()
        }),
        json!({
            "tag": "DateTimeOriginal",
            "value": get_current_time(),
            "value_with_unit": get_current_time()
        }),
        json!({
            "tag": "GPSLatitude",
            "value": "41 deg 12 min 47.512 sec",
            "value_with_unit": "41 deg 12 min 47.512 sec N"
        }),
        json!({
            "tag": "GPSLatitudeRef",
            "value": "N",
            "value_with_unit": "N"
        }),
        json!({
            "tag": "GPSLongitude",
            "value": "124 deg 0 min 16.376 sec",
            "value_with_unit": "124 deg 0 min 16.376 sec W"
        }),
        json!({
            "tag": "GPSLongitudeRef",
            "value": "W",
            "value_with_unit": "W"
        }),
        json!({
            "tag": "ImageLength",
            "value": "4096",
            "value_with_unit": "4096 pixels"
        }),
        json!({
            "tag": "FocalLength",
            "value": "8.7",
            "value_with_unit": "8.7 mm"
        }),
        json!({
            "tag": "FocalLengthIn35mmFilm",
            "value": "75",
            "value_with_unit": "75 mm"
        }),
        json!({
            "tag": "PhotographicSensitivity",
            "value": "800",
            "value_with_unit": "800"
        }),
        json!({
            "tag": "FNumber",
            "value": "1.8",
            "value_with_unit": "f/1.8"
        }),
        json!({
            "tag": "ExposureMode",
            "value": "auto exposure",
            "value_with_unit": "auto exposure"
        }),
        json!({
            "tag": "ExposureTime",
            "value": "1/33",
            "value_with_unit": "1/33 s"
        }),
    ]
});

fn create_exif_data(exif_info: &[Value]) -> Vec<ExifData> {
    let mut exif_data = Vec::new();

    for item in exif_info {
        let tag = item["tag"].as_str().unwrap().to_string();
        let value = item["value"].as_str().unwrap().to_string();
        let value_with_unit = item["value_with_unit"].as_str().unwrap().to_string();

        exif_data.push(ExifData {
            tag,
            value,
            value_with_unit,
        });
    }

    exif_data
}

#[wasm_bindgen]
pub fn get_exif(raw: Vec<u8>) -> JsValue {
    let mut exif_data: Vec<ExifData> = Vec::new();
    let exifreader = exif::Reader::new();
    let mut bufreader = std::io::Cursor::new(raw.as_slice());

    // Try to read EXIF data, fallback to DEFAULT_EXIF_INFO if it fails
    match exifreader.read_from_container(&mut bufreader) {
        Ok(exif) => {
            for field in exif.fields() {
                if let Some(_) = field.tag.to_string().find("Tag(Exif") {
                    continue;
                }

                if ["Make", "Model"].contains(&field.tag.to_string().as_str()) {
                    exif_data.push(ExifData {
                        tag: field.tag.to_string(),
                        value: field
                            .display_value()
                            .to_string()
                            .replace(
                                |item: char| ["\"", ","].contains(&item.to_string().as_str()),
                                "",
                            )
                            .trim()
                            .to_string(),
                        value_with_unit: field
                            .display_value()
                            .with_unit(&exif)
                            .to_string()
                            .replace('"', ""),
                    });
                    continue;
                }

                exif_data.push(ExifData {
                    tag: field.tag.to_string(),
                    value: field.display_value().to_string(),
                    value_with_unit: field.display_value().with_unit(&exif).to_string(),
                });
            }
        }
        Err(_) => {
            // Use default EXIF data if parsing fails
            exif_data = create_exif_data(&DEFAULT_EXIF_INFO);
        }
    }

    <wasm_bindgen::JsValue as JsValueSerdeExt>::from_serde(&exif_data).unwrap()
}
