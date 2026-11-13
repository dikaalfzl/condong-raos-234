// src/utils/imageSafety.js
const BANNED_WORDS = [
  'bokep', 'porno', 'porn', 'sex', 'seks', 'bugil', 'telanjang', 'nude',
  'naked', '18+', 'nsfw', 'hentai', 'boobs', 'payudara', 'kelamin',
  'memek', 'kontol', 'ngentot', 'colmek', 'coli', 'open bo', 'michat',
  'slot gacor', 'judi', 'babi', 'anjing',  'monyet', 'bangsat', 'tai',
];

export const containsBannedText = (text = '') => {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((w) => lower.includes(w));
};

let cachedNsfwModel = null;

async function loadNsfwAiModel() {
  if (cachedNsfwModel) return cachedNsfwModel;
  try {
    if (!window.tf) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js';
        s.onload = res;
        s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    if (!window.nsfwjs) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/nsfwjs@2.4.2/dist/nsfwjs.min.js';
        s.onload = res;
        s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    if (window.nsfwjs) {
      cachedNsfwModel = await window.nsfwjs.load();
      return cachedNsfwModel;
    }
  } catch (_) {
    // Fallback otomatis ke analisis piksel YCbCr lokal
  }
  return null;
}

export async function analyzeImageSafety(file) {
  if (containsBannedText(file.name)) {
    return {
      safe: false,
      reason: 'Nama file mengandung kata yang tidak diizinkan.',
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const SIZE = 224;
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, SIZE, SIZE);

        const model = await loadNsfwAiModel();
        if (model) {
          const predictions = await model.classify(canvas);
          const unsafePred = predictions.find(
            (p) =>
              (p.className === 'Porn' && p.probability > 0.35) ||
              (p.className === 'Hentai' && p.probability > 0.35) ||
              (p.className === 'Sexy' && p.probability > 0.55)
          );
          if (unsafePred) {
            URL.revokeObjectURL(objectUrl);
            return resolve({
              safe: false,
              reason: 'Foto tidak dapat diunggah karena tidak sesuai ketentuan komunitas warung.',
            });
          }
        }

        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
        let totalPixels = 0;
        let skinPixels = 0;
        let centerSkinPixels = 0;
        let centerTotalPixels = 0;

        for (let y = 0; y < SIZE; y++) {
          for (let x = 0; x < SIZE; x++) {
            const idx = (y * SIZE + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
            const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

            const isRgbSkin =
              r > 95 && g > 40 && b > 20 &&
              Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
              Math.abs(r - g) > 15 && r > g && r > b;

            const isYcbcrSkin = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;

            totalPixels++;
            const isCenter = x > SIZE * 0.2 && x < SIZE * 0.8 && y > SIZE * 0.2 && y < SIZE * 0.8;
            if (isCenter) centerTotalPixels++;

            if (isRgbSkin && isYcbcrSkin) {
              skinPixels++;
              if (isCenter) centerSkinPixels++;
            }
          }
        }

        URL.revokeObjectURL(objectUrl);

        if (skinPixels / totalPixels > 0.52 || centerSkinPixels / centerTotalPixels > 0.62) {
          return resolve({
            safe: false,
            reason: 'Foto ditolak otomatis. Mohon unggah foto suasana warung atau menu makanan yang jelas.',
          });
        }

        return resolve({ safe: true });
      } catch (_) {
        URL.revokeObjectURL(objectUrl);
        return resolve({ safe: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ safe: false, reason: 'File gambar rusak atau tidak dapat diproses.' });
    };

    img.src = objectUrl;
  });
}