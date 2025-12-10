import React, { useEffect, useState } from "react";

const InvoiceForm1 = ({ onForm1DataChange }) => {
  // Language system
  const language = localStorage.getItem('selectedLanguage') || 'en';
  const translations = {
    en: {
      customerNotes: 'Customer Notes',
      notesPlaceholder: 'Thanks for your business.',
      notesHelp: 'Will be displayed on the invoice',
      total: 'Total',
      subTotal: 'Sub Total',
      discount: 'Discount',
      tax: 'Tax',
      tds: 'TDS',
      tcs: 'TCS',
      selectTax: 'Select a Tax',
      addTerms: 'Add Terms and conditions',
    },
    hi: {
      customerNotes: 'ग्राहक नोट्स',
      notesPlaceholder: 'आपके व्यवसाय के लिए धन्यवाद।',
      notesHelp: 'यह चालान पर प्रदर्शित होगा',
      total: 'कुल',
      subTotal: 'उप-योग',
      discount: 'छूट',
      tax: 'कर',
      tds: 'टीडीएस',
      tcs: 'टीसीएस',
      selectTax: 'कर चुनें',
      addTerms: 'नियम और शर्तें जोड़ें',
    },
  };
  const t = translations[language];

  const [notes, setNotes] = useState("Thanks for your business.");
  const [total, setTotal] = useState(0);
  const [isSubtotalOpen, setIsSubtotalOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [taxType, setTaxType] = useState("TDS");
  const [taxRate, setTaxRate] = useState(0); // Change to taxRate
  const [subTotal, setSubTotal] = useState(0); // Example default for debugging

  // Function to toggle the visibility of subtotal section
  const toggleSubtotal = () => setIsSubtotalOpen(!isSubtotalOpen);

  // Update total based on subtotal, discount, and tax whenever values change
  useEffect(() => {
    // Calculate discount amount
    const discountAmount = (subTotal * discount) / 100;

    // Calculate tax based on rate
    const calculatedTax = (subTotal - discountAmount) * (taxRate / 100);

    // Calculate total
    const calculatedTotal = subTotal - discountAmount + calculatedTax;

    setTotal(calculatedTotal);

    // Pass data to the parent component
    onForm1DataChange({ notes, total: calculatedTotal });
  }, [notes, subTotal, discount, taxRate, onForm1DataChange]);

  return (
    <div className="p-4 w-full mx-auto bg-white shadow rounded-md">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Section - Customer Notes */}
        <div className="md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.customerNotes}
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder={t.notesPlaceholder}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">{t.notesHelp}</p>
        </div>

        {/* Right Section - Total and Subtotal */}
        <div className="md:w-1/2">
          <div
            className="flex items-center justify-between cursor-pointer ml-auto mb-4"
            onClick={toggleSubtotal}
          >
            <span className="font-semibold text-lg">{t.total}</span>
            <span className="text-gray-900 font-semibold">{total.toFixed(2)}</span>
          </div>

          {/* Collapsible Subtotal Section */}
          {isSubtotalOpen && (
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">{t.subTotal}</span>
                <span className="text-gray-900 font-semibold">{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <label className="font-semibold">{t.discount}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  />
                  <span>%</span>
                </div>
                <span className="text-gray-900 font-semibold">
                  -{((subTotal * discount) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="taxType"
                      checked={taxType === "TDS"}
                      onChange={() => setTaxType("TDS")}
                    />{" "}
                    {t.tds}
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="taxType"
                      checked={taxType === "TCS"}
                      onChange={() => setTaxType("TCS")}
                    />{" "}
                    {t.tcs}
                  </label>
                </div>
                <select
                  className="px-2 py-1 border border-gray-300 rounded w-full md:w-auto"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                >
                  <option value="0">{t.selectTax}</option>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                </select>
                <span className="text-gray-900 font-semibold">
                  +{(((subTotal - (subTotal * discount) / 100) * taxRate) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Terms and Conditions Button */}
      <button className="mt-4 flex items-center text-blue-600 text-sm font-medium focus:outline-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {t.addTerms}
      </button>
    </div>
  );
};

export default InvoiceForm1;
