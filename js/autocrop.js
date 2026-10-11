export function autoCropImage(imgElement) {
  return new Promise((resolve) => {
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';

    tempImg.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = tempImg.naturalWidth;
        canvas.height = tempImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(tempImg, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        let hasContent = false;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const alphaIndex = (y * canvas.width + x) * 4 + 3;
            if (data[alphaIndex] > 20) {
              hasContent = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (hasContent && maxX >= minX && maxY >= minY) {
          const cropW = maxX - minX + 1;
          const cropH = maxY - minY + 1;
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cropW;
          cropCanvas.height = cropH;
          const cropCtx = cropCanvas.getContext('2d');
          cropCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

          imgElement.src = cropCanvas.toDataURL('image/png');
        }
      } catch (err) {
        // Fallback an toan neu bi chan boi trinh duyet
      }
      resolve();
    };

    tempImg.onerror = () => resolve();
    tempImg.src = imgElement.src;
  });
}
