/**
 * 文件上传工具函数 - 从 Vue 2 utils/commonUploadFile.js 迁移
 */

/**
 * 文件信息接口
 */
export interface UploadFileItem {
  uid: string
  name: string
  status: string
  url: string
  response: {
    status: string
    message: string
  }
}

/**
 * 从路径中获取文件名
 * @param path 文件路径
 * @returns 文件名
 */
export function getFileName(path: string): string {
  if (path.lastIndexOf('\\') >= 0) {
    path = path.replace(/\\/g, '/')
  }
  return path.substring(path.lastIndexOf('/') + 1)
}

/**
 * 生成唯一 ID
 * @returns uid 字符串
 */
export function uidGenerator(): string {
  return '-' + parseInt(String(Math.random() * 10000 + 1), 10)
}

/**
 * 获取上传文件的路径列表（逗号分隔）
 * @param uploadFiles 上传文件列表
 * @returns 逗号分隔的文件路径字符串
 */
export function getFilePaths(uploadFiles: UploadFileItem[]): string {
  const arr: string[] = []
  if (!uploadFiles) {
    return ''
  }
  for (let a = 0; a < uploadFiles.length; a++) {
    arr.push(uploadFiles[a].response.message)
  }
  if (arr && arr.length > 0) {
    return arr.join(',')
  }
  return ''
}

/**
 * 根据路径字符串生成上传文件列表
 * @param paths 逗号分隔的文件路径字符串
 * @param getFileAccessHttpUrl 将相对路径转为可访问 HTTP URL 的函数
 * @returns 文件列表数组
 */
export function getUploadFileList(
  paths: string,
  getFileAccessHttpUrl: (path: string) => string,
): UploadFileItem[] {
  if (!paths) {
    return []
  }
  const fileList: UploadFileItem[] = []
  const arr = paths.split(',')
  for (let a = 0; a < arr.length; a++) {
    if (!arr[a]) {
      continue
    } else {
      fileList.push({
        uid: uidGenerator(),
        name: getFileName(arr[a]),
        status: 'done',
        url: getFileAccessHttpUrl(arr[a]),
        response: {
          status: 'history',
          message: arr[a],
        },
      })
    }
  }
  return fileList
}

/**
 * 下载文件（通过创建 a 标签触发下载）
 * @param url 文件下载地址
 * @param fileName 下载后的文件名
 */
export function downloadFile(url: string, fileName: string): void {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 从 Blob 数据下载文件
 * @param data Blob 数据
 * @param fileName 文件名
 * @param mimeType MIME 类型，默认 'application/vnd.ms-excel'
 */
export function downloadFileFromBlob(
  data: BlobPart,
  fileName: string,
  mimeType: string = 'application/vnd.ms-excel',
): void {
  const url = window.URL.createObjectURL(new Blob([data], { type: mimeType }))
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 获取文件扩展名
 * @param fileName 文件名
 * @returns 扩展名（含点号）
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot === -1) return ''
  return fileName.substring(lastDot)
}

/**
 * 校验文件大小是否超限
 * @param fileSize 文件大小（字节）
 * @param maxSizeMB 最大允许大小（MB）
 * @returns 是否在限制内
 */
export function checkFileSize(fileSize: number, maxSizeMB: number): boolean {
  return fileSize / 1024 / 1024 <= maxSizeMB
}
