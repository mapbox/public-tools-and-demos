export const format = (d, n) => {
    return d.toFixed(n).replace(/[.,]00$/, '')
}