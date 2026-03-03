import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { Button, ButtonTitle } from '@/components/ui/button';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteInternal = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const getCroppedImg = async () => {
    try {
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx || !croppedAreaPixels) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
          onCropComplete(file);
        }
      }, 'image/jpeg');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative h-80 w-full max-w-md overflow-hidden rounded-lg bg-common-cardBackground sm:h-96">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteInternal}
        />
      </div>
      <div className="mt-4 flex w-full max-w-md gap-4">
        <Button onClick={onCancel} variant="outline" type="button" className="flex-1 border-common-contrast bg-common-cardBackground text-text-primary hover:bg-common-minimal transition-colors">
          <ButtonTitle>Cancel</ButtonTitle>
        </Button>
        <Button onClick={getCroppedImg} variant="blue" type="button" className="flex-1">
          <ButtonTitle>Apply Crop</ButtonTitle>
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper;