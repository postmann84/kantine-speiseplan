import React from 'react';

const ContactInfo = ({ contactInfo, setContactInfo }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Kontaktinformationen</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Telefon
          </label>
          <input
            type="text"
            name="phone"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={contactInfo.phone}
            onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Postfremde
          </label>
          <input
            type="text"
            name="postcode"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={contactInfo.postcode}
            onChange={(e) => setContactInfo(prev => ({ ...prev, postcode: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfo; 