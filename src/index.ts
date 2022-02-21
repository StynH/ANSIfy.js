import _ from "lodash";

type Canvas = {
    context: CanvasRenderingContext2D,
    width: number,
    height: number
}

type RGB = {
    r: number;
    g: number;
    b: number;
}

type Position = {
    x: number;
    y: number;
}

type Icon = {
    position: Position;
    color: RGB;
}

class NumberHelper{

    static lerp(a: number, b: number, u: number): number{
        return (1 - u) * a + u * b;
    }

}

class ColorHelper{

    static transitionToColor(start: string, end: string, step: number): string{
        const startRgb = ColorHelper.hexToRgb(start)!;
        const endRgb = ColorHelper.hexToRgb(end)!;
        const r = Math.floor(NumberHelper.lerp(startRgb.r, endRgb.r, step));
        const g = Math.floor(NumberHelper.lerp(startRgb.g, endRgb.g, step));
        const b = Math.floor(NumberHelper.lerp(startRgb.b, endRgb.b, step));
        return ColorHelper.rgbToHex(r, g, b);
    }

    static hexToRgb(hex: string): RGB | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r: number, g: number, b: number): string {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

}

export class ANSIfy{

    private static readonly ANSI_CHAR_WIDTH: number = 14;
    private static readonly ANSI_CHAR_HEIGHT: number = 26;

    private icons: Icon[];

    constructor(){
        this.icons = [];
    }

    public run(imageUrl: string): void{
        this.icons = [];

        const img = new Image();
        img.src = imageUrl;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = this.createTempCanvas(img.width, img.height);
            this.loadImage(img, canvas);
            this.processImage(canvas);
            this.printImage();
        };

        img.onerror = (err) => {
            alert("Error loading image: not found or URL has CORS rules.")
        }
    }

    private createTempCanvas(width: number, height: number): Canvas{
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        return {
            context: canvas.getContext("2d")!,
            height: height,
            width: width
        }
    }

    private loadImage(img: CanvasImageSource, canvas: Canvas){
        canvas.context.drawImage(img, 0, 0);
    }

    private processImage(canvas: Canvas): void{
        for(let y = 0; y < canvas.height; y += ANSIfy.ANSI_CHAR_HEIGHT){
            for(let x = 0; x < canvas.width; x += ANSIfy.ANSI_CHAR_WIDTH){
                let icon = this.processBlock(x, y, canvas);
                this.icons.push(icon);
            }
        }
    }

    private processBlock(startX: number, startY: number, canvas: Canvas): Icon{
        let pixelsProcessed = 0;
        let color: RGB = {
            r: 0,
            g: 0,
            b: 0
        }

        const pixelData = canvas.context.getImageData(startX, startY, ANSIfy.ANSI_CHAR_HEIGHT, ANSIfy.ANSI_CHAR_WIDTH).data;
        for(let index = 0; index < pixelData.length; index += 4){
            color.r += pixelData[index] * pixelData[index];
            color.g += pixelData[index + 1] * pixelData[index + 1];
            color.b += pixelData[index + 2] * pixelData[index + 2];

            ++pixelsProcessed;
        }

        color.r = Math.round(Math.sqrt(color.r / pixelsProcessed));
        color.g = Math.round(Math.sqrt(color.g / pixelsProcessed));
        color.b = Math.round(Math.sqrt(color.b / pixelsProcessed));

        return {
            color: color,
            position: {
                x: startX,
                y: startY
            }
        }
    }

    private printImage() {
        const element = $(".output");
        element.empty();

        let previousY = 0;

        _.forEach(this.icons, (icon: Icon) => {
            if(previousY < icon.position.y){
                element.append("</br>");
                previousY = icon.position.y;
            }

            const hexColor = ColorHelper.rgbToHex(icon.color.r, icon.color.g, icon.color.b);
            const block = $(`<span style='color: ${hexColor}'>▓</span>`);
            element.append(block);
        });
    }
}
