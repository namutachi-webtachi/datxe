import fs from 'fs';

// 1. Tao ma phien ban ngau nhien bang thoi gian thuc (VD: v1728669912345)
const timestamp = Date.now();
const newVersion = 'v' + timestamp;

// 2. Tu dong ghi de vao file version.json
const versionData = { version: newVersion };
fs.writeFileSync('./version.json', JSON.stringify(versionData, null, 2), 'utf8');

// 3. Tu dong tim va thay the ten Cache trong file sw.js
try {
  let swCode = fs.readFileSync('./sw.js', 'utf8');
  // Tim dong const CACHE_NAME = '...' va thay the bang version moi
  swCode = swCode.replace(/const CACHE_NAME = '.*?';/, `const CACHE_NAME = 'thanh-nguyen-vf5-${newVersion}';`);
  fs.writeFileSync('./sw.js', swCode, 'utf8');
} catch (err) {
  console.log('Khong tim thay file sw.js hoac co loi xay ra.');
}

console.log(`[Auto-Deploy] DA CAP NHAT HE THONG LEN PHIEN BAN: ${newVersion}`);
