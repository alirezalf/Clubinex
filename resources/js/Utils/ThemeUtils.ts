
// تابع کمکی برای تبدیل هگز به RGB و تولید طیف‌های رنگی
export const generateColorShades = (hex: string) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const mix = (colorChannel: number, mixColor: number, percent: number) => {
        return Math.round(colorChannel + (mixColor - colorChannel) * (percent / 100));
    };

    const shades: Record<string, string> = {};
    shades['--color-primary-50'] = `rgb(${mix(r, 255, 95)} ${mix(g, 255, 95)} ${mix(b, 255, 95)})`;
    shades['--color-primary-100'] = `rgb(${mix(r, 255, 90)} ${mix(g, 255, 90)} ${mix(b, 255, 90)})`;
    shades['--color-primary-200'] = `rgb(${mix(r, 255, 80)} ${mix(g, 255, 80)} ${mix(b, 255, 80)})`;
    shades['--color-primary-300'] = `rgb(${mix(r, 255, 60)} ${mix(g, 255, 60)} ${mix(b, 255, 60)})`;
    shades['--color-primary-400'] = `rgb(${mix(r, 255, 30)} ${mix(g, 255, 30)} ${mix(b, 255, 30)})`;
    shades['--color-primary-500'] = `rgb(${r} ${g} ${b})`; 
    shades['--color-primary-600'] = `rgb(${mix(r, 0, 10)} ${mix(g, 0, 10)} ${mix(b, 0, 10)})`;
    shades['--color-primary-700'] = `rgb(${mix(r, 0, 20)} ${mix(g, 0, 20)} ${mix(b, 0, 20)})`;
    shades['--color-primary-800'] = `rgb(${mix(r, 0, 30)} ${mix(g, 0, 30)} ${mix(b, 0, 30)})`;
    shades['--color-primary-900'] = `rgb(${mix(r, 0, 40)} ${mix(g, 0, 40)} ${mix(b, 0, 40)})`;

    // رنگ پس‌زمینه بدنه بر اساس رنگ اصلی (افزایش غلظت برای دیده شدن بهتر)
    // قبلا ۹۶ درصد سفید بود، الان ۸۸ درصد سفید می‌کنیم تا رنگ مشخص‌تر شود
    shades['--body-bg-gradient'] = `linear-gradient(135deg, rgb(${mix(r, 255, 92)} ${mix(g, 255, 92)} ${mix(b, 255, 92)}) 0%, rgb(${mix(r, 255, 85)} ${mix(g, 255, 85)} ${mix(b, 255, 85)}) 100%)`;

    return shades;
};

// تابع پیشرفته تشخیص رنگ مناسب متن
export const getContrastColor = (color: string, lightText = '#ffffff', darkText = '#1f2937') => {
    if (!color) return darkText;

    let r = 0, g = 0, b = 0, alpha = 1;

    // Handle Hex
    if (color.startsWith('#')) {
        let hex = color.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } 
    // Handle RGB/RGBA
    else if (color.startsWith('rgb')) {
        const values = color.match(/(\d+(\.\d+)?)/g);
        if (values) {
            r = parseFloat(values[0]);
            g = parseFloat(values[1]);
            b = parseFloat(values[2]);
            if (values.length > 3) alpha = parseFloat(values[3]);
        }
    }

    // اگر شفافیت زیاد باشد (زیر ۶۰٪)، فرض می‌کنیم پس‌زمینه زیرین (معمولا سفید/خاکستری روشن) دیده می‌شود
    if (alpha < 0.6) {
        return darkText; 
    }

    // محاسبه روشنایی (Luminance)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // مرز ۱۴۰ برای خوانایی بهتر
    return (yiq >= 140) ? darkText : lightText;
}
