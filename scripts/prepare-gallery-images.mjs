// Normalize AI restorations to source proportions and restore PDF image masks.
import sharp from 'sharp';
import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('images/pdf-manifest.json', 'utf8'));
mkdirSync('images/pdf-generated', { recursive: true });
for (const item of manifest) {
  if (item.xref === 926) continue;
  const generated = `images/pdf-generated/image-${item.xref}.png`;
  if (!existsSync(generated)) copyFileSync(item.restored, generated);
  const scale = Math.max(1920 / Math.max(item.width, item.height), 1080 / Math.min(item.width, item.height));
  const width = Math.round(item.width * scale);
  const height = Math.round(item.height * scale);
  const sourceStats = await sharp(item.original).stats();
  let restored = await sharp(generated).flatten({ background: 'white' })
    .resize(width, height, { fit: 'fill' }).png().toBuffer();
  if (item.alpha && sourceStats.channels[3].min !== sourceStats.channels[3].max) {
    if (sourceStats.channels.slice(0, 3).every(channel => channel.max === 0)) {
      // Black linework in the PDF uses an opacity mask on solid black pixels.
      const mask = await sharp(restored).grayscale().negate().raw().toBuffer();
      restored = await sharp({ create: { width, height, channels: 3, background: 'black' } })
        .joinChannel(mask, { raw: { width, height, channels: 1 } }).png().toBuffer();
    } else {
      // Keep the exact source silhouette for maps and cutout objects.
      const mask = await sharp(item.original).extractChannel(3)
        .resize(width, height, { fit: 'fill' }).raw().toBuffer();
      restored = await sharp(restored).joinChannel(mask, { raw: { width, height, channels: 1 } })
        .png().toBuffer();
    }
  }
  await sharp(restored).png().toFile(item.restored);
  console.log(`image-${item.xref}: ${width} × ${height}`);
}
