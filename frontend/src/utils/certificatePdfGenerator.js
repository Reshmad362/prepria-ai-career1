/**
 * PREPRIA Standalone A4 Landscape Certificate PDF Generator
 * Zero external dependencies. Generates a pristine 300 DPI A4 Landscape PDF directly in-browser.
 * Exact Light Certificate Composition.
 */

export async function generateCertificatePDF({
  recipientName,
  courseTitle,
  courseCategory,
  courseDuration,
  certificateId,
  issueDate,
  verificationUrl = 'prepria.com/verify'
}) {
  // 1. Ensure document fonts are fully loaded
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn("Font loading wait skipped:", e);
    }
  }

  // 2. Setup A4 Landscape Canvas at High-DPI (2380 x 1684 px -> ~300 DPI for 297mm x 210mm)
  const width = 2380;
  const height = 1684;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("Canvas 2D context not supported");
  }

  // Enable high-quality anti-aliasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // ──────────────────────────────────────────────────
  // BASE BACKGROUND & SUBTLE LIGHT TEXTURE
  // ──────────────────────────────────────────────────
  // Base Pure Canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Soft Radial Warm Ivory Glow
  const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width * 0.75);
  bgGlow.addColorStop(0, '#FFFFFF');
  bgGlow.addColorStop(0.65, '#FDFBF7');
  bgGlow.addColorStop(1, '#F8F4EC');
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, width, height);

  // Subtle Geometric Grid
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.018)';
  ctx.lineWidth = 1.5;
  const gridSize = 68;
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
  // DUAL GOLD BORDERS & ORANGE CORNER ACCENTS
  // ──────────────────────────────────────────────────
  const mOuter = 50;
  const mInner = 70;

  // Outer Gold Border
  ctx.strokeStyle = '#C49756';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(mOuter, mOuter, width - mOuter * 2, height - mOuter * 2);

  // Inner Subtle Gold Border
  ctx.strokeStyle = 'rgba(196, 151, 86, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mInner, mInner, width - mInner * 2, height - mInner * 2);

  // Corner Accent Brackets in PREPRIA Orange
  ctx.strokeStyle = '#FF6B00';
  ctx.lineWidth = 5.5;
  const cLen = 45;
  const cOff = 44;

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

  const centerX = width / 2;

  // ──────────────────────────────────────────────────
  // ZONE 1: TOP HEADER (BRAND + VERIFIED BADGE + TITLE)
  // ──────────────────────────────────────────────────
  const badgeSize = 54;
  const badgeX = 140;
  const badgeY = 125;
  const radius = 14;

  // Logo Badge (Left)
  ctx.save();
  const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeSize, badgeY + badgeSize);
  badgeGrad.addColorStop(0, '#FF6B00');
  badgeGrad.addColorStop(1, '#E05D00');
  ctx.fillStyle = badgeGrad;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 30px Manrope, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('P', badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 1);
  ctx.restore();

  // Brand Name & Tagline
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = '900 30px Manrope, Inter, sans-serif';
  ctx.fillText('PREPRIA', badgeX + badgeSize + 16, 150);

  ctx.fillStyle = '#FF6B00';
  ctx.font = '800 13px Manrope, Inter, sans-serif';
  ctx.fillText('AI CAREER INTELLIGENCE PLATFORM', badgeX + badgeSize + 17, 174);

  // Verified Status Pill (Right)
  const vPillW = 260;
  const vPillH = 44;
  const vPillX = width - 140 - vPillW;
  const vPillY = 130;

  ctx.fillStyle = '#ECFDF5';
  ctx.strokeStyle = '#A7F3D0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(vPillX, vPillY, vPillW, vPillH, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#059669';
  ctx.font = '800 14px Manrope, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓  VERIFIED CERTIFICATE', vPillX + vPillW / 2, vPillY + 27);

  // Certificate Main Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F172A';
  ctx.font = '700 52px Cinzel, "Playfair Display", Georgia, serif';
  ctx.fillText('CERTIFICATE OF CAREER ACCELERATION & ACHIEVEMENT', centerX, 265);

  // Gold Divider Line
  const divGrad = ctx.createLinearGradient(centerX - 200, 0, centerX + 200, 0);
  divGrad.addColorStop(0, 'rgba(196, 151, 86, 0)');
  divGrad.addColorStop(0.5, '#C49756');
  divGrad.addColorStop(1, 'rgba(196, 151, 86, 0)');
  ctx.fillStyle = divGrad;
  ctx.fillRect(centerX - 200, 282, 400, 2.5);

  // ──────────────────────────────────────────────────
  // ZONE 2: PRESENTATION, RECIPIENT, COURSE & STATEMENT
  // ──────────────────────────────────────────────────
  // Presentation Label
  ctx.fillStyle = '#64748B';
  ctx.font = '700 18px Manrope, sans-serif';
  ctx.fillText('THIS IS OFFICIALLY PRESENTED TO', centerX, 370);

  // Recipient Full Name (Focal Point)
  ctx.fillStyle = '#0A192F';
  ctx.font = '700 72px "Playfair Display", Georgia, serif';
  ctx.fillText(recipientName.toUpperCase(), centerX, 465);

  // "For successfully completing..."
  ctx.fillStyle = '#475569';
  ctx.font = '600 20px Manrope, sans-serif';
  const stmt1 = "For successfully completing all rigorous academic curriculum modules, passing required";
  const stmt2 = "checkpoint assessments, and demonstrating verified practical competencies in";
  ctx.fillText(stmt1, centerX, 535);
  ctx.fillText(stmt2, centerX, 565);

  // Course Title Box
  ctx.fillStyle = '#FF6B00';
  ctx.font = '700 42px Cinzel, "Playfair Display", Georgia, serif';
  const maxWidth = 1700;
  const words = courseTitle.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  let courseY = 645;
  lines.forEach((l) => {
    ctx.fillText(l, centerX, courseY);
    courseY += 48;
  });

  // Curriculum Meta
  ctx.fillStyle = '#64748B';
  ctx.font = '700 20px Manrope, sans-serif';
  ctx.fillText(`${courseCategory} • ${courseDuration} Curriculum`, centerX, courseY + 10);

  // ──────────────────────────────────────────────────
  // ZONE 3: SIGNATURES & PREPRIA SEAL
  // ──────────────────────────────────────────────────
  const sigLeftX = centerX - 540;
  const sigRightX = centerX + 540;
  const sigY = 1240;

  // Left Signatory (Dr. Elena Rostova)
  ctx.fillStyle = '#0F172A';
  ctx.font = '400 58px "Pinyon Script", "Brush Script MT", cursive';
  ctx.fillText('Elena Rostova', sigLeftX, sigY - 26);

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sigLeftX - 180, sigY);
  ctx.lineTo(sigLeftX + 180, sigY);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = '800 19px Manrope, sans-serif';
  ctx.fillText('DR. ELENA ROSTOVA', sigLeftX, sigY + 30);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 15px Manrope, sans-serif';
  ctx.fillText('Lead Academic Director, PREPRIA', sigLeftX, sigY + 54);

  // Center Seal Emblem
  const sealR = 85;
  const sealY = 1210;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, sealY, sealR, 0, Math.PI * 2);
  const sealGrad = ctx.createRadialGradient(centerX - 25, sealY - 25, 10, centerX, sealY, sealR);
  sealGrad.addColorStop(0, '#FFFFFF');
  sealGrad.addColorStop(0.5, '#FFF7F0');
  sealGrad.addColorStop(1, '#FFE8D4');
  ctx.fillStyle = sealGrad;
  ctx.fill();

  ctx.strokeStyle = '#FF6B00';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#FF6B00';
  ctx.font = '700 24px Manrope, sans-serif';
  ctx.fillText('★', centerX, sealY - 32);

  ctx.fillStyle = '#0F172A';
  ctx.font = '900 14px Manrope, sans-serif';
  ctx.fillText('PREPRIA', centerX, sealY - 10);

  ctx.fillStyle = '#FF6B00';
  ctx.font = '800 17px Cinzel, serif';
  ctx.fillText('VERIFIED', centerX, sealY + 12);

  ctx.fillStyle = '#64748B';
  ctx.font = '800 12px Manrope, sans-serif';
  ctx.fillText('ACCREDITED', centerX, sealY + 32);

  // Right Signatory (Marcus Vance)
  ctx.fillStyle = '#0F172A';
  ctx.font = '400 58px "Pinyon Script", "Brush Script MT", cursive';
  ctx.fillText('Marcus Vance', sigRightX, sigY - 26);

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sigRightX - 180, sigY);
  ctx.lineTo(sigRightX + 180, sigY);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = '800 19px Manrope, sans-serif';
  ctx.fillText('MARCUS VANCE', sigRightX, sigY + 30);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 15px Manrope, sans-serif';
  ctx.fillText('Head of Career Intelligence & AI', sigRightX, sigY + 54);

  // ──────────────────────────────────────────────────
  // ZONE 4: FOOTER METADATA
  // ──────────────────────────────────────────────────
  const footerDividerY = 1450;
  ctx.strokeStyle = 'rgba(196, 151, 86, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 800, footerDividerY);
  ctx.lineTo(centerX + 800, footerDividerY);
  ctx.stroke();

  const footLeftX = centerX - 540;
  const footRightX = centerX + 540;
  const footY = 1500;

  // Issue Date (Left)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = '800 13px Manrope, sans-serif';
  ctx.fillText('ISSUE DATE', footLeftX, footY);
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 20px Manrope, sans-serif';
  ctx.fillText(issueDate, footLeftX, footY + 28);

  // Certificate ID (Center)
  ctx.fillStyle = '#64748B';
  ctx.font = '800 13px Manrope, sans-serif';
  ctx.fillText('CERTIFICATE ID', centerX, footY);
  ctx.fillStyle = '#FF6B00';
  ctx.font = '800 20px monospace, sans-serif';
  ctx.fillText(certificateId, centerX, footY + 28);

  // Verification URL (Right)
  ctx.fillStyle = '#64748B';
  ctx.font = '800 13px Manrope, sans-serif';
  ctx.fillText('VERIFICATION', footRightX, footY);
  ctx.fillStyle = '#059669';
  ctx.font = '800 20px Manrope, sans-serif';
  ctx.fillText(verificationUrl, footRightX, footY + 28);

  // 3. Export High-Resolution PNG & Generate Clean PDF Stream
  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  const pdfBytes = createA4LandscapePdfFromJpeg(imgData, width, height);

  // 4. Trigger Direct File Download
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  const sanitizedTitle = courseTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  anchor.download = `PREPRIA_Certificate_${sanitizedTitle}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);

  return true;
}

/**
 * Pure binary PDF Builder for single A4 landscape image
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
