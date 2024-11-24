import type { RcFile } from 'antd/es/upload'
import type { ExifData, FormValue } from './types'
import { createFromIconfontCN, DownloadOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Divider, Flex, Form, Input, message, Select, Slider, Space, Typography, Upload } from 'antd'
import domtoimage from 'dom-to-image'
import moment from 'moment'

import { useEffect, useRef, useState } from 'react'

import init, { get_exif } from './wasm/gen_brand_photo_pictrue'
import './styles/App.css'

const IconFont = createFromIconfontCN({
  scriptUrl: [
    '//at.alicdn.com/t/c/font_4757469_u2nszgglli.js', // icon-apple, icon-jianeng, icon-DJI, icon-fushi, icon-huawei1, icon-laika, icon-icon-xiaomiguishu, icon-nikon, icon-sony
  ],
})

const brandList = [
  'Apple',
  'Canon',
  'Dji',
  'Fujifilm',
  'Huawei',
  'Leica',
  'Xiaomi',
  'Nikon Corporation',
  'Sony',
  '未收录',
]

const initialFormValue = {
  model: 'XIAOMI 13 ULTRA',
  date: moment().format('YYYY.MM.DD HH:mm:ss'),
  gps: `41°12'47"N 124°00'16"W`,
  device: '75mm f/1.8 1/33s ISO800',
  brand: 'leica',
  brand_url: './brand/leica.svg',
  scale: 0.8,
  fontSize: 'normal',
  fontWeight: 'bold',
  fontFamily: 'misans',
}

const exhibitionImages = [
  '/exhibition/apple.jpg',
  '/exhibition/canon.jpg',
  '/exhibition/dji.jpg',
  '/exhibition/fujifilm.jpg',
  '/exhibition/huawei.jpg',
  '/exhibition/leica.jpg',
  '/exhibition/xiaomi.jpg',
  '/exhibition/nikon.jpg',
  '/exhibition/sony.jpg',
]

// 在组件初始化时随机选择一张照片
function randomImage() {
  const randomIndex = Math.floor(Math.random() * exhibitionImages.length)
  return exhibitionImages[randomIndex]
}

function App() {
  const [wasmLoaded, setWasmLoaded] = useState(false)

  const [formValue, setFormValue] = useState<FormValue>(initialFormValue)
  const [imgUrl, setImgUrl] = useState<string>(randomImage())
  const formRef = useRef()

  useEffect(() => {
    const loadWasm = async () => {
      await init()
      setWasmLoaded(true)
    }
    loadWasm()
  }, [])

  if (!wasmLoaded) {
    return <div>Loading WASM...</div>
  }

  // 格式化 GPS 数据
  const formatGPS = (gps: string | undefined, gpsRef: string | undefined): string => {
    if (!gps)
      return ''
    const [degrees, minutes, seconds, dir] = gps
      .match(/(\d+\.?\d*)|([NSWE]$)/gim)
      .map(item => (!Number.isNaN(Number(item)) ? `${~~item}`.padStart(2, '0') : item))
    if (gpsRef)
      return `${degrees}°${minutes}'${seconds}"${gpsRef}`
    else if (
      dir
    ) return `${degrees}°${minutes}'${seconds}"${dir}`
    else
      return `${degrees}°${minutes}'${seconds}"`
  }

  // 格式化品牌
  const formatBrand = (make: string | undefined): string => {
    const brand = (make || '').toLowerCase()
    for (const b of brandList.map(b => b.toLowerCase())) {
      if (brand.includes(b)) {
        return b
      }
    }
    return brand
  }

  // 格式化曝光时间
  const formatExposureTime = (exposureTime: string | undefined): string => {
    if (!exposureTime)
      return ''
    const [numerator, denominator] = exposureTime.split('/').filter(Boolean).map(item => Math.floor(Number(item)))
    return [numerator, denominator].join('/')
  }

  // 解析 EXIF 数据
  const parseExifData = (data: ExifData[]): Partial<FormValue> => {
    const exif = {
      GPSLatitude: '', // 纬度
      GPSLatitudeRef: '', // 纬度方向
      GPSLongitude: '', // 经度
      GPSLongitudeRef: '', // 经度方向
      FocalLengthIn35mmFilm: '', // 焦距
      FocalLength: '', // 焦距
      FNumber: '', // 光圈
      ExposureTime: '', // 曝光时间
      PhotographicSensitivity: '', // ISO
      Model: '', // 设备型号
      Make: '', // 设备品牌
      DateTimeOriginal: '', // 拍摄时间
    }
    const exifValues = new Map(data.map(item => [item.tag, item.value]))
    const exifValuesWithUnit = new Map(data.map(item => [item.tag, item.value_with_unit]))

    exif.GPSLatitude = exifValues.get('GPSLatitude') || ''
    exif.GPSLatitudeRef = exifValues.get('GPSLatitudeRef') || ''
    exif.GPSLongitude = exifValues.get('GPSLongitude') || ''
    exif.GPSLongitudeRef = exifValues.get('GPSLongitudeRef') || ''
    exif.FocalLengthIn35mmFilm = exifValuesWithUnit.get('FocalLengthIn35mmFilm') || ''
    exif.FocalLength = exifValuesWithUnit.get('FocalLength') || ''
    exif.FNumber = exifValuesWithUnit.get('FNumber') || ''
    exif.ExposureTime = exifValues.get('ExposureTime') || ''
    exif.PhotographicSensitivity = exifValues.get('PhotographicSensitivity') || ''
    exif.Model = exifValues.get('Model') || ''
    exif.Make = exifValues.get('Make') || ''
    exif.DateTimeOriginal = exifValues.get('DateTimeOriginal') || ''

    const gps = `${formatGPS(exif.GPSLatitude, exif.GPSLatitudeRef)} ${formatGPS(exif.GPSLongitude, exif.GPSLongitudeRef)}`
    const device = [
      `${(exif.FocalLengthIn35mmFilm || exif.FocalLength).replace(/\s+/g, '')}`,
      exif.FNumber?.split('/')?.map((n, i) => (i ? (+n).toFixed(1) : n)).join('/'),
      exif.ExposureTime ? `${formatExposureTime(exif.ExposureTime)}s` : '',
      exif.PhotographicSensitivity ? `ISO${exif.PhotographicSensitivity}` : '',
    ]
      .filter(Boolean)
      .join(' ')
    return {
      model: exif.Model || 'Unknown Model',
      date: exif.DateTimeOriginal || moment().format('YYYY.MM.DD HH:mm:ss'),
      gps,
      device,
      brand: `${formatBrand(exif.Make)}`,
    }
  }

  // 获取品牌图标 URL
  const getBrandUrl = (brand: string): string =>
    `./brand/${brand === '未收录' ? 'unknow.svg' : `${brand}.svg`}`

  // 处理文件上传
  const handleAdd = (file: RcFile): false => {
    const reader = new FileReader()
    reader.onloadend = async (e) => {
      try {
        const exifData = get_exif(new Uint8Array(e.target.result))
        const parsedExif = parseExifData(exifData)
        const updatedFormValue = {
          ...formValue,
          ...parsedExif,
          brand_url: getBrandUrl(parsedExif.brand),
        }
        console.log('original EXIF data: ', exifData)
        console.log('parsed EXIF data: ', parsedExif)
        formRef.current.setFieldsValue(updatedFormValue)
        setFormValue(updatedFormValue)
        setImgUrl(URL.createObjectURL(new Blob([file], { type: file.type })))
      }
      catch (error) {
        console.error('Error parsing EXIF data:', error)
        message.error('无法识别照片特定数据，请换一张照片')
      }
    }
    reader.readAsArrayBuffer(file)
    return false
  }

  // 导出图片
  const handleDownload = (): void => {
    const previewDom = document.getElementById('preview')
    const zoomRatio = 4

    domtoimage
      .toJpeg(previewDom, {
        quality: 1.0,
        width: previewDom.clientWidth * zoomRatio,
        height: previewDom.clientHeight * zoomRatio,
        style: { transform: `scale(${zoomRatio})`, transformOrigin: 'top left' },
      })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `${Date.now()}.jpg`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        link.remove()
      })
      .catch((err) => {
        console.error('Export Error:', err)
        message.error('导出失败，请重试')
      })
  }

  // 处理表单更新
  const handleFormChange = (_: any, values: FormValue): void => {
    setFormValue({
      ...values,
      brand_url: getBrandUrl(values.brand),
    })
  }

  const handleScaleChange = (scale) => {
    document.documentElement.style.setProperty('--banner-scale', scale)
    setFormValue(prev => ({ ...prev, scale }))
  }

  const handleFontSizeChange = (fontSize) => {
    const sizeMap = {
      small: 'var(--font-size-small)',
      normal: 'var(--font-size-normal)',
      large: 'var(--font-size-large)',
    }
    document.documentElement.style.setProperty('--current-font-size', sizeMap[fontSize])
    setFormValue(prev => ({ ...prev, fontSize }))
  }

  const handleFontWeightChange = (fontWeight) => {
    const weightMap = {
      normal: 'var(--font-weight-normal)',
      bold: 'var(--font-weight-bold)',
      black: 'var(--font-weight-black)',
    }
    document.documentElement.style.setProperty('--current-font-weight', weightMap[fontWeight])
    setFormValue(prev => ({ ...prev, fontWeight }))
  }

  const handleFontFamilyChange = (fontFamily) => {
    const familyMap = {
      default: 'var(--font-family-default)',
      caveat: 'var(--font-family-caveat)',
      misans: 'var(--font-family-misans)',
      helvetica: 'var(--font-family-helvetica)',
      futura: 'var(--font-family-futura)',
      avenir: 'var(--font-family-avenir)',
      didot: 'var(--font-family-didot)',
    }
    document.documentElement.style.setProperty('--current-font-family', familyMap[fontFamily])
    setFormValue(prev => ({ ...prev, fontFamily }))
  }

  // 更新处理展览按钮点击的函数
  const handleExhibitionClick = async (brand: string) => {
    const brandImageUrl = `/exhibition/${brand.toLowerCase()}.jpg` // 假设示例照片为 JPG 格式
    setImgUrl(brandImageUrl)

    // 读取图片文件并解析 EXIF 数据
    const response = await fetch(brandImageUrl)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const exifData = get_exif(new Uint8Array(arrayBuffer))
    const parsedExif = parseExifData(exifData)

    const updatedFormValue = {
      ...formValue,
      ...parsedExif,
      brand_url: getBrandUrl(parsedExif.brand),
    }

    formRef.current.setFieldsValue(updatedFormValue)
    setFormValue(updatedFormValue)
  }

  return (
    <>
      <Typography.Title level={2}>水印照片生成器</Typography.Title>
      <Divider />
      <div className="preview-box">
        <Typography.Title level={4}>预览</Typography.Title>
        <div className="preview" id="preview">
          <img className="preview-picture" src={imgUrl} alt="Preview" />
          <div className="preview-info">
            <div className="preview-info-left">
              <div className="preview-info-model">{formValue.model}</div>
              <div className="preview-info-date">{formValue.date}</div>
              <div className="preview-info-brand">
                <img src={formValue.brand_url} alt="Brand" />
              </div>
            </div>
            <div className="preview-info-split"></div>
            <div className="preview-info-right">
              <div className="preview-info-device">{formValue.device}</div>
              <div className="preview-info-gps">{formValue.gps}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="exhibition">
        <Flex wrap gap="middle" horizontal="true" justify="center" align="center">
          <Button type="primary" shape="round" size="default" ghost onClick={() => handleExhibitionClick('apple')}>
            <IconFont type="icon-apple" style={{ fontSize: '16px' }} />
            Apple
          </Button>
          <Button type="primary" shape="round" size="default" ghost onClick={() => handleExhibitionClick('canon')}>
            <IconFont type="icon-jianeng" style={{ fontSize: '28px' }} />
            Cannon
          </Button>
          <Button type="primary" shape="round" size="default" ghost onClick={() => handleExhibitionClick('dji')}>
            <IconFont type="icon-DJI" style={{ fontSize: '28px' }} />
            Dji
          </Button>
          <Button type="primary" shape="round" size="default" ghost onClick={() => handleExhibitionClick('fujifilm')}>
            <IconFont type="icon-fushi" style={{ fontSize: '28px' }} />
            Fuji
          </Button>
          <Button type="primary" shape="round" size="default" ghost onClick={() => handleExhibitionClick('huawei')}>
            <IconFont type="icon-huawei1" style={{ fontSize: '16px' }} />
            Huawei
          </Button>
          <Button type="primary" shape="round" size="default" ghost onClick={() => handleExhibitionClick('leica')}>
            <IconFont type="icon-laika" style={{ fontSize: '16px' }} />
            Leica
          </Button>
          <Button type="primary" shape="round" size="default" ghost onClick={() => handleExhibitionClick('xiaomi')}>
            <IconFont type="icon-icon-xiaomiguishu" style={{ fontSize: '16px' }} />
            Xiaomi
          </Button>
          <Button type="primary" shape="round" size="default" ghost onClick={() => handleExhibitionClick('nikon')}>
            <IconFont type="icon-nikon" style={{ fontSize: '16px' }} />
            Nikon
          </Button>
          <Button type="primary" shape="round" size="default" ghost onClick={() => handleExhibitionClick('sony')}>
            <IconFont type="icon-sony" style={{ fontSize: '28px' }} />
            Sony
          </Button>
        </Flex>
      </div>

      <div className="op">
        <Space size="large">
          <Upload
            accept="image/*"
            beforeUpload={(file) => {
              handleAdd(file)
              return false
            }}
            fileList={[]}
          >
            <Button type="primary" shape="round" icon={<PlusOutlined />} ghost>
              新建照片
            </Button>
          </Upload>
          <Button
            type="primary"
            shape="round"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            导出照片
          </Button>
        </Space>

      </div>

      <div className="props">
        <div className="props-title">
          <Typography.Title level={4}>参数</Typography.Title>
        </div>
        <div className="props-option">
          <Form
            ref={formRef}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            layout="horizontal"
            size="small"
            style={{ maxWidth: 800 }}
            initialValues={formValue}
            onValuesChange={handleFormChange}
          >
            <Form.Item label="型号" name="model">
              <Input />
            </Form.Item>
            <Form.Item label="品牌" name="brand">
              <Select style={{ width: 170 }}>
                {brandList.map(brand => (
                  <Select.Option key={brand} value={brand.toLowerCase()}>
                    {brand}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="参数" name="device">
              <Input />
            </Form.Item>
            <Form.Item label="时间" name="date">
              <Input />
            </Form.Item>
            <Form.Item label="经纬" name="gps">
              <Input />
            </Form.Item>
            <Form.Item label="字体大小" name="fontSize">
              <Select style={{ width: 170 }} onChange={handleFontSizeChange}>
                <Select.Option value="small">小</Select.Option>
                <Select.Option value="normal">正常</Select.Option>
                <Select.Option value="large">大</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="字体粗细" name="fontWeight">
              <Select style={{ width: 170 }} onChange={handleFontWeightChange}>
                <Select.Option value="normal">正常</Select.Option>
                <Select.Option value="bold">加粗</Select.Option>
                <Select.Option value="black">黑体</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="字体" name="fontFamily">
              <Select style={{ width: 170 }} onChange={handleFontFamilyChange}>
                <Select.Option value="default">Default</Select.Option>
                <Select.Option value="misans">MiSans</Select.Option>
                <Select.Option value="caveat">Caveat</Select.Option>
                <Select.Option value="helvetica">Helvetica Neue</Select.Option>
                <Select.Option value="futura">Futura</Select.Option>
                <Select.Option value="avenir">Avenir</Select.Option>
                <Select.Option value="didot">Didot</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="横幅缩放" name="scale">
              <Slider
                min={0.5}
                max={1.2}
                step={0.1}
                onChange={handleScaleChange}
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  )
}

export default App
