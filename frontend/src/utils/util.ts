export const sliceString = (str: string, afterWords = 30) => {
    return  str.length > length ? str.split(' ').slice(0, afterWords).join(' ') : str;
}