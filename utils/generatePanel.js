const { createCanvas, loadImage } = require('@napi-rs/canvas');
const https = require('https');
const http = require('http');

/* =========================================================
 * IMAGE FETCH
 * ========================================================= */

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      return reject(new Error('URL bulunamadı'));
    }

    const lib = url.startsWith('https')
      ? https
      : http;

    lib.get(
      url,
      {
        headers: {
          'User-Agent': 'WaseBot/1.0'
        }
      },
      (res) => {
        /*
         * Redirect
         */
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return fetchBuffer(
            res.headers.location
          )
            .then(resolve)
            .catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(
            new Error(`HTTP ${res.statusCode}`)
          );
        }

        const chunks = [];

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          resolve(
            Buffer.concat(chunks)
          );
        });

        res.on('error', reject);
      }
    ).on('error', reject);
  });
}

/* =========================================================
 * SAFE IMAGE LOADER
 * ========================================================= */

async function loadImageSafe(url) {
  if (!url) return null;

  try {
    const buffer =
      await fetchBuffer(url);

    return await loadImage(buffer);
  } catch (err) {
    console.warn(
      `[Panel] Görsel yüklenemedi: ${err.message}`
    );

    return null;
  }
}

/* =========================================================
 * SHAPES
 * ========================================================= */

function roundRect(
  ctx,
  x,
  y,
  width,
  height,
  radius
) {
  const r = Math.min(
    radius,
    width / 2,
    height / 2
  );

  ctx.beginPath();

  ctx.moveTo(
    x + r,
    y
  );

  ctx.arcTo(
    x + width,
    y,
    x + width,
    y + height,
    r
  );

  ctx.arcTo(
    x + width,
    y + height,
    x,
    y + height,
    r
  );

  ctx.arcTo(
    x,
    y + height,
    x,
    y,
    r
  );

  ctx.arcTo(
    x,
    y,
    x + width,
    y,
    r
  );

  ctx.closePath();
}

function clipCircle(
  ctx,
  x,
  y,
  radius
) {
  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.closePath();

  ctx.clip();
}

/* =========================================================
 * COLORS
 * ========================================================= */

function rgb(
  r,
  g,
  b,
  alpha = 1
) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lighten(
  color,
  amount
) {
  return {
    r: Math.min(
      255,
      color.r + amount
    ),

    g: Math.min(
      255,
      color.g + amount
    ),

    b: Math.min(
      255,
      color.b + amount
    )
  };
}

function darken(
  color,
  amount
) {
  return {
    r: Math.max(
      0,
      color.r - amount
    ),

    g: Math.max(
      0,
      color.g - amount
    ),

    b: Math.max(
      0,
      color.b - amount
    )
  };
}

/* =========================================================
 * RGB -> HSV
 * ========================================================= */

function rgbToHsv(
  r,
  g,
  b
) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max =
    Math.max(r, g, b);

  const min =
    Math.min(r, g, b);

  const d =
    max - min;

  let h = 0;

  if (d !== 0) {
    if (max === r) {
      h =
        ((g - b) / d) % 6;
    } else if (max === g) {
      h =
        (b - r) / d + 2;
    } else {
      h =
        (r - g) / d + 4;
    }

    h /= 6;

    if (h < 0) {
      h += 1;
    }
  }

  const s =
    max === 0
      ? 0
      : d / max;

  return {
    h,
    s,
    v: max
  };
}

/* =========================================================
 * HSV -> RGB
 * ========================================================= */

function hsvToRgb(
  h,
  s,
  v
) {
  const i =
    Math.floor(h * 6);

  const f =
    h * 6 - i;

  const p =
    v * (1 - s);

  const q =
    v * (1 - f * s);

  const t =
    v * (1 - (1 - f) * s);

  let r;
  let g;
  let b;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;

    case 1:
      r = q;
      g = v;
      b = p;
      break;

    case 2:
      r = p;
      g = v;
      b = t;
      break;

    case 3:
      r = p;
      g = q;
      b = v;
      break;

    case 4:
      r = t;
      g = p;
      b = v;
      break;

    default:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/* =========================================================
 * DOMINANT COLOR
 *
 * İkon içerisindeki renkli pikselleri analiz eder.
 * Siyah/beyaz logoları tema rengini bozmaz.
 * ========================================================= */

function extractDominantColor(image) {
  /*
   * Discord mavisi yerine nötr bir fallback.
   *
   * Eğer ikon gerçekten renksizse bunu kullanıyoruz.
   */
  const fallback = {
    r: 140,
    g: 145,
    b: 160
  };

  if (!image) {
    return fallback;
  }

  try {
    const size = 128;

    const tempCanvas =
      createCanvas(
        size,
        size
      );

    const tempCtx =
      tempCanvas.getContext('2d');

    tempCtx.drawImage(
      image,
      0,
      0,
      size,
      size
    );

    const imageData =
      tempCtx.getImageData(
        0,
        0,
        size,
        size
      );

    const data =
      imageData.data;

    const buckets =
      new Map();

    /*
     * Her 4. piksel.
     */
    for (
      let i = 0;
      i < data.length;
      i += 16
    ) {
      const r =
        data[i];

      const g =
        data[i + 1];

      const b =
        data[i + 2];

      const a =
        data[i + 3];

      if (a < 120) {
        continue;
      }

      const hsv =
        rgbToHsv(
          r,
          g,
          b
        );

      /*
       * Çok koyu pikselleri at.
       */
      if (hsv.v < 0.10) {
        continue;
      }

      /*
       * Beyaz / gri pikselleri
       * renk tespitinde çok düşük ağırlıkla kullan.
       */
      let weight = 1;

      if (hsv.s < 0.12) {
        weight *= 0.08;
      }

      /*
       * Doygun renkleri ciddi şekilde öne çıkar.
       */
      weight *=
        1 + hsv.s * 3;

      /*
       * Çok parlak beyazları azalt.
       */
      if (hsv.v > 0.94) {
        weight *= 0.15;
      }

      /*
       * 16'lık renk bucket.
       */
      const br =
        Math.round(r / 16) * 16;

      const bg =
        Math.round(g / 16) * 16;

      const bb =
        Math.round(b / 16) * 16;

      const key =
        `${br},${bg},${bb}`;

      if (!buckets.has(key)) {
        buckets.set(
          key,
          {
            r: br,
            g: bg,
            b: bb,
            weight: 0
          }
        );
      }

      buckets.get(
        key
      ).weight += weight;
    }

    /*
     * Renkli piksel yoksa nötr renk.
     */
    if (buckets.size === 0) {
      return fallback;
    }

    let best = null;

    for (
      const color
      of buckets.values()
    ) {
      if (
        !best ||
        color.weight > best.weight
      ) {
        best = color;
      }
    }

    if (!best) {
      return fallback;
    }

    const hsv =
      rgbToHsv(
        best.r,
        best.g,
        best.b
      );

    /*
     * Panel için biraz daha canlı.
     */
    hsv.s =
      Math.max(
        0.48,
        Math.min(
          1,
          hsv.s * 1.12
        )
      );

    hsv.v =
      Math.max(
        0.55,
        Math.min(
          0.92,
          hsv.v * 1.04
        )
      );

    return hsvToRgb(
      hsv.h,
      hsv.s,
      hsv.v
    );
  } catch (err) {
    console.warn(
      `[Panel] Renk analizi başarısız: ${err.message}`
    );

    return fallback;
  }
}

/* =========================================================
 * TEXT FIT
 * ========================================================= */

function fitFontSize(
  ctx,
  text,
  maxWidth,
  maxSize,
  minSize,
  weight = 'bold'
) {
  let size =
    maxSize;

  while (
    size > minSize
  ) {
    ctx.font =
      `${weight} ${size}px sans-serif`;

    if (
      ctx.measureText(text).width <=
      maxWidth
    ) {
      return size;
    }

    size--;
  }

  return minSize;
}

function truncateText(
  ctx,
  text,
  maxWidth
) {
  let value =
    String(text);

  if (
    ctx.measureText(value).width <=
    maxWidth
  ) {
    return value;
  }

  while (
    value.length > 1 &&
    ctx.measureText(
      value + '…'
    ).width > maxWidth
  ) {
    value =
      value.slice(
        0,
        -1
      );
  }

  return value + '…';
}

/* =========================================================
 * GENERATE PANEL
 * ========================================================= */

async function generatePanelImage(opts) {
  const {
    guildName = 'Sunucu',
    guildIconURL = null,
    joinChannelName = 'Oluşturma Kanalı',

    /*
     * Eğer dışarıdan Discord'un sunucu renk bilgisini
     * gönderirsen bunu direkt kullanabiliriz.
     *
     * Örnek:
     * guildColor: '#ff4d6d'
     */
    guildColor = null
  } = opts;

  /* =======================================================
   * CANVAS
   * ======================================================= */

  const W = 900;
  const H = 500;

  const canvas =
    createCanvas(
      W,
      H
    );

  const ctx =
    canvas.getContext('2d');

  /* =======================================================
   * ICON
   * ======================================================= */

  const guildIcon =
    await loadImageSafe(
      guildIconURL
    );

  /* =======================================================
   * THEME COLOR
   * ======================================================= */

  let accent;

  /*
   * guildColor verilmişse öncelik ona.
   */
  if (
    guildColor &&
    typeof guildColor === 'string'
  ) {
    const match =
      guildColor.match(
        /^#?([0-9a-f]{6})$/i
      );

    if (match) {
      const hex =
        match[1];

      accent = {
        r: parseInt(
          hex.slice(0, 2),
          16
        ),

        g: parseInt(
          hex.slice(2, 4),
          16
        ),

        b: parseInt(
          hex.slice(4, 6),
          16
        )
      };
    }
  }

  /*
   * guildColor yoksa ikon.
   */
  if (!accent) {
    accent =
      extractDominantColor(
        guildIcon
      );
  }

  const brightAccent =
    lighten(
      accent,
      42
    );

  const lightAccent =
    lighten(
      accent,
      75
    );

  const darkAccent =
    darken(
      accent,
      28
    );

  /* =======================================================
   * BACKGROUND
   * ======================================================= */

  ctx.fillStyle =
    '#08090d';

  ctx.fillRect(
    0,
    0,
    W,
    H
  );

  /*
   * Üst renk glow.
   */
  const topGlow =
    ctx.createRadialGradient(
      W / 2,
      60,
      15,
      W / 2,
      90,
      470
    );

  topGlow.addColorStop(
    0,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0.38
    )
  );

  topGlow.addColorStop(
    0.35,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0.18
    )
  );

  topGlow.addColorStop(
    0.70,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0.055
    )
  );

  topGlow.addColorStop(
    1,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  ctx.fillStyle =
    topGlow;

  ctx.fillRect(
    0,
    0,
    W,
    280
  );

  /*
   * Alt glow.
   */
  const bottomGlow =
    ctx.createRadialGradient(
      W / 2,
      H,
      10,
      W / 2,
      H,
      430
    );

  bottomGlow.addColorStop(
    0,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0.10
    )
  );

  bottomGlow.addColorStop(
    1,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  ctx.fillStyle =
    bottomGlow;

  ctx.fillRect(
    0,
    H - 190,
    W,
    190
  );

  /* =======================================================
   * TOP LINE
   * ======================================================= */

  const topLine =
    ctx.createLinearGradient(
      100,
      0,
      W - 100,
      0
    );

  topLine.addColorStop(
    0,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  topLine.addColorStop(
    0.5,
    rgb(
      brightAccent.r,
      brightAccent.g,
      brightAccent.b,
      0.55
    )
  );

  topLine.addColorStop(
    1,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  ctx.fillStyle =
    topLine;

  ctx.fillRect(
    150,
    0,
    W - 300,
    1
  );

  /* =======================================================
   * SERVER AVATAR
   * ======================================================= */

  const cx =
    W / 2;

  const avatarY =
    78;

  const avatarRadius =
    55;

  /*
   * Avatar glow.
   */
  const avatarGlow =
    ctx.createRadialGradient(
      cx,
      avatarY,
      45,
      cx,
      avatarY,
      105
    );

  avatarGlow.addColorStop(
    0,
    rgb(
      brightAccent.r,
      brightAccent.g,
      brightAccent.b,
      0.55
    )
  );

  avatarGlow.addColorStop(
    0.45,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0.18
    )
  );

  avatarGlow.addColorStop(
    1,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  ctx.fillStyle =
    avatarGlow;

  ctx.fillRect(
    cx - 110,
    avatarY - 110,
    220,
    220
  );

  /*
   * Avatar ring.
   */
  const ring =
    ctx.createLinearGradient(
      cx - avatarRadius,
      avatarY - avatarRadius,
      cx + avatarRadius,
      avatarY + avatarRadius
    );

  ring.addColorStop(
    0,
    rgb(
      lightAccent.r,
      lightAccent.g,
      lightAccent.b,
      1
    )
  );

  ring.addColorStop(
    0.5,
    rgb(
      brightAccent.r,
      brightAccent.g,
      brightAccent.b,
      1
    )
  );

  ring.addColorStop(
    1,
    rgb(
      darkAccent.r,
      darkAccent.g,
      darkAccent.b,
      1
    )
  );

  ctx.beginPath();

  ctx.arc(
    cx,
    avatarY,
    avatarRadius,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    ring;

  ctx.fill();

  /*
   * Avatar.
   */
  ctx.save();

  clipCircle(
    ctx,
    cx,
    avatarY,
    avatarRadius - 5
  );

  if (guildIcon) {
    ctx.drawImage(
      guildIcon,
      cx - avatarRadius + 5,
      avatarY - avatarRadius + 5,
      (avatarRadius - 5) * 2,
      (avatarRadius - 5) * 2
    );
  } else {
    ctx.fillStyle =
      '#171923';

    ctx.fillRect(
      cx - avatarRadius,
      avatarY - avatarRadius,
      avatarRadius * 2,
      avatarRadius * 2
    );

    ctx.fillStyle =
      '#ffffff';

    ctx.font =
      'bold 42px sans-serif';

    ctx.textAlign =
      'center';

    ctx.textBaseline =
      'middle';

    ctx.fillText(
      String(guildName)
        .charAt(0)
        .toUpperCase(),
      cx,
      avatarY
    );
  }

  ctx.restore();

  /* =======================================================
   * SERVER NAME
   * ======================================================= */

  let displayName =
    String(guildName);

  const serverNameSize =
    fitFontSize(
      ctx,
      displayName,
      500,
      24,
      18,
      'bold'
    );

  ctx.font =
    `bold ${serverNameSize}px sans-serif`;

  displayName =
    truncateText(
      ctx,
      displayName,
      500
    );

  ctx.textAlign =
    'center';

  ctx.textBaseline =
    'alphabetic';

  ctx.fillStyle =
    '#ffffff';

  ctx.fillText(
    displayName,
    cx,
    153
  );

  /* =======================================================
   * SERVER NAME LINE
   * ======================================================= */

  const lineGradient =
    ctx.createLinearGradient(
      cx - 95,
      168,
      cx + 95,
      168
    );

  lineGradient.addColorStop(
    0,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  lineGradient.addColorStop(
    0.5,
    rgb(
      brightAccent.r,
      brightAccent.g,
      brightAccent.b,
      0.80
    )
  );

  lineGradient.addColorStop(
    1,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  ctx.fillStyle =
    lineGradient;

  ctx.fillRect(
    cx - 95,
    168,
    190,
    2
  );

  /* =======================================================
   * MAIN DESCRIPTION
   *
   * BURADA YAZIYI BÜYÜTTÜK
   * ======================================================= */

  ctx.textAlign =
    'center';

  ctx.font =
    '17px sans-serif';

  ctx.fillStyle =
    '#d0d2d9';

  ctx.fillText(
    'Aşağıdaki butonları kullanarak kişisel ses odanı yönetebilirsin.',
    cx,
    204
  );

  /* =======================================================
   * CHANNEL LINE
   *
   * KÜÇÜK + BOLD CHANNEL
   * ======================================================= */

  const channelName =
    `#${String(joinChannelName)}`;

  /*
   * Prefix daha küçük ve normal.
   */
  const prefix =
    'Oda oluşturmak için';

  ctx.font =
    '13px sans-serif';

  const prefixWidth =
    ctx.measureText(
      prefix
    ).width;

  /*
   * KANAL ADI DAHA KÜÇÜK.
   */
  const channelSize =
    fitFontSize(
      ctx,
      channelName,
      300,
      13,
      10,
      'bold'
    );

  ctx.font =
    `bold ${channelSize}px sans-serif`;

  const channelWidth =
    ctx.measureText(
      channelName
    ).width;

  const gap = 5;

  const totalWidth =
    prefixWidth +
    gap +
    channelWidth;

  let x =
    cx -
    totalWidth / 2;

  /*
   * Prefix
   */
  ctx.textAlign =
    'left';

  ctx.textBaseline =
    'alphabetic';

  ctx.font =
    '13px sans-serif';

  ctx.fillStyle =
    '#858996';

  ctx.fillText(
    prefix,
    x,
    229
  );

  x +=
    prefixWidth +
    gap;

  /*
   * CHANNEL
   *
   * BOLD + ACCENT
   */
  ctx.font =
    `bold ${channelSize}px sans-serif`;

  ctx.fillStyle =
    rgb(
      brightAccent.r,
      brightAccent.g,
      brightAccent.b,
      1
    );

  ctx.fillText(
    channelName,
    x,
    229
  );

  /* =======================================================
   * INFO BOX
   * ======================================================= */

  const infoX =
    105;

  const infoY =
    258;

  const infoW =
    690;

  const infoH =
    72;

  /*
   * Box glow.
   */
  const infoGlow =
    ctx.createRadialGradient(
      cx,
      infoY + 36,
      15,
      cx,
      infoY + 36,
      380
    );

  infoGlow.addColorStop(
    0,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0.075
    )
  );

  infoGlow.addColorStop(
    1,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  ctx.fillStyle =
    infoGlow;

  ctx.fillRect(
    50,
    infoY - 20,
    800,
    110
  );

  /*
   * Background.
   */
  roundRect(
    ctx,
    infoX,
    infoY,
    infoW,
    infoH,
    17
  );

  ctx.fillStyle =
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0.065
    );

  ctx.fill();

  /*
   * Border.
   */
  roundRect(
    ctx,
    infoX,
    infoY,
    infoW,
    infoH,
    17
  );

  ctx.strokeStyle =
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0.30
    );

  ctx.lineWidth =
    1;

  ctx.stroke();

  /* =======================================================
   * INFO DOT
   * ======================================================= */

  const dotX =
    infoX + 26;

  const dotY =
    infoY + 36;

  const dotGlow =
    ctx.createRadialGradient(
      dotX,
      dotY,
      2,
      dotX,
      dotY,
      22
    );

  dotGlow.addColorStop(
    0,
    rgb(
      brightAccent.r,
      brightAccent.g,
      brightAccent.b,
      0.65
    )
  );

  dotGlow.addColorStop(
    1,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  ctx.fillStyle =
    dotGlow;

  ctx.fillRect(
    dotX - 22,
    dotY - 22,
    44,
    44
  );

  ctx.beginPath();

  ctx.arc(
    dotX,
    dotY,
    6,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    rgb(
      brightAccent.r,
      brightAccent.g,
      brightAccent.b,
      1
    );

  ctx.fill();

  /* =======================================================
   * INFO TITLE
   *
   * DAHA BÜYÜK
   * ======================================================= */

  ctx.textAlign =
    'left';

  ctx.font =
    'bold 15px sans-serif';

  ctx.fillStyle =
    '#f1f2f5';

  ctx.fillText(
    'Nasıl çalışır?',
    infoX + 44,
    infoY + 29
  );

  /* =======================================================
   * INFO DESCRIPTION
   *
   * DAHA BÜYÜK
   * ======================================================= */

  ctx.font =
    '13.5px sans-serif';

  ctx.fillStyle =
    '#aeb1bc';

  const infoDescription =
    `#${String(joinChannelName)} kanalına girdiğinde sana özel bir ses odası otomatik oluşturulur.`;

  const safeInfoDescription =
    truncateText(
      ctx,
      infoDescription,
      infoW - 65
    );

  ctx.fillText(
    safeInfoDescription,
    infoX + 44,
    infoY + 52
  );

  /* =======================================================
   * BOTTOM DESCRIPTION
   * ======================================================= */

  ctx.textAlign =
    'center';

  ctx.font =
    '13px sans-serif';

  ctx.fillStyle =
    '#737784';

  ctx.fillText(
    'Odan oluşturulduktan sonra aşağıdaki butonlarla yönetebilirsin.',
    cx,
    365
  );

  /* =======================================================
   * SEPARATOR
   * ======================================================= */

  const separator =
    ctx.createLinearGradient(
      160,
      388,
      W - 160,
      388
    );

  separator.addColorStop(
    0,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  separator.addColorStop(
    0.5,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0.35
    )
  );

  separator.addColorStop(
    1,
    rgb(
      accent.r,
      accent.g,
      accent.b,
      0
    )
  );

  ctx.fillStyle =
    separator;

  ctx.fillRect(
    160,
    388,
    W - 320,
    1
  );

  /* =======================================================
   * FOOTER
   * ======================================================= */

  ctx.textAlign =
    'center';

  ctx.font =
    '11px sans-serif';

  ctx.fillStyle =
    '#555965';

  ctx.fillText(
    'Powered By. Wase',
    cx,
    465
  );

  /* =======================================================
   * PNG
   * ======================================================= */

  return canvas.toBuffer(
    'image/png'
  );
}

/* =========================================================
 * EXPORT
 * ========================================================= */

module.exports = {
  generatePanelImage
};