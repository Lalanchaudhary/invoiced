import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs, query, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
function ExpanseForm() {
  const navigate=useNavigate();
  // Language system
  const language = localStorage.getItem('selectedLanguage') || 'en';
  const translations = {
    en: {
      newExpense: 'New Expense',
      fillDetails: 'Fill in the details below to add a new expense.',
      name: 'Name*',
      namePlaceholder: 'Name',
      invoiceDate: 'Invoice Date*',
      invoiceNumber: 'Invoice#*',
      category: 'Category*',
      amount: 'Amount*',
      notes: 'Notes',
      notesPlaceholder: 'Max. 500 characters',
      save: 'Save',
      cancel: 'Cancel',
      labour: 'Labour',
      material: 'Material',
      subcontractor: 'Subcontractor',
      advertising: 'Advertising and marketing',
    },
    hi: {
      newExpense: 'नया खर्च',
      fillDetails: 'नया खर्च जोड़ने के लिए नीचे विवरण भरें।',
      name: 'नाम*',
      namePlaceholder: 'नाम',
      invoiceDate: 'चालान तिथि*',
      invoiceNumber: 'चालान संख्या*',
      category: 'श्रेणी*',
      amount: 'राशि*',
      notes: 'नोट्स',
      notesPlaceholder: 'अधिकतम 500 अक्षर',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      labour: 'मजदूरी',
      material: 'सामग्री',
      subcontractor: 'सब-कॉन्ट्रैक्टर',
      advertising: 'विज्ञापन और विपणन',
    },
  };
  const t = translations[language];
  // const [customerOptions, setCustomerOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState('Labour'); // Set a default value matching one of the options
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expensesDate, setExpensesDate] = useState('');
  const [expensesNumber, setexpensesNumber] = useState('');
  const [amount,setAmount]=useState(null);
  const [notes,setNotes]=useState('');
  const handleSave = async () => {
    try {
      const orgData = await AsyncStorage.getItem('selectedOrganization');
      const parsedOrgData = orgData ? JSON.parse(orgData) : null;
  
      if (!parsedOrgData || !parsedOrgData.id) {
        alert("No valid organization selected!");
        return;
      }

      const ExpensesData={
        selectedCustomer:selectedCustomer,
        expensesDate:expensesDate,
        categoryOptions:categoryOptions,
        expensesNumber:expensesNumber,
        amount:amount,
        notes:notes
      }
      await addDoc(
        collection(db, `organizations/${parsedOrgData.id}/expenses`),
        ExpensesData
      );
      alert("ho gaya")
      navigate("/dashboard/expenses")

    } catch (error) {
      console.error("Error saving invoice: ", error);
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="relative bg-white shadow-2xl rounded-2xl p-10 w-full max-w-xl border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t.newExpense}</h2>
        <p className="text-gray-500 mb-6 text-sm">{t.fillDetails}</p>
        <div className="border-b border-gray-200 mb-6"></div>
        <div className="mb-4">
          <label className="block text-red-500 font-semibold text-sm mb-1">{t.name}</label>
          <input placeholder={t.namePlaceholder} onChange={(e)=>{setSelectedCustomer(e.target.value)}} className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-red-500 font-semibold text-sm mb-1">{t.invoiceDate}</label>
            <input
              type="date"
              value={expensesDate}
              onChange={(e) => setExpensesDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-sm mb-1">{t.invoiceNumber}</label>
            <input
              type="text"
              value={expensesNumber}
              onChange={(e) => setexpensesNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-semibold text-sm mb-2">{t.category}</label>
            <select
              value={categoryOptions}
              onChange={(e) => setCategoryOptions(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
            >
              <option>{t.labour}</option>
              <option>{t.material}</option>
              <option>{t.subcontractor}</option>
              <option>{t.advertising}</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-sm text-red-500 mb-2">{t.amount}</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
              value={amount}
              onChange={(e)=>{setAmount(e.target.value)}}
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block font-semibold text-sm mb-2">{t.notes}</label>
          <textarea
            placeholder={t.notesPlaceholder}
            className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none min-h-[80px]"
            name="shippingStreet1"
            value={notes}
            onChange={(e)=>{setNotes(e.target.value)}}
          />
        </div>
        <div className="flex gap-4 justify-end mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-8 py-2 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200" style={{ fontSize: 15 }} onClick={handleSave}>{t.save}</button>
          <button className="text-gray-700 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-sm font-semibold px-8 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200" style={{ fontSize: 15 }} onClick={()=>navigate('/dashboard/expenses')}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

export default ExpanseForm;
