import { useCallback, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import './ScreenshotButton.css'

export function ScreenshotButton() {
  const { gl } = useThree()
  const btnRef = useRef<HTMLButtonElement>(null)

  const capture = useCallback(() => {
    gl.render(gl.scene, gl.camera)
    const dataURL = gl.domElement.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `earth-${Date.now()}.png`
    link.href = dataURL
    link.click()
  }, [gl])

  return (
    <button ref={btnRef} className="screenshot-btn" onClick={capture} title="截图导出为 PNG">
      📷
    </button>
  )
}
