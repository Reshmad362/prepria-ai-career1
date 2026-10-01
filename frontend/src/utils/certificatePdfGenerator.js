/**
 * PREPRIA Canonical Certificate PDF Generator
 * 
 * Unifies In-App Preview & Downloaded PDF under ONE canonical mathematical layout model.
 * Produces a pristine 300 DPI A4 Landscape PDF directly in-browser with 100% visual parity
 * to the in-app certificate component (proportions, typography hierarchy, colors, dual gold
 * borders, corner brackets, verified emblem seal, signatures, course title box, and footer metadata).
 */

// Shared Canonical Design Constants (1050x742 base coordinates scaled to 300 DPI 2380x1684)
export const CERT_BASE_WIDTH = 1050;
export const CERT_BASE_HEIGHT = 742;
export const CERT_EXPORT_WIDTH = 2380;
export const CERT_EXPORT_HEIGHT = 1684;
const SCALE = CERT_EXPORT_WIDTH / CERT_BASE_WIDTH; // 2.266666667

/**
 * Draws a 5-pointed star icon on canvas
 */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fillStyle) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a ShieldCheck vector icon on canvas
 */
function drawShieldCheck(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 24;
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Shield Path
  ctx.beginPath();
  ctx.moveTo(12, 22);
  ctx.bezierCurveTo(12, 22, 20, 18, 20, 12);
  ctx.lineTo(20, 5);
  ctx.lineTo(12, 2);
  ctx.lineTo(4, 5);
  ctx.lineTo(4, 12);
  ctx.bezierCurveTo(4, 18, 12, 22, 12, 22);
  ctx.stroke();

  // Checkmark Path
  ctx.beginPath();
  ctx.moveTo(9, 12);
  ctx.lineTo(11, 14);
  ctx.lineTo(15, 10);
  ctx.stroke();

  ctx.restore();
}

/**
 * Wraps text onto multiple lines given a max width and returns lines array
 */
function getWrappedLines(ctx, text, maxWidth) {
  const words = String(text || '').trim().split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function generateCertificatePDF({
  recipientName,
  courseTitle,
  courseCategory,
  courseDuration,
  certificateId,
  issueDate,
  verificationUrl = 'prepria.com/verify'
}) {
  // 1. Ensure document web fonts are active
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn("Font readiness skipped:", e);
    }
  }

  // 2. High-DPI Canvas Initialization (A4 Landscape 2380 x 1684 @ 300 DPI)
  const width = CERT_EXPORT_WIDTH;
  const height = CERT_EXPORT_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("Canvas 2D context not available");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const centerX = width / 2;

  // ──────────────────────────────────────────────────
  // 1. BASE BACKGROUND & RADIAL GLOW & GRID PATTERN
  // ──────────────────────────────────────────────────
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Soft Radial Warm Ivory Glow (matches #FDFBF7 -> #F8F4EC)
  const bgGlow = ctx.createRadialGradient(centerX, height / 2, 80 * SCALE, centerX, height / 2, width * 0.72);
  bgGlow.addColorStop(0, '#FFFFFF');
  bgGlow.addColorStop(0.6, '#FDFBF7');
  bgGlow.addColorStop(1, '#F8F4EC');
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, width, height);

  // Subtle Center Orange Glow
  const orangeGlow = ctx.createRadialGradient(centerX, height / 2, 0, centerX, height / 2, width * 0.45);
  orangeGlow.addColorStop(0, 'rgba(255, 107, 0, 0.03)');
  orangeGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = orangeGlow;
  ctx.fillRect(0, 0, width, height);

  // Geometric 40px Grid Pattern
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.018)';
  ctx.lineWidth = 1.5;
  const gridSize = 40 * SCALE;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // ──────────────────────────────────────────────────
  // 2. DUAL GOLD BORDERS & ORANGE CORNER ACCENTS
  // ──────────────────────────────────────────────────
  const mOuter = 22 * SCALE;
  const mInner = 30 * SCALE;

  // Outer Gold Border (2px @ base -> 4.5px)
  ctx.strokeStyle = '#C49756';
  ctx.lineWidth = 2 * SCALE;
  ctx.strokeRect(mOuter, mOuter, width - mOuter * 2, height - mOuter * 2);

  // Inner Subtle Gold Border (1px @ base -> 2.25px)
  ctx.strokeStyle = 'rgba(196, 151, 86, 0.45)';
  ctx.lineWidth = 1 * SCALE;
  ctx.strokeRect(mInner, mInner, width - mInner * 2, height - mInner * 2);

  // Corner Accent Brackets in PREPRIA Primary Orange (#FF6B00)
  ctx.strokeStyle = '#FF6B00';
  ctx.lineWidth = 3.5 * SCALE;
  ctx.lineCap = 'square';
  const cLen = 28 * SCALE;
  const cOff = 19 * SCALE;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(cOff, cOff + cLen);
  ctx.lineTo(cOff, cOff);
  ctx.lineTo(cOff + cLen, cOff);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(width - cOff - cLen, cOff);
  ctx.lineTo(width - cOff, cOff);
  ctx.lineTo(width - cOff, cOff + cLen);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(cOff, height - cOff - cLen);
  ctx.lineTo(cOff, height - cOff);
  ctx.lineTo(cOff + cLen, height - cOff);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(width - cOff - cLen, height - cOff);
  ctx.lineTo(width - cOff, height - cOff);
  ctx.lineTo(width - cOff, height - cOff - cLen);
  ctx.stroke();

  // ──────────────────────────────────────────────────
  // 3. ZONE 1: HEADER (LOGO + VERIFIED STATUS + TITLE)
  // ──────────────────────────────────────────────────
  const headerTopY = 38 * SCALE;
  const logoLeftX = 64 * SCALE;

  // Logo Badge (Orange Square with 'P')
  const logoSize = 32 * SCALE;
  const logoRadius = 8 * SCALE;
  ctx.save();
  const logoGrad = ctx.createLinearGradient(logoLeftX, headerTopY, logoLeftX + logoSize, headerTopY + logoSize);
  logoGrad.addColorStop(0, '#FF6B00');
  logoGrad.addColorStop(1, '#E05D00');
  ctx.fillStyle = logoGrad;
  ctx.beginPath();
  ctx.roundRect(logoLeftX, headerTopY, logoSize, logoSize, logoRadius);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 36px Manrope, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('P', logoLeftX + logoSize / 2, headerTopY + logoSize / 2 + 1);
  ctx.restore();

  // Brand Name & Tagline
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#0F172A';
  ctx.font = '900 36px Manrope, sans-serif';
  ctx.fillText('PREPRIA', logoLeftX + logoSize + 12 * SCALE, headerTopY + 22 * SCALE);

  ctx.fillStyle = '#FF6B00';
  ctx.font = '800 18px Manrope, sans-serif';
  ctx.fillText('AI CAREER INTELLIGENCE PLATFORM', logoLeftX + logoSize + 13 * SCALE, headerTopY + 34 * SCALE);

  // Verified Status Pill (Right Aligned)
  const pillRightX = width - 64 * SCALE;
  const pillW = 260 * (SCALE / 2.2);
  const pillH = 32 * SCALE;
  const pillX = pillRightX - pillW;
  const pillY = headerTopY + 2 * SCALE;

  ctx.fillStyle = '#ECFDF5';
  ctx.strokeStyle = '#A7F3D0';
  ctx.lineWidth = 1 * SCALE;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 9999);
  ctx.fill();
  ctx.stroke();

  // Shield Check Icon & Text
  drawShieldCheck(ctx, pillX + 14 * SCALE, pillY + 6 * SCALE, 20 * SCALE, '#059669');
  ctx.fillStyle = '#059669';
  ctx.font = '800 21px Manrope, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VERIFIED CERTIFICATE', pillX + pillW / 2 + 10 * SCALE, pillY + 22 * SCALE);

  // Certificate Main Title
  const mainTitleY = headerTopY + 76 * SCALE;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F172A';
  ctx.font = '700 58px Cinzel, "Playfair Display", Georgia, serif';
  ctx.fillText('CERTIFICATE OF CAREER ACCELERATION & ACHIEVEMENT', centerX, mainTitleY);

  // Gold Center Divider Line
  const divLineW = 180 * SCALE;
  const divLineY = mainTitleY + 14 * SCALE;
  const divGrad = ctx.createLinearGradient(centerX - divLineW / 2, 0, centerX + divLineW / 2, 0);
  divGrad.addColorStop(0, 'rgba(196, 151, 86, 0)');
  divGrad.addColorStop(0.5, '#C49756');
  divGrad.addColorStop(1, 'rgba(196, 151, 86, 0)');
  ctx.fillStyle = divGrad;
  ctx.fillRect(centerX - divLineW / 2, divLineY, divLineW, 2 * SCALE);

  // ──────────────────────────────────────────────────
  // 4. ZONE 2: PRESENTATION, RECIPIENT & COURSE TITLE BOX
  // ──────────────────────────────────────────────────
  // "THIS IS OFFICIALLY PRESENTED TO"
  const presLabelY = divLineY + 38 * SCALE;
  ctx.fillStyle = '#64748B';
  ctx.font = '700 23px Manrope, sans-serif';
  ctx.fillText('THIS IS OFFICIALLY PRESENTED TO', centerX, presLabelY);

  // Recipient Full Name (Focal Point in Playfair Display)
  const recipientY = presLabelY + 54 * SCALE;
  ctx.fillStyle = '#0A192F';
  ctx.font = '700 82px "Playfair Display", Georgia, serif';
  ctx.fillText(String(recipientName || 'DEDICATED LEARNER').toUpperCase(), centerX, recipientY);

  // "For successfully completing all rigorous academic curriculum modules..."
  const descY = recipientY + 34 * SCALE;
  ctx.fillStyle = '#475569';
  ctx.font = '600 24px Manrope, sans-serif';
  const descText = "For successfully completing all rigorous academic curriculum modules, passing required checkpoint assessments, and demonstrating verified practical competencies in";
  const descLines = getWrappedLines(ctx, descText, 680 * SCALE);
  let curDescY = descY;
  descLines.forEach((dLine) => {
    ctx.fillText(dLine, centerX, curDescY);
    curDescY += 28 * SCALE;
  });

  // Course Title Box (Subtle orange tint box with border)
  ctx.font = '700 48px Cinzel, "Playfair Display", Georgia, serif';
  const courseTitleLines = getWrappedLines(ctx, courseTitle, 760 * SCALE);
  const longestCourseLine = courseTitleLines.reduce((max, l) => Math.max(max, ctx.measureText(l).width), 0);
  const courseBoxPaddingX = 28 * SCALE;
  const courseBoxPaddingY = 10 * SCALE;
  const courseBoxW = Math.min(width - 240 * SCALE, longestCourseLine + courseBoxPaddingX * 2);
  const courseBoxH = (courseTitleLines.length * 48 * SCALE) + (courseBoxPaddingY * 2);
  const courseBoxX = centerX - courseBoxW / 2;
  const courseBoxY = curDescY + 12 * SCALE;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 107, 0, 0.04)';
  ctx.strokeStyle = 'rgba(255, 107, 0, 0.22)';
  ctx.lineWidth = 1.2 * SCALE;
  ctx.beginPath();
  ctx.roundRect(courseBoxX, courseBoxY, courseBoxW, courseBoxH, 12 * SCALE);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Course Title Text
  ctx.fillStyle = '#FF6B00';
  ctx.font = '700 48px Cinzel, "Playfair Display", Georgia, serif';
  let curCourseY = courseBoxY + courseBoxPaddingY + 36 * SCALE;
  courseTitleLines.forEach((cLine) => {
    ctx.fillText(cLine, centerX, curCourseY);
    curCourseY += 46 * SCALE;
  });

  // Curriculum Meta Info
  const metaY = courseBoxY + courseBoxH + 20 * SCALE;
  ctx.fillStyle = '#64748B';
  ctx.font = '700 24px Manrope, sans-serif';
  ctx.fillText(`${courseCategory} • ${courseDuration} Curriculum`, centerX, metaY);

  // ──────────────────────────────────────────────────
  // 5. ZONE 3: SIGNATURES & PREPRIA SEAL EMBLEM
  // ──────────────────────────────────────────────────
  const sigLeftX = centerX - 240 * SCALE;
  const sigRightX = centerX + 240 * SCALE;
  const sigBaseY = height - 165 * SCALE;

  // Left Signatory: Dr. Elena Rostova
  ctx.fillStyle = '#0F172A';
  ctx.font = '400 64px "Pinyon Script", "Brush Script MT", cursive';
  ctx.fillText('Elena Rostova', sigLeftX, sigBaseY - 14 * SCALE);

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1 * SCALE;
  ctx.beginPath();
  ctx.moveTo(sigLeftX - 110 * SCALE, sigBaseY);
  ctx.lineTo(sigLeftX + 110 * SCALE, sigBaseY);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = '800 24px Manrope, sans-serif';
  ctx.fillText('DR. ELENA ROSTOVA', sigLeftX, sigBaseY + 18 * SCALE);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 20px Manrope, sans-serif';
  ctx.fillText('Lead Academic Director, PREPRIA', sigLeftX, sigBaseY + 36 * SCALE);

  // Center Emblem Seal (96px @ base -> 217px diameter)
  const sealR = 48 * SCALE;
  const sealY = sigBaseY + 8 * SCALE;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, sealY, sealR, 0, Math.PI * 2);
  const sealGrad = ctx.createRadialGradient(centerX - 10 * SCALE, sealY - 10 * SCALE, 5 * SCALE, centerX, sealY, sealR);
  sealGrad.addColorStop(0, '#FFFFFF');
  sealGrad.addColorStop(0.5, '#FFF7F0');
  sealGrad.addColorStop(1, '#FFE8D4');
  ctx.fillStyle = sealGrad;
  ctx.fill();

  // Dashed Orange Outer Seal Ring
  ctx.strokeStyle = '#FF6B00';
  ctx.lineWidth = 2 * SCALE;
  ctx.setLineDash([8 * SCALE, 6 * SCALE]);
  ctx.stroke();
  ctx.restore();

  // Inner Star & Seal Typography
  drawStar(ctx, centerX, sealY - 24 * SCALE, 5, 12 * SCALE, 5 * SCALE, '#FF6B00');

  ctx.fillStyle = '#0F172A';
  ctx.font = '900 18px Manrope, sans-serif';
  ctx.fillText('PREPRIA', centerX, sealY - 5 * SCALE);

  ctx.fillStyle = '#FF6B00';
  ctx.font = '800 21px Cinzel, serif';
  ctx.fillText('VERIFIED', centerX, sealY + 14 * SCALE);

  ctx.fillStyle = '#64748B';
  ctx.font = '800 15px Manrope, sans-serif';
  ctx.fillText('ACCREDITED', centerX, sealY + 30 * SCALE);

  // Right Signatory: Marcus Vance
  ctx.fillStyle = '#0F172A';
  ctx.font = '400 64px "Pinyon Script", "Brush Script MT", cursive';
  ctx.fillText('Marcus Vance', sigRightX, sigBaseY - 14 * SCALE);

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1 * SCALE;
  ctx.beginPath();
  ctx.moveTo(sigRightX - 110 * SCALE, sigBaseY);
  ctx.lineTo(sigRightX + 110 * SCALE, sigBaseY);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = '800 24px Manrope, sans-serif';
  ctx.fillText('MARCUS VANCE', sigRightX, sigBaseY + 18 * SCALE);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 20px Manrope, sans-serif';
  ctx.fillText('Head of Career Intelligence & AI', sigRightX, sigBaseY + 36 * SCALE);

  // ──────────────────────────────────────────────────
  // 6. ZONE 4: FOOTER METADATA (3 GRID COLUMNS)
  // ──────────────────────────────────────────────────
  const footerDividerY = height - 82 * SCALE;
  const footerW = 900 * SCALE;
  const footLeftX = centerX - footerW / 2 + 16 * SCALE;
  const footRightX = centerX + footerW / 2 - 16 * SCALE;
  const footLabelY = footerDividerY + 20 * SCALE;
  const footValY = footLabelY + 20 * SCALE;

  ctx.strokeStyle = 'rgba(196, 151, 86, 0.35)';
  ctx.lineWidth = 1 * SCALE;
  ctx.beginPath();
  ctx.moveTo(centerX - footerW / 2, footerDividerY);
  ctx.lineTo(centerX + footerW / 2, footerDividerY);
  ctx.stroke();

  // Column 1: Issue Date (Left Aligned)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = '800 18px Manrope, sans-serif';
  ctx.fillText('ISSUE DATE', footLeftX, footLabelY);
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 26px Manrope, sans-serif';
  ctx.fillText(String(issueDate), footLeftX, footValY);

  // Column 2: Certificate ID (Center Aligned)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = '800 18px Manrope, sans-serif';
  ctx.fillText('CERTIFICATE ID', centerX, footLabelY);
  ctx.fillStyle = '#FF6B00';
  ctx.font = '800 26px "JetBrains Mono", monospace, sans-serif';
  ctx.fillText(String(certificateId), centerX, footValY);

  // Column 3: Verification URL (Right Aligned)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748B';
  ctx.font = '800 18px Manrope, sans-serif';
  ctx.fillText('VERIFICATION', footRightX, footLabelY);
  ctx.fillStyle = '#059669';
  ctx.font = '800 26px Manrope, sans-serif';
  ctx.fillText(String(verificationUrl), footRightX, footValY);

  // ──────────────────────────────────────────────────
  // 7. EXPORT CLEAN STREAM & DIRECT BROWSER DOWNLOAD
  // ──────────────────────────────────────────────────
  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdfBytes = createA4LandscapePdfFromJpeg(imgData, width, height);

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  const sanitizedTitle = String(courseTitle || 'Course').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  anchor.download = `PREPRIA_Certificate_${sanitizedTitle}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);

  return true;
}

/**
 * Pure binary PDF Builder for single A4 landscape image (297mm x 210mm)
 */
function createA4LandscapePdfFromJpeg(dataUrl, imgWidth, imgHeight) {
  const base64Data = dataUrl.split(',')[1];
  const binaryString = atob(base64Data);
  const imageBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    imageBytes[i] = binaryString.charCodeAt(i);
  }

  const pageWidth = 841.89; // A4 landscape points (297mm)
  const pageHeight = 595.28; // A4 landscape points (210mm)

  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let byteOffset = 0;

  function pushString(str) {
    const arr = enc.encode(str);
    chunks.push(arr);
    byteOffset += arr.length;
  }

  function pushBytes(arr) {
    chunks.push(arr);
    byteOffset += arr.length;
  }

  // PDF Header
  pushString('%PDF-1.4\n%âãÏÓ\n');

  // Object 1: Catalog
  offsets[1] = byteOffset;
  pushString('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages
  offsets[2] = byteOffset;
  pushString('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Object 3: Page
  offsets[3] = byteOffset;
  pushString(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  // Object 4: Image XObject
  offsets[4] = byteOffset;
  pushString(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`
  );
  pushBytes(imageBytes);
  pushString('\nendstream\nendobj\n');

  // Object 5: Content Stream
  const contentStream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
  offsets[5] = byteOffset;
  pushString(
    `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`
  );

  // Cross-reference table
  const startXref = byteOffset;
  pushString('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) {
    const off = String(offsets[i]).padStart(10, '0');
    pushString(`${off} 00000 n \n`);
  }

  // Trailer
  pushString(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);

  // Merge all chunks into single Uint8Array
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const pdfOutput = new Uint8Array(totalLength);
  let pos = 0;
  for (const chunk of chunks) {
    pdfOutput.set(chunk, pos);
    pos += chunk.length;
  }

  return pdfOutput;
}
