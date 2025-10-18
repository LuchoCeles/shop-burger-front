import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { ImageEditorProps } from 'src/intefaces/interfaz';


const ImageEditor: React.FC<ImageEditorProps> = ({ file, onSave, onCancel }) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImgSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const getCroppedImg = async (): Promise<File> => {
    const image = imgRef.current;
    const crop = completedCrop;

    if (!image || !crop) {
      throw new Error('No image or crop data');
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const croppedFile = new File([blob], file?.name || 'cropped-image.jpg', {
            type: 'image/jpeg',
          });
          resolve(croppedFile);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleSave = async () => {
    if (!completedCrop) {
      onSave(file!);
      return;
    }

    setLoading(true);
    try {
      const croppedImage = await getCroppedImg();
      onSave(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Imagen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ajusta el área de recorte arrastrando las esquinas del rectángulo
          </p>
          <div className="flex justify-center bg-muted p-4 rounded-lg max-h-[60vh] overflow-auto">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Imagen a recortar"
                  className="max-w-full"
                />
              </ReactCrop>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditor;
