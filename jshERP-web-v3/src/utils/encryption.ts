/**
 * AES 加密工具 - 从 Vue 2 utils/encryption/aesEncrypt.js 迁移
 * 使用 crypto-js npm 包替代原项目中内联的 CryptoJS 实现
 */

import CryptoJS from 'crypto-js'
import { getStore, setStore } from '@/utils/storage'
import { ENCRYPTED_STRING } from '@/utils/constants'

interface EncryptedString {
  key: string
  iv: string
}

/**
 * 获取加密字符串（从缓存或服务端），并对结果进行缓存
 * 注意：此函数需要配合 API 层使用，需传入请求函数
 * @param fetchFn 请求服务端获取加密字符串的函数
 * @returns 加密字符串对象
 */
export async function getEncryptedString(
  fetchFn: () => Promise<{ result: { key: string; iv: string } }>,
): Promise<EncryptedString> {
  // 先尝试从缓存获取
  const cached = getStore(ENCRYPTED_STRING) as EncryptedString | undefined
  if (cached && cached.key && cached.iv) {
    return cached
  }

  // 从服务端获取
  const res = await fetchFn()
  const encryptedString: EncryptedString = {
    key: res.result.key,
    iv: res.result.iv,
  }
  // 缓存 7 天（秒）
  setStore(ENCRYPTED_STRING, encryptedString, 7 * 24 * 60 * 60)
  return encryptedString
}

/**
 * AES 加密：字符串 key iv 返回 base64
 * @param word 待加密的字符串
 * @param keyStr 密钥字符串
 * @param ivStr 偏移量字符串
 * @returns base64 编码的加密结果
 */
export function encryption(word: string, keyStr: string, ivStr: string): string {
  const key = CryptoJS.enc.Utf8.parse(keyStr)
  const iv = CryptoJS.enc.Utf8.parse(ivStr)

  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding,
  })

  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
}

/**
 * AES 解密：base64 key iv 返回明文字符串
 * @param encryptedBase64 base64 编码的密文
 * @param keyStr 密钥字符串
 * @param ivStr 偏移量字符串
 * @returns 解密后的明文字符串
 */
export function decryption(encryptedBase64: string, keyStr: string, ivStr: string): string {
  const key = CryptoJS.enc.Utf8.parse(keyStr)
  const iv = CryptoJS.enc.Utf8.parse(ivStr)

  const decrypt = CryptoJS.AES.decrypt(encryptedBase64, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding,
  })

  return CryptoJS.enc.Utf8.stringify(decrypt).toString()
}
