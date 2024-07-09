import PNGlib from './pnglib';

class Svg {
  constructor(size, foreground, background) {
    this.size = size;
    this.foreground = this.color(...foreground);
    this.background = this.color(...background);
    this.rectangles = [];
  }

  color(r, g, b, a) {
    const values = [r, g, b].map(Math.round);
    values.push(a >= 0 && a <= 255 ? a / 255 : 1);
    return `rgba(${values.join(',')})`;
  }

  getDump() {
    const stroke = this.size * 0.005;
    let xml = `<svg xmlns='http://www.w3.org/2000/svg' width='${this.size}' height='${this.size}' style='background-color:${this.background};'>
                <g style='fill:${this.foreground}; stroke:${this.foreground}; stroke-width:${stroke};'>`;

    for (const rect of this.rectangles) {
      if (rect.color === this.background) continue;
      xml += `<rect x='${rect.x}' y='${rect.y}' width='${rect.w}' height='${rect.h}'/>`;
    }
    xml += '</g></svg>';
    return xml;
  }

  getBase64() {
    if (typeof btoa === 'function') {
      return btoa(this.getDump());
    } else if (Buffer) {
      return Buffer.from(this.getDump(), 'binary').toString('base64');
    } else {
      throw new Error('Cannot generate base64 output');
    }
  }
}

class Identicon {
  constructor(hash, options = {}) {
    if (typeof hash !== 'string' || hash.length < 15) {
      throw new Error('A hash of at least 15 characters is required.');
    }

    this.defaults = {
      background: [240, 240, 240, 255],
      margin: 0.08,
      size: 64,
      saturation: 0.7,
      brightness: 0.5,
      format: 'png',
    };

    this.options = { ...this.defaults, ...options };

    if (typeof arguments[1] === 'number') {
      this.options.size = arguments[1];
    }
    if (arguments[2]) {
      this.options.margin = arguments[2];
    }

    this.hash = hash;
    this.background = this.options.background;
    this.size = this.options.size;
    this.format = this.options.format;
    this.margin = this.options.margin !== undefined ? this.options.margin : this.defaults.margin;

    const hue = parseInt(this.hash.substr(-7), 16) / 0xfffffff;
    const { saturation, brightness } = this.options;
    this.foreground = this.options.foreground || this.hsl2rgb(hue, saturation, brightness);
  }

  image() {
    return this.isSvg()
      ? new Svg(this.size, this.foreground, this.background)
      : new PNGlib(this.size, this.size, 256);
  }

  render() {
    const image = this.image();
    const size = this.size;
    const baseMargin = Math.floor(size * this.margin);
    const cell = Math.floor((size - baseMargin * 2) / 5);
    const margin = Math.floor((size - cell * 5) / 2);
    const bg = image.color(...this.background);
    const fg = image.color(...this.foreground);

    for (let i = 0; i < 15; i++) {
      const color = parseInt(this.hash.charAt(i), 16) % 2 ? bg : fg;
      if (i < 5) {
        this.rectangle(2 * cell + margin, i * cell + margin, cell, cell, color, image);
      } else if (i < 10) {
        this.rectangle(1 * cell + margin, (i - 5) * cell + margin, cell, cell, color, image);
        this.rectangle(3 * cell + margin, (i - 5) * cell + margin, cell, cell, color, image);
      } else {
        this.rectangle(0 * cell + margin, (i - 10) * cell + margin, cell, cell, color, image);
        this.rectangle(4 * cell + margin, (i - 10) * cell + margin, cell, cell, color, image);
      }
    }

    return image;
  }

  rectangle(x, y, w, h, color, image) {
    if (this.isSvg()) {
      image.rectangles.push({ x, y, w, h, color });
    } else {
      for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
          image.buffer[image.index(i, j)] = color;
        }
      }
    }
  }

  hsl2rgb(h, s, b) {
    h *= 6;
    s = [
      (b += s *= b < 0.5 ? b : 1 - b),
      b - (h % 1) * s * 2,
      (b -= s *= 2),
      b,
      b + (h % 1) * s,
      b + s,
    ];
    return [s[~~h % 6] * 255, s[(h | 16) % 6] * 255, s[(h | 8) % 6] * 255];
  }

  toString(raw) {
    return raw ? this.render().getDump() : this.render().getBase64();
  }

  isSvg() {
    return this.format.match(/svg/i);
  }
}

export default Identicon;
