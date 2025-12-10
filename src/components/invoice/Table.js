import React, { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaAngleDown } from "react-icons/fa";
function InvoiceTable({ onTableDataChange ,onForm1DataChange}) {
  // Language system
  const language = localStorage.getItem('selectedLanguage') || 'en';
  const translations = {
    en: {
      itemTable: 'Item Table',
      itemDetails: 'Item Details',
      quantity: 'Quantity',
      rate: 'Rate',
      amount: 'Amount',
      addRow: '+ Add New Row',
      customerNotes: 'Customer Notes',
      notesPlaceholder: 'Thanks for your business.',
      notesHelp: 'Will be displayed on the invoice',
      subTotal: 'Sub Total',
      discount: 'Discount',
      tds: 'TDS',
      tcs: 'TCS',
      selectTax: 'Select a Tax',
      total: 'Total ( ₹ )',
      showSummary: 'show Total summary',
      addTerms: 'Add Terms and conditions',
      remove: 'Remove',
    },
    hi: {
      itemTable: 'आइटम तालिका',
      itemDetails: 'आइटम विवरण',
      quantity: 'मात्रा',
      rate: 'दर',
      amount: 'राशि',
      addRow: '+ नई पंक्ति जोड़ें',
      customerNotes: 'ग्राहक नोट्स',
      notesPlaceholder: 'आपके व्यवसाय के लिए धन्यवाद।',
      notesHelp: 'यह चालान पर प्रदर्शित होगा',
      subTotal: 'उप-योग',
      discount: 'छूट',
      tds: 'टीडीएस',
      tcs: 'टीसीएस',
      selectTax: 'कर चुनें',
      total: 'कुल ( ₹ )',
      showSummary: 'कुल सारांश दिखाएं',
      addTerms: 'नियम और शर्तें जोड़ें',
      remove: 'हटाएं',
    },
  };
  const t = translations[language];
  const [rows, setRows] = useState([{ id: 1, itemDetails: '', quantity: 1, rate: 0, amount: 0 }]);
  const [products, setProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null); // Stores row ID for dropdown visibility
  const dropdownRef = useRef(null);
  const [TempTotal,setTempTotal]=useState(0);

    const [notes, setNotes] = useState("Thanks for your business.");
    const [total, setTotal] = useState(0);
    const [isSubtotalOpen, setIsSubtotalOpen] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [taxType, setTaxType] = useState("TDS");
    const [taxRate, setTaxRate] = useState(0); 
    const [taxRatePrice, setTaxRatePrice] = useState(0); 
    const [subTotal, setSubTotal] = useState(0); // Example default for debugging
    const toggleSubtotal = () => setIsSubtotalOpen(!isSubtotalOpen);

    useEffect(()=>{
      onForm1DataChange({ notes,discount ,taxRate, total: subTotal,subTotal:TempTotal ,TaxPrice:taxRatePrice,DiscPrice:discountPrice })
    },[notes, subTotal, discount, taxRate,taxRatePrice,TempTotal,discountPrice, onForm1DataChange])

    useEffect(() => {
      const fetchData = async () => {
        try {
          const orgData = await AsyncStorage.getItem('selectedOrganization');
          const parsedOrgData = orgData ? JSON.parse(orgData) : null;
    
          if (!parsedOrgData || !parsedOrgData.id) {
            console.error("No valid organization selected!");
            return;
          }
    
          const querySnapshot = await getDocs(collection(db, `organizations/${parsedOrgData.id}/products`));
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProducts(data);
    
          // Populate initial rows with the first product as an example
          setRows((prevRows) =>
            prevRows.map((row, index) => {
              const firstProduct = data[0];
              if (firstProduct) {
                return {
                  ...row,
                  itemDetails: firstProduct.name,
                  rate: firstProduct.price,
                  amount: firstProduct.price * row.quantity,
                };
              }
              return row;
            })
          );
        } catch (error) {
          console.error("Error fetching items: ", error);
        }
      };
    
      fetchData();
    }, []);
    

    useEffect(() => {
      const subAmount = rows.reduce((acc, row) => acc + (row.amount || 0), 0);
      setTempTotal(parseFloat(subAmount.toFixed(2)))
      setSubTotal(parseFloat(subAmount.toFixed(2)));
    }, [rows]);
    
    useEffect(()=>{
      const DiscPrice=((TempTotal * discount) / 100).toFixed(2);
      setDiscountPrice(parseFloat(DiscPrice));
      const TaxPrice=(((subTotal - (subTotal * discount) / 100) * taxRate) / 100).toFixed(2);
      setTaxRatePrice(parseFloat(TaxPrice));
    },[discount,taxRate])
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setShowDropdown(null); // Reset dropdown state after products are fetched
    }
  }, [products]);
  

  const addRow = () => {
    setRows([...rows, { id: rows.length + 1, itemDetails: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleInputChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === 'quantity' || field === 'rate' ? parseFloat(value) || 0 : value,
              amount: field === 'quantity' || field === 'rate'
                ? field === 'quantity'
                  ? parseFloat(value || 0) * row.rate
                  : row.quantity * parseFloat(value || 0)
                : row.amount,
            }
          : row
      )
    );
  };

  const selectProduct = (rowId, product) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId
          ? { ...row, itemDetails: product.name, description:product.description , rate: product.price, amount: product.price * row.quantity }
          : row
      )
    );
    setShowDropdown(null); // Close dropdown after selection
  };

  // Notify parent component of row data changes
  useEffect(() => {
    onTableDataChange(rows);
  }, [rows, onTableDataChange]);

  return (
    <div className="p-4  rounded-lg w-full mx-auto">
      <div className="border-b pb-2">
        <h2 className="text-lg font-semibold ml-3">{t.itemTable}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full mt-2 text-sm text-left text-gray-900">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 pl-3">{t.itemDetails}</th>
              <th className="p-2 text-center">{t.quantity}</th>
              <th className="p-2 text-center">{t.rate}</th>
              <th className="p-2 text-center">{t.amount}</th>
              <th className="p-2 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-2 relative text-gray-500">
                  <input
                    type="text"
                    value={row.itemDetails}
                    onChange={(e) => handleInputChange(row.id, 'itemDetails', e.target.value)}
                    onClick={() => setShowDropdown(row.id)}   
                    placeholder={t.itemDetails}
                    className="w-full p-2 border rounded focus:outline-none"
                  />
                  {showDropdown === row.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto z-10"
                    >
                      {products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => selectProduct(row.id, product)}
                          className="p-2 hover:bg-blue-200 cursor-pointer"
                        >
                          {product.name} - ${product.price}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => handleInputChange(row.id, 'quantity', e.target.value)}
                    className="w-16 text-center p-2 border rounded focus:outline-none"
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    value={row.rate}
                    onChange={(e) => handleInputChange(row.id, 'rate', e.target.value)}
                    className="w-20 text-center p-2 border rounded focus:outline-none"
                  />
                </td>
                <td className="p-2 text-center font-semibold text-gray-900">
                  {row.amount.toFixed(2)}
                </td>
                <td className="p-2 text-center text-red-500 cursor-pointer" onClick={() => removeRow(row.id)}>
                  X
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row gap-2 mt-4 ml-3">
        <button
          onClick={addRow}
          className="flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded w-full md:w-auto"
        >
          {t.addRow}
        </button>
      </div>



      <div className="p-4 w-full mx-auto pl-3">
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
        {isSubtotalOpen && (
            <div className="my-2 space-y-2 mb-4 transition duration-300">
              <div className="flex justify-between">
                <span className="font-semibold">{t.subTotal}</span>
                <span className="text-gray-900 font-semibold">{rows.reduce((acc, row) => acc + row.amount, 0).toFixed(2)}</span>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <label className="font-semibold">{t.discount}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded"
                    value={discount}
                    onChange={(e) => {
                      const discountPercentage = parseFloat(e.target.value) || 0; // Parse input as a percentage
                      setDiscount(discountPercentage); // Update the discount percentage state
                      setSubTotal((prevTotal) => prevTotal - (prevTotal * discountPercentage) / 100); // Calculate and update subtotal
                    }}
                    
                  />
                  <span>%</span>
                </div>
                <span className="text-gray-900 font-semibold">
                  -{((TempTotal * discount) / 100).toFixed(2)}
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
                  onChange={(e) => {
                    const selectedTaxRate = parseFloat(e.target.value) || 0;
                    setTaxRate(selectedTaxRate);
                    setSubTotal((prevTotal) => {
                      const discountedTotal = prevTotal - (prevTotal * discount) / 100;
                      return discountedTotal + (discountedTotal * selectedTaxRate) / 100; // Add tax to the discounted total
                    });
                  }}
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
          <div
            className="flex items-center justify-between ml-auto mb-4 border-b pb-2 mb-2" >
            <span className="font-semibold text-gray-500 text-lg">{t.total}</span>
            <span className="text-gray-900 font-semibold">{subTotal.toFixed(2)}</span>
          </div>
          <span className='text-sm text-blue-500 cursor-pointer' onClick={toggleSubtotal}>{t.showSummary} <FaAngleDown className='inline' /></span>
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
    </div>
  );
}

export default InvoiceTable;
