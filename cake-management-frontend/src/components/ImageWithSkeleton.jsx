import { useEffect, useRef, useState } from "react";
import "../styles/ImageWithSkeleton.css";

/**
 * Drop-in <img> replacement that shows a shimmer until the image loads.
 * It renders a single <img>, so existing CSS such as
 * `.cake-details-media img` and `.cake-related-img img` keeps working.
 */
function ImageWithSkeleton({ src, alt = "", className = "", onLoad, onError, ...rest }) {
    const imgRef = useRef(null);
    const [status, setStatus] = useState("loading"); // loading | loaded | error

    // Reset when the source changes, and handle images already cached by the browser
    useEffect(() => {
        const img = imgRef.current;

        if (img && img.complete && img.naturalWidth > 0) {
            setStatus("loaded");
        } else {
            setStatus("loading");
        }
    }, [src]);

    const handleLoad = (event) => {
        setStatus("loaded");
        onLoad?.(event);
    };

    const handleError = (event) => {
        setStatus("error");
        onError?.(event);
    };

    return (
        <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`iws-img iws-${status} ${className}`.trim()}
            onLoad={handleLoad}
            onError={handleError}
            {...rest}
        />
    );
}

export default ImageWithSkeleton;
