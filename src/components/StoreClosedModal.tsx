import React from 'react';
import { Clock, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';

interface StoreClosedModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextOpenTime: string | null;
  currentDay: string;
  showCloseButton?: boolean;
}

export const StoreClosedModal: React.FC<StoreClosedModalProps> = ({
  isOpen,
  onClose,
  nextOpenTime,
  currentDay,
  showCloseButton = true
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-muted p-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Tienda Cerrada
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            <p className="text-base mb-2">
              Lo sentimos, actualmente estamos cerrados.
            </p>
            {nextOpenTime && (
              <p className="text-lg font-semibold text-foreground mt-4">
                Volvemos: {nextOpenTime}
              </p>
            )}
            {!nextOpenTime && (
              <p className="text-base text-muted-foreground mt-4">
                Consulta nuestros horarios de atención.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {showCloseButton && (
          <div className="flex justify-center mt-4">
            <Button onClick={onClose} variant="default" className="w-full">
              Entendido
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground mt-2">
          Puedes seguir navegando el menú, pero no podrás realizar pedidos hasta que abramos.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoreClosedModal;