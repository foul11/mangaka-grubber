export function padLeft(str: string | number, pad: string, length: number) {
    const num = Number(str);
    
    if (isNaN(num)) {
        return str.toString().padStart(length, pad);
    }
    
    const int = Math.floor(num);
    const fraction = num - int;
    
    return (
        int.toString().padStart(length, pad) + (
            fraction !== 0
                ? '.' + fraction.toString().substring(2)
                : ''
        )
    );
}