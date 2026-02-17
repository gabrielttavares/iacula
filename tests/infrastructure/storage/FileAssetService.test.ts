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

  it('should load images from seasonal directory when available', async () => {
    const seasonalDir = path.join(tempRoot, 'assets', 'images', 'lent', '3');
    fs.mkdirSync(seasonalDir, { recursive: true });
    fs.writeFileSync(path.join(seasonalDir, 'seasonal.jpg'), 'x');

    const images = await service.listDayImages(3, 'lent');

    expect(images).toEqual([`file://${path.join(seasonalDir, 'seasonal.jpg')}`]);
  });

  it('should fallback to ordinary directory when seasonal directory is missing', async () => {
    const ordinaryDir = path.join(tempRoot, 'assets', 'images', 'ordinary', '4');
    fs.mkdirSync(ordinaryDir, { recursive: true });
    fs.writeFileSync(path.join(ordinaryDir, 'ordinary.png'), 'x');

    const images = await service.listDayImages(4, 'advent');

    expect(images).toEqual([`file://${path.join(ordinaryDir, 'ordinary.png')}`]);
  });

  it('should fallback to ordinary directory when seasonal directory has no image files', async () => {
    const seasonalDir = path.join(tempRoot, 'assets', 'images', 'easter', '2');
    const ordinaryDir = path.join(tempRoot, 'assets', 'images', 'ordinary', '2');
    fs.mkdirSync(seasonalDir, { recursive: true });
    fs.mkdirSync(ordinaryDir, { recursive: true });
    fs.writeFileSync(path.join(seasonalDir, 'readme.txt'), 'no-image');
    fs.writeFileSync(path.join(ordinaryDir, 'ordinary.jpeg'), 'x');

    const images = await service.listDayImages(2, 'easter');

    expect(images).toEqual([`file://${path.join(ordinaryDir, 'ordinary.jpeg')}`]);
  });

  it('should return empty list when neither seasonal nor ordinary has images', async () => {
    const images = await service.listDayImages(6, 'christmas');
    expect(images).toEqual([]);
  });

  it('should return first image path using seasonal lookup in getImagePath', async () => {
    const seasonalDir = path.join(tempRoot, 'assets', 'images', 'advent', '1');
    fs.mkdirSync(seasonalDir, { recursive: true });
    fs.writeFileSync(path.join(seasonalDir, 'a.jpg'), 'x');
    fs.writeFileSync(path.join(seasonalDir, 'b.jpg'), 'x');

    const firstImage = await service.getImagePath(1, 'advent');

    expect(firstImage).toBe(`file://${path.join(seasonalDir, 'a.jpg')}`);
  });
});

