import React from 'react';

const DayMenu = ({ day, dayIndex, updateMeal, removeMeal, addMeal, handleActionChange, handleClosedChange, handleClosedReasonChange, handleMealBlur, handleMealChange, holidayInfo }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex flex-col gap-4">
        {/* Tag und Schließtag-Checkbox */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold">{day.day}</h2>
          
          <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={holidayInfo?.type === 'holiday' && holidayInfo?.isLegalHolidayInLowerSaxony ? true : day.isClosed || false}
              onChange={(e) => handleClosedChange(dayIndex, e.target.checked)}
              disabled={holidayInfo?.type === 'holiday' && holidayInfo?.isLegalHolidayInLowerSaxony}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span>Als Schließtag markieren</span>
          </label>
        </div>

        {/* Feiertags-Badge wenn vorhanden */}
        {holidayInfo && (
          <div className={`px-4 py-2 rounded-lg self-start ${
            holidayInfo.type === 'holiday' && holidayInfo.isLegalHolidayInLowerSaxony
              ? 'bg-red-100 text-red-800' 
              : `bg-${holidayInfo.color}-100 text-${holidayInfo.color}-800`
          }`}>
            {holidayInfo.name}
          </div>
        )}

        {/* Mahlzeiten oder Geschlossen-Nachricht */}
        {(holidayInfo?.type === 'holiday' && holidayInfo?.isLegalHolidayInLowerSaxony) ? (
          <div className="p-4 bg-gray-50 rounded text-gray-600 text-center">
            An gesetzlichen Feiertagen bleibt die Kantine geschlossen
          </div>
        ) : day.isClosed ? (
          <div className="p-4 bg-gray-50 rounded text-gray-600 text-center">
            <input
              type="text"
              value={day.closedReason || ''}
              onChange={(e) => handleClosedReasonChange(dayIndex, e.target.value)}
              className="w-full p-2 border rounded text-center"
              placeholder="Grund für Schließung eingeben..."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {day.meals.map((meal, mealIndex) => (
              <div key={mealIndex} className="mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={meal.name}
                      onChange={(e) => handleMealChange(dayIndex, mealIndex, 'name', e.target.value)}
                      onBlur={(e) => handleMealBlur(dayIndex, mealIndex, e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Gericht eingeben..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {meal.icon && <span className="text-2xl">{meal.icon}</span>}
                    <input
                      type="number"
                      value={meal.price}
                      onChange={(e) => updateMeal(dayIndex, mealIndex, 'price', e.target.value)}
                      className="w-24 p-2 border rounded"
                      step="0.1"
                      placeholder="Preis"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={meal.isAction}
                        onChange={(e) => handleActionChange(dayIndex, mealIndex, 'isAction', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span>Aktionsessen</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeMeal(dayIndex, mealIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {meal.isAction && (
                  <input
                    type="text"
                    value={meal.actionNote || ''}
                    onChange={(e) => handleActionChange(dayIndex, mealIndex, 'actionNote', e.target.value)}
                    className="mt-2 w-full p-2 border rounded bg-yellow-50"
                    placeholder="Aktionsnotiz eingeben..."
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addMeal(dayIndex)}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              + Gericht hinzufügen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayMenu; 