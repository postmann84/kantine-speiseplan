import { useState, useEffect } from 'react';

const BatchStatus = ({ menuId, initialBatchState, onComplete }) => {
  const [batchState, setBatchState] = useState(initialBatchState || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Funktion zum Abrufen des Batch-Status
  const fetchBatchState = async () => {
    if (!menuId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/get-batch-state?menuId=${menuId}`);
      
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen des Batch-Status');
      }
      
      const data = await response.json();
      
      if (data.success && data.batchState) {
        setBatchState(data.batchState);
        
        // Wenn der Batch-Prozess abgeschlossen ist, rufe onComplete auf
        if (data.batchState.currentBatchIndex >= data.batchState.totalBatches - 1) {
          if (onComplete) onComplete();
        }
      }
    } catch (err) {
      console.error('Fehler beim Abrufen des Batch-Status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rufe den Batch-Status beim ersten Rendern ab
  useEffect(() => {
    fetchBatchState();
    
    // Richte ein Intervall ein, um den Status regelmäßig zu aktualisieren
    const intervalId = setInterval(fetchBatchState, 5000); // Alle 5 Sekunden aktualisieren
    
    // Bereinige das Intervall beim Unmount
    return () => clearInterval(intervalId);
  }, [menuId]);

  // Wenn kein Batch-Status vorhanden ist, zeige nichts an
  if (!batchState) {
    return null;
  }

  // Berechne den Fortschritt
  const progress = Math.round((batchState.currentBatchIndex / batchState.totalBatches) * 100);
  
  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800">E-Mail-Versand läuft</h3>
      
      <div className="mt-2">
        <p className="text-sm text-gray-700">
          Batch {batchState.currentBatchIndex + 1} von {batchState.totalBatches} wird versendet
        </p>
        
        {/* Fortschrittsbalken */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-xs text-gray-500 mt-1">
          Letzte Aktualisierung: {new Date(batchState.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mt-2">
          Fehler: {error}
        </p>
      )}
    </div>
  );
};

export default BatchStatus; 