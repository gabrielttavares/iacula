import fs from 'fs';
import os from 'os';
import path from 'path';
import { FileAssetService } from '../../../src/infrastructure/storage/FileAssetService';

describe('FileAssetService - Seasonal Images', () => {
  let tempRoot: string;
  let service: FileAssetService;

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'iacula-assets-'));
    fs.mkdirSync(path.join(tempRoot, 'assets'), { recursive: true });
    service = new FileAssetService(tempRoot, false);
  });

  afterEach(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('should load images from flat seasonal directory when available', async () => {
    const seasonalDir = path.join(tempRoot, 'assets', 'images', 'lent');
    fs.mkdirSync(seasonalDir, { recursive: true });
    fs.writeFileSync(path.join(seasonalDir, 'seasonal.jpg'), 'x');

    const images = await service.listDayImages(3, 'lent');

    expect(images).toEqual([`file://${path.join(seasonalDir, 'seasonal.jpg')}`]);
  });

  it('should alternate seasonal images in getImagePath for flat directory', async () => {
    const seasonalDir = path.join(tempRoot, 'assets', 'images', 'advent');
    fs.mkdirSync(seasonalDir, { recursive: true });
    fs.writeFileSync(path.join(seasonalDir, 'a.jpg'), 'x');
    fs.writeFileSync(path.join(seasonalDir, 'b.jpg'), 'x');

    const firstImage = await service.getImagePath(1, 'advent');
    const secondImage = await service.getImagePath(1, 'advent');
    const thirdImage = await service.getImagePath(1, 'advent');

    expect(firstImage).toBe(`file://${path.join(seasonalDir, 'a.jpg')}`);
    expect(secondImage).toBe(`file://${path.join(seasonalDir, 'b.jpg')}`);
    expect(thirdImage).toBe(`file://${path.join(seasonalDir, 'a.jpg')}`);
  });

  it('should fallback to legacy seasonal day directory when flat seasonal directory is missing', async () => {
    const legacySeasonalDir = path.join(tempRoot, 'assets', 'images', 'easter', '2');
    fs.mkdirSync(legacySeasonalDir, { recursive: true });
    fs.writeFileSync(path.join(legacySeasonalDir, 'legacy.jpg'), 'x');

    const images = await service.listDayImages(2, 'easter');

    expect(images).toEqual([`file://${path.join(legacySeasonalDir, 'legacy.jpg')}`]);
  });

  it('should fallback to ordinary directory when seasonal directory is missing', async () => {
    const ordinaryDir = path.join(tempRoot, 'assets', 'images', 'ordinary', '4');
    fs.mkdirSync(ordinaryDir, { recursive: true });
    fs.writeFileSync(path.join(ordinaryDir, 'ordinary.png'), 'x');

    const images = await service.listDayImages(4, 'advent');

    expect(images).toEqual([`file://${path.join(ordinaryDir, 'ordinary.png')}`]);
  });

  it('should fallback to ordinary directory when seasonal flat and legacy directories have no image files', async () => {
    const seasonalFlatDir = path.join(tempRoot, 'assets', 'images', 'easter');
    const seasonalLegacyDir = path.join(tempRoot, 'assets', 'images', 'easter', '2');
    const ordinaryDir = path.join(tempRoot, 'assets', 'images', 'ordinary', '2');
    fs.mkdirSync(seasonalFlatDir, { recursive: true });
    fs.mkdirSync(seasonalLegacyDir, { recursive: true });
    fs.mkdirSync(ordinaryDir, { recursive: true });
    fs.writeFileSync(path.join(seasonalFlatDir, 'readme.txt'), 'no-image');
    fs.writeFileSync(path.join(seasonalLegacyDir, 'notes.txt'), 'no-image');
    fs.writeFileSync(path.join(ordinaryDir, 'ordinary.jpeg'), 'x');

    const images = await service.listDayImages(2, 'easter');

    expect(images).toEqual([`file://${path.join(ordinaryDir, 'ordinary.jpeg')}`]);
  });

  it('should return empty list when neither seasonal nor ordinary has images', async () => {
    const images = await service.listDayImages(6, 'christmas');
    expect(images).toEqual([]);
  });

  it('should return first image path from ordinary fallback when seasonal has no images', async () => {
    const ordinaryDir = path.join(tempRoot, 'assets', 'images', 'ordinary', '1');
    fs.mkdirSync(ordinaryDir, { recursive: true });
    fs.writeFileSync(path.join(ordinaryDir, 'ordinary.jpg'), 'x');

    const firstImage = await service.getImagePath(1, 'advent');

    expect(firstImage).toBe(`file://${path.join(ordinaryDir, 'ordinary.jpg')}`);
  });

  it('should return null when no image exists in seasonal flat, seasonal legacy, or ordinary', async () => {
    const firstImage = await service.getImagePath(1, 'christmas');
    expect(firstImage).toBeNull();
  });

  it('should keep ordinary behavior by dayOfWeek', async () => {
    const day1Dir = path.join(tempRoot, 'assets', 'images', 'ordinary', '1');
    const day2Dir = path.join(tempRoot, 'assets', 'images', 'ordinary', '2');
    fs.mkdirSync(day1Dir, { recursive: true });
    fs.mkdirSync(day2Dir, { recursive: true });
    fs.writeFileSync(path.join(day1Dir, 'day1.jpg'), 'x');
    fs.writeFileSync(path.join(day2Dir, 'day2.jpg'), 'x');

    const day1Image = await service.getImagePath(1, 'ordinary');
    const day2Image = await service.getImagePath(2, 'ordinary');

    expect(day1Image).toBe(`file://${path.join(day1Dir, 'day1.jpg')}`);
    expect(day2Image).toBe(`file://${path.join(day2Dir, 'day2.jpg')}`);
  });
});
