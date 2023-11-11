import React from 'react'
import { useMediaQuery } from 'react-responsive'

function Testing() {
    const isDesktopOrLaptop = useMediaQuery({
        query: '(min-device-width: 1224px)'
    })

    const isTabletOrMobile = useMediaQuery({
        query: '(max-width: 1224px)'
    })
    const text = "hello im laxya full stack developer"

    return (
        <div>
            {isDesktopOrLaptop && <h1>Desktop or laptop</h1>}
            {isTabletOrMobile && <h1>Tablet or mobile</h1>}
            <span style={{ color: "black" }}>&#10060;</span>
            <p>{text}</p>
            <button onClick={() => {
                navigator.clipboard.writeText(text)
            }}>COPY</button>

        </div>
    )
}

export default Testing
