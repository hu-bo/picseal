export const BrandsList = [
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

// 获取品牌图标 URL
export function getBrandUrl(brand: string): string {
  return `./brand/${brand === '未收录' ? 'unknow.svg' : `${brand}.svg`}`
}
