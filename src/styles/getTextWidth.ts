export const getTextDims = (text: string, className: string,) => {
    const span = document.createElement("span");
    span.className = className;
    span.innerText = text;
    
    document.body.appendChild(span);
    const width = span.offsetWidth;
    const height = parseFloat(getComputedStyle(span).lineHeight || "0");
    document.body.removeChild(span);
    return [width * 1.06, height];
}