import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
function InvoiceForm({ onDataChange, onAddCustomer }) {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-000001');
  const [terms, setTerms] = useState('Due On Receipt');
  const [dueDate, setDueDate] = useState('');
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();
  // Fetch invoices from Firestore
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const orgData = localStorage.getItem('selectedOrganization');
        const parsedOrgData = orgData ? JSON.parse(orgData) : null;

        if (!parsedOrgData || !parsedOrgData.id) {
          alert("No valid organization selected!");
          return;
        }

        const q = query(
          collection(db, `organizations/${parsedOrgData.id}/invoices`)
        );
        const querySnapshot = await getDocs(q);
        const fetchedInvoices = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInvoices(fetchedInvoices);
      } catch (error) {
        console.error("Error fetching invoices: ", error);
      }
    };

    fetchInvoices();
  }, []);
  const fetchData = async () => {
    try {
      const orgData = await AsyncStorage.getItem('selectedOrganization');
      const parsedOrgData = orgData ? JSON.parse(orgData) : null;

      if (!parsedOrgData || !parsedOrgData.id) {
        console.error('No valid organization selected!');
        return;
      }

      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, `organizations/${parsedOrgData.id}/customers`));

      // Map customer data into options with full data stored
      const data = querySnapshot.docs.map((doc) => {
        const customer = doc.data();
        return {
          value: doc.id,
          label: customer.displayName || 'Unnamed Customer',
          fullData: {
            id: doc.id,
            salutation: customer.salutation,
            firstName: customer.firstName,
            lastName: customer.lastName,
            companyName: customer.companyName,
            displayName: customer.displayName,
            currency: customer.currency,
            email: customer.email,
            workPhone: customer.workPhone,
            mobile: customer.mobile,
            pan: customer.pan,
            paymentTerms: customer.paymentTerms,
            billingAttention: customer.billingAttention,
            billingCountry: customer.billingCountry,
            billingStreet1: customer.billingStreet1,
            billingStreet2: customer.billingStreet2,
            billingCity: customer.billingCity,
            billingState: customer.billingState,
            billingPinCode: customer.billingPinCode,
            billingPhone: customer.billingPhone,
            shippingAttention: customer.shippingAttention,
            shippingCountry: customer.shippingCountry,
            shippingStreet1: customer.shippingStreet1,
            shippingStreet2: customer.shippingStreet2,
            shippingCity: customer.shippingCity,
            shippingState: customer.shippingState,
            shippingPinCode: customer.shippingPinCode,
            shippingPhone: customer.shippingPhone
          },
        };
      });

      setCustomerOptions(data);
    } catch (error) {
      console.error('Error fetching customers: ', error);
    }
  };

  // Function to calculate due date based on invoice date and terms
  const calculateDueDate = (invoiceDate, terms) => {
    if (!invoiceDate) return;

    const date = new Date(invoiceDate);
    let dueDate;

    switch (terms) {
      case 'Net 15':
        dueDate = new Date(date.setDate(date.getDate() + 15));
        break;
      case 'Net 30':
        dueDate = new Date(date.setDate(date.getDate() + 30));
        break;
      case 'Net 45':
        dueDate = new Date(date.setDate(date.getDate() + 45));
        break;
      default:
        dueDate = date;
        break;
    }

    // Set the due date to the state
    setDueDate(dueDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Calculate due date whenever invoice date or terms change
    calculateDueDate(invoiceDate, terms);
  }, [invoiceDate, terms]);

  useEffect(() => {
    // Pass the full customer data to parent when customer or other fields change
    onDataChange({
      customer: selectedCustomer?.fullData || null,
      invoiceNumber:`00000${invoices.length+1}`,
      invoiceDate,
      terms,
      dueDate,
    });
  // Add invoices.length to the dependency array
  }, [selectedCustomer, invoiceNumber, invoiceDate, terms, dueDate, onDataChange, invoices.length]);

  // Language system
  const language = localStorage.getItem('selectedLanguage') || 'en';
  const translations = {
    en: {
      customerName: 'Customer Name*',
      addNewCustomer: '+ Add New Customer',
      invoiceNumber: 'Invoice#*',
      invoiceDate: 'Invoice Date*',
      terms: 'Terms',
      dueDate: 'Due Date',
      paid: 'Paid',
      net15: '15 Days',
      net30: '30 Days',
      net45: '45 Days',
      net60: '60 Days',
      addTerms: 'Add Terms and Conditions',
      selectOrAdd: 'Select or add a customer',
    },
    hi: {
      customerName: 'ग्राहक का नाम*',
      addNewCustomer: '+ नया ग्राहक जोड़ें',
      invoiceNumber: 'चालान संख्या*',
      invoiceDate: 'चालान तिथि*',
      terms: 'शर्तें',
      dueDate: 'नियत तिथि',
      paid: 'भुगतान किया गया',
      net15: 'नेट 15',
      net30: 'नेट 30',
      net45: 'नेट 45',
      selectOrAdd: 'ग्राहक चुनें या जोड़ें',
    },
  };
  const t = translations[language];

  return (
    <div className="p-6 bg-white rounded-lg  w-full mx-auto">
      <div className="mb-4">
        <label className="block text-red-500 font-semibold text-sm mb-1">{t.customerName}</label>
        <Select
          options={customerOptions}
          value={customerOptions.find((option) => option.value === selectedCustomer?.id)}
          onChange={(selectedOption) => setSelectedCustomer(selectedOption)}
          placeholder={t.selectOrAdd}
          className="w-full text-sm"
        />
        <button
          type="button"
          className="mt-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded border border-blue-200 transition-colors"
          onClick={() => navigate("/dashboard/customerform")}
        >
          {t.addNewCustomer}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-red-500 font-semibold text-sm mb-1">{t.invoiceNumber}</label>
          <input
            type="text"
            value={`INV-00000${invoices.length + 1}`}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-red-500 font-semibold text-sm mb-1">{t.invoiceDate}</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-gray-500 text-sm mb-2">{t.terms}</label>
          <select
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>{t.paid}</option>
            <option>{t.net15}</option>
            <option>{t.net30}</option>
            <option>{t.net45}</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-sm text-gray-500 mb-2">{t.dueDate}</label>
          <input
            type="date"
            value={dueDate}
            readOnly
            className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export default InvoiceForm;
