import { minidenticon } from 'minidenticons'
import { useMemo } from 'react'

const MinidenticonImg = ({ username }: { username: string }) => {
    const svgURI = useMemo(
        () => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(username)),
        [username]
    )
    return (<img src={svgURI} alt={username} width={40} height={40}/>)
}
export default MinidenticonImg