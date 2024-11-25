document.getElementById("process-button").addEventListener("click", processImage);
document.getElementById("go-back-button").addEventListener("click", () => {
  document.getElementById("upload-page").style.display = "block";
  document.getElementById("result-page").style.display = "none";
});

function processImage() {
  const fileInput = document.getElementById("image-input").files[0];
  const transformType = document.getElementById("transform-type").value;

  if (!fileInput) {
    alert("Please upload an image!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const originalCanvas = document.getElementById("original-canvas");
    const transformedCanvas = document.getElementById("transformed-canvas");
    const originalContext = originalCanvas.getContext("2d");
    const transformedContext = transformedCanvas.getContext("2d");

    const image = new Image();
    image.onload = function () {
      // Resize canvas to fit within a max size while maintaining aspect ratio
      const maxWidth = 400;
      const maxHeight = 400;

      let width = image.width;
      let height = image.height;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = maxWidth;
          height = Math.floor(maxWidth / aspectRatio);
        } else {
          height = maxHeight;
          width = Math.floor(maxHeight * aspectRatio);
        }
      }

      originalCanvas.width = transformedCanvas.width = width;
      originalCanvas.height = transformedCanvas.height = height;

      // Draw the original image
      originalContext.drawImage(image, 0, 0, width, height);

      // Get image data
      const imageData = originalContext.getImageData(0, 0, width, height);
      const data = imageData.data;

      if (transformType === "grayscale") {
        // Grayscale transformation
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
      } else if (transformType === "blur") {
        // Blur transformation
        const blurredData = blurImage(data, width, height);
        for (let i = 0; i < blurredData.length; i++) {
          data[i] = blurredData[i];
        }
      }

      // Update transformed canvas
      transformedContext.putImageData(imageData, 0, 0);

      // Show the result page
      document.getElementById("upload-page").style.display = "none";
      document.getElementById("result-page").style.display = "block";
    };

    image.src = event.target.result;
  };

  reader.readAsDataURL(fileInput);
}

function blurImage(data, width, height) {
  const kernelSize = 5; // Size of the blur kernel
  const kernelRadius = Math.floor(kernelSize / 2);
  const blurredData = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0;

      // Loop through kernel
      for (let ky = -kernelRadius; ky <= kernelRadius; ky++) {
        for (let kx = -kernelRadius; kx <= kernelRadius; kx++) {
          const nx = x + kx;
          const ny = y + ky;

          // Check boundaries
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const index = (ny * width + nx) * 4;
            r += data[index];
            g += data[index + 1];
            b += data[index + 2];
            count++;
          }
        }
      }

      const idx = (y * width + x) * 4;
      blurredData[idx] = r / count;
      blurredData[idx + 1] = g / count;
      blurredData[idx + 2] = b / count;
      blurredData[idx + 3] = data[idx + 3]; // Preserve alpha
    }
  }

  return blurredData;
}
