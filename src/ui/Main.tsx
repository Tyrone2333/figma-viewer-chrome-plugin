import {useEffect, useState} from 'react';
import Input from './components/Input'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {AlignJustify} from 'react-feather';

function Main() {
  const [styleArray, setStyleArray] = useState([])
  const [layerName, setLayerName] = useState('')
  const [fontStyle, setFontStyle] = useState('')
  const [stylesObj, setStylesObj] = useState({})

  function getCategorizeStyles(styles) {
    const categories = {
      size: [],
      text: [],
      backgroundBorder: [],
      textGradient: [],
    };

    const styleMap = {
      size: ["height", "width"],
      text: [
        "text-align",
        "font-size",
        "font-weight",
        "line-height",
        "color"
      ],
      textGradient: [
        "background",
        "background-clip",
        "-webkit-background-clip",
        "-webkit-text-fill-color",
      ],
      backgroundBorder: [
        "background",
        "border-radius",
        "border",
        "box-shadow",
        "fill",
        "stroke-width",
        "stroke"
      ]
    };

    for (const style of styles) {
      for (const category in styleMap) {
        if (styleMap[category].some((keyword) => style.startsWith(keyword))) {
          categories[category].push(style);
          // break;
        }
      }
    }

    if (categories.textGradient.length === 1) {
      categories.textGradient = []
    }

    return {
      size: categories.size.join("\n"),
      text: categories.text.join("\n"),
      backgroundBorder: categories.backgroundBorder.join("\n"),
      textGradient: categories.textGradient.join("\n"),
    };
  }

  async function handleSelectionChange() {
    const node = figma.currentPage.selection[0]
    if (node) {
      const name = node.name
      setLayerName(name)
      const styleObj = await node.getCSSAsync()
      let fontSize = styleObj['font-size'] || '-'
      let color = styleObj['color'] || '-'
      let lineHeight = styleObj['line-height']?.replace(/\/\*[\s\S]*?\*\//g, '').trim() || '-'
      let fontWeight = styleObj['font-weight'] || '-'
      setFontStyle(`@include font(${fontSize}, ${color}, ${lineHeight}, ${fontWeight});`)
      const styleArray = Object.entries(styleObj).map(([key, value]) => `${key}: ${value};`)
      setStyleArray(styleArray)
      const categorizeStyles = getCategorizeStyles(styleArray)
      setStylesObj(categorizeStyles)
    }
  }

  function handleCopied() {
    // you can use figma object directly, no message posting
    figma.notify('Copied')
  }

  // Listen to event selectionchange
  // figma.on('selectionchange') is not working anyway so I listen click event on canvas
  useEffect(() => {
    const canvas = document.querySelector("#fullscreen-root canvas")
    const panel = document.querySelector('[class*="objects_panel--rowContainer"]')

    canvas.addEventListener('click', handleSelectionChange)
    panel.addEventListener('click', handleSelectionChange)

    return () => {
      canvas.removeEventListener('click', handleSelectionChange)
      panel.removeEventListener('click', handleSelectionChange)
    }
  }, [])

  const nameStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '12px'
  }
  const divStyle = {
    backgroundColor: '#f5f5f5',
    fontSize: '13px',
    color: '#000',
    borderRadius: '8px',
    padding: '12px',
    whiteSpace: '',
    marginBottom: '10px'
  }
  const pStyle = {
    cursor: 'pointer',
    lineHeight: '24px'
  }

  const nameMap = {
    size: '宽高',
    text: '字体',
    backgroundBorder: '背景边框',
    textGradient: '字体渐变'
  }

  function Style({name}) {
    if (stylesObj[name]) {
      return (
        <div>
          <p style={{fontWeight: 'bold', marginBottom: '5px'}}>{nameMap[name]}</p>
          <div style={divStyle}>
            <CopyToClipboard text={stylesObj[name]} onCopy={handleCopied}>
              <Input className='p' style={pStyle}>{stylesObj[name]}</Input>
            </CopyToClipboard>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className='main'>
      <div style={nameStyle}>
        <CopyToClipboard text={layerName} onCopy={handleCopied}>
          <p style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            margin: '15px 0',
            cursor: 'pointer'
          }}>{layerName}</p>
        </CopyToClipboard>

        <CopyToClipboard text={fontStyle} onCopy={handleCopied}>
          <p style={{fontWeight: 500, margin: '15px 0', cursor: 'pointer'}}>{fontStyle}</p>
        </CopyToClipboard>
      </div>
      <Style name='size'/>
      <Style name='text'/>
      <Style name='backgroundBorder'/>
      <Style name='textGradient'/>
    </div>
  )
}


export default Main
