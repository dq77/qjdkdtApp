/**
 * 获取文件名
 */
export function getFileName (path) {
  if (path && typeof path === 'string') {
    const last = path.toString().lastIndexOf('/')
    if (last !== -1) {
      return path.toString().substring(last + 1)
    }
  }
  return null
}
