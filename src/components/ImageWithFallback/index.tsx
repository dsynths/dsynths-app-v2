import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import styled from 'styled-components'

import LoaderGif from 'assets/img/fallback/loader.gif'
import NotFound from 'assets/img/fallback/ticker.png'

const Wrapper = styled.div<{
  round?: boolean
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${({ round }) => (round ? '50%' : '0px')};
  overflow: hidden;
`

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  loading = false,
  round = false,
  ...rest
}: {
  src: StaticImageData
  alt: string
  width: number
  height: number
  loading?: boolean
  round?: boolean
  [x: string]: any
}) {
  const [imgSrc, setImgSrc] = useState<StaticImageData>(src)

  useEffect(() => {
    setImgSrc(src)
  }, [src])

  return (
    <Wrapper round={round}>
      {loading ? (
        <Image src={LoaderGif} alt={alt} width={width} height={height} onError={() => setImgSrc(NotFound)} {...rest} />
      ) : (
        <Image
          src={imgSrc || NotFound}
          unoptimized={false} // set to true if you're using blobs
          alt={alt}
          width={width}
          height={height}
          onError={() => setImgSrc(NotFound)}
          {...rest}
        />
      )}
    </Wrapper>
  )
}
