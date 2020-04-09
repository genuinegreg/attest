export function md(cls) {
    Array.from(document.getElementsByClassName(cls)).forEach(element => {
        const _md = marked(element.innerHTML.trim())
        element.innerHTML = _md
    });
}