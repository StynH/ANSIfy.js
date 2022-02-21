import _, { isNull, isUndefined } from "lodash";

type Canvas = {
    element: HTMLCanvasElement,
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

type Config = {
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

    private config: Config;

    constructor(config: Config){
        const defaultConfig: Config = {
        }
        this.config = this.mergeDefaultConfig(config, defaultConfig);
    }

    private mergeDefaultConfig(config: Config, defaultConfig: Config): Config{
        if(isNull(config) || isUndefined(config)){
            return defaultConfig;
        }

        Object.keys(defaultConfig).forEach((key: string) => {
            if (!config.hasOwnProperty(key)) {
                //@ts-ignore
                config[key] = defaultConfig[key];
            }
        });

        return config;
    }

}
