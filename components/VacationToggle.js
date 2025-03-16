import React from 'react';

const VacationToggle = ({ vacationData, setVacationData }) => {
  return (
    <>
      {/* Urlaubs-Toggle als kleiner Button */}
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={() => setVacationData(prev => ({...prev, isOnVacation: !prev.isOnVacation}))}
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
            vacationData.isOnVacation 
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          type="button"
        >
          <span className="material-icons text-sm">
            {vacationData.isOnVacation ? '🌴' : ''}
          </span>
          Urlaubsmodus {vacationData.isOnVacation ? 'aktiv' : 'inaktiv'}
        </button>
      </div>

      {/* Urlaubs-Einstellungen */}
      {vacationData.isOnVacation && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Von</label>
              <input
                type="date"
                value={vacationData.startDate}
                onChange={(e) => setVacationData({
                  ...vacationData,
                  startDate: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bis</label>
              <input
                type="date"
                value={vacationData.endDate}
                onChange={(e) => setVacationData({
                  ...vacationData,
                  endDate: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nachricht</label>
            <input
              type="text"
              value={vacationData.message}
              onChange={(e) => setVacationData({
                ...vacationData,
                message: e.target.value
              })}
              placeholder="z.B.: Wir machen Betriebsferien 🌴"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VacationToggle; 