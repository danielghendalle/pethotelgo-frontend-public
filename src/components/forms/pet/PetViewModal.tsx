import { X, Eye, Calendar, Weight, Heart, Syringe, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PetViewModalProps {
  pet: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PetViewModal({ pet, isOpen, onClose }: PetViewModalProps) {
  if (!isOpen || !pet) return null;

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'pequeno': return 'Pequeno';
      case 'medio': return 'Médio';
      case 'grande': return 'Grande';
      default: return size;
    }
  };

  const getSociabilityLabel = (sociability: string) => {
    switch (sociability) {
      case 'baixa': return 'Baixa';
      case 'media': return 'Média';
      case 'alta': return 'Alta';
      default: return sociability;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{pet.name}</h2>
                <p className="text-sm text-gray-500">Detalhes do Pet</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informações Básicas
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="text-gray-900">{pet.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Raça</label>
                  <p className="text-gray-900">{pet.breed}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Porte</label>
                  <Badge variant="secondary">
                    {getSizeLabel(pet.size)}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Sociabilidade</label>
                  <Badge 
                    variant={pet.sociability === 'alta' ? 'default' : pet.sociability === 'baixa' ? 'destructive' : 'secondary'}
                  >
                    {getSociabilityLabel(pet.sociability)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Cuidados e Alimentação */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Cuidados e Alimentação
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Horários de Alimentação
                  </label>
                  <p className="text-gray-900">{pet.feedingSchedule}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Weight className="w-4 h-4" />
                    Quantidade
                  </label>
                  <p className="text-gray-900">{pet.feedingAmount}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Alergias</label>
                  <p className="text-gray-900">{pet.allergies || 'Nenhuma informada'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Cuidados Especiais</label>
                  <p className="text-gray-900">{pet.specialCare || 'Nenhum informado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cartão de Vacina */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Syringe className="w-5 h-5" />
              Cartão de Vacina
            </h3>
            {pet.vaccineCard ? (
              <div className="space-y-3">
                <p className="text-sm text-green-600 flex items-center gap-1">
                  ✓ Cartão de vacina anexado
                </p>
                
                {/* Preview para imagens */}
                {pet.vaccineCard && typeof pet.vaccineCard === 'string' && pet.vaccineCard.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <img 
                      src={pet.vaccineCard} 
                      alt="Cartão de Vacina" 
                      className="w-full max-h-64 object-contain"
                    />
                  </div>
                )}
                
                {/* Preview para PDF */}
                {pet.vaccineCard && typeof pet.vaccineCard === 'string' && pet.vaccineCard.match(/\.pdf$/i) && (
                  <div className="border rounded-lg p-4 bg-white flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Documento PDF</p>
                      <p className="text-xs text-gray-500">Cartão de vacina em formato PDF</p>
                    </div>
                  </div>
                )}
                
                {/* Botão para visualizar/download */}
                <div className="flex gap-2">
                  {typeof pet.vaccineCard === 'string' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(pet.vaccineCard, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar Completo
                    </Button>
                  )}
                  {typeof pet.vaccineCard === 'string' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = pet.vaccineCard;
                        link.download = 'cartao-vacina.pdf';
                        link.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Syringe className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Nenhum cartão de vacina anexado</p>
              </div>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {pet.needsSeparateSpace && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Necessita espaço separado
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              Taxa diária: R$ {pet.baseDailyRate?.toFixed(2) || '50.00'}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
