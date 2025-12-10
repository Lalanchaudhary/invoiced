import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import InvoiceForm from './InvoiceForm';
import InvoiceTable from './Table';
import InvoiceForm1 from './InvoiceForm1';
import { useNavigate } from 'react-router-dom';

const Invoice = () => {
  const navigate=useNavigate();
  const [invoiceFormData, setInvoiceFormData] = useState({});
  const [invoiceTableData, setInvoiceTableData] = useState([]);
  const [invoiceForm1Data, setInvoiceForm1Data] = useState({});

  // Language system
  const language = localStorage.getItem('selectedLanguage') || 'en';
  const translations = {
    en: {
      saveDraft: 'Save as Draft',
      saveSend: 'Save and Send',
      cancel: 'Cancel',
    },
    hi: {
      saveDraft: 'ड्राफ्ट के रूप में सहेजें',
      saveSend: 'सहेजें और भेजें',
      cancel: 'रद्द करें',
    },
  };
  const t = translations[language];

  const handleDraft=async()=>{
    try {
      const orgData = await AsyncStorage.getItem('selectedOrganization');
      const parsedOrgData = orgData ? JSON.parse(orgData) : null;
  
      if (!parsedOrgData || !parsedOrgData.id) {
        alert("No valid organization selected!");
        return;
      }
  
      const invoiceData = {
        ...invoiceFormData, // Includes full customer data
        items: invoiceTableData, // Table data (items)
        notes: invoiceForm1Data.notes, // Notes
        total: invoiceForm1Data.total, // Total amount
        discount:invoiceForm1Data.discount,
        taxRate:invoiceForm1Data.taxRate,
        TaxPrice:invoiceForm1Data.TaxPrice,
        DiscPrice:invoiceForm1Data.DiscPrice,
        subTotal:invoiceForm1Data.subTotal,
        createdAt: new Date(),
      };
      console.log('====================================');
      console.log(invoiceFormData.invoiceNumber);
      console.log('====================================');
      await addDoc(
        collection(db, `organizations/${parsedOrgData.id}/invoices`),
        invoiceData
      );

      navigate('/dashboard/invoice', { state: { invoiceNumber: invoiceFormData.invoiceNumber } });

    } catch (error) {
      console.error("Error saving invoice: ", error);
    }
  }
  
  const handleSave = async () => {
    try {
      const orgData = await AsyncStorage.getItem('selectedOrganization');
      const parsedOrgData = orgData ? JSON.parse(orgData) : null;
  
      if (!parsedOrgData || !parsedOrgData.id) {
        alert("No valid organization selected!");
        return;
      }
  
      const invoiceData = {
        ...invoiceFormData, // Includes full customer data
        items: invoiceTableData, // Table data (items)
        notes: invoiceForm1Data.notes, // Notes
        total: invoiceForm1Data.total, // Total amount
        discount:invoiceForm1Data.discount,
        taxRate:invoiceForm1Data.taxRate,
        TaxPrice:invoiceForm1Data.TaxPrice,
        DiscPrice:invoiceForm1Data.DiscPrice,
        subTotal:invoiceForm1Data.subTotal,
        createdAt: new Date(),
      };
      console.log('====================================');
      console.log(invoiceFormData.invoiceNumber);
      console.log('====================================');
      await addDoc(
        collection(db, `organizations/${parsedOrgData.id}/invoices`),
        invoiceData
      );

      navigate('/dashboard/email', { state: { invoiceNumber: invoiceFormData.invoiceNumber } });

    } catch (error) {
      console.error("Error saving invoice: ", error);
    }
  };
  
  return (
    <div className="ml-52">

      <InvoiceForm onDataChange={(data) => setInvoiceFormData(data)} />
      <InvoiceTable onTableDataChange={(data) => setInvoiceTableData(data)} onForm1DataChange={(data) => setInvoiceForm1Data(data)} />
      <div className="flex space-x-4 mt-6 items-center h-14">
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md border border-gray-300 ml-6" onClick={handleDraft}>
          {t.saveDraft}
        </button>
        <button onClick={handleSave} className="bg-[#404dfb] text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
          {t.saveSend}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 5a1 1 0 00-1 1v4H5a1 1 0 000 2h4v4a1 1 0 102 0v-4h4a1 1 0 100-2h-4V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md border border-gray-300">
          {t.cancel}
        </button>
      </div>
    </div>
  );
};

export default Invoice;
