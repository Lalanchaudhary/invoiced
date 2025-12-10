import React, { useState } from 'react';
import { CiCircleQuestion } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { db } from '../../firebase'; // Firebase setup
import { collection, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useNavigate } from 'react-router-dom';

const ItemForm = ({ setFormView, addItem }) => {
  const navigate=useNavigate();
  const [selectedValue, setSelectedValue] = useState("option1");
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('');

  const options = ["box", "cm", "M", "Km", "g", "Kg", "mg", "Ft", "ml", "L", "pcs"];

  const handleRadioChange = (value) => setSelectedValue(value);

  const onOptionChangeHandler = (event) => setUnit(event.target.value);

  const handleSave = async () => {
    try {
        // Retrieve the organization data from AsyncStorage
        const orgData = await AsyncStorage.getItem('selectedOrganization');
        const parsedOrgData = orgData ? JSON.parse(orgData) : null;

        if (!parsedOrgData || !parsedOrgData.id) {
            alert("No valid organization selected!");
            return;
        }

        const itemData = {
            type: selectedValue,
            unit,
            name,
            price,
            description,
            createdAt: new Date(),
        };

        // Save product to Firestore under the correct organization
        await addDoc(
            collection(db, `organizations/${parsedOrgData.id}/products`),
            itemData
        );

        // Call the function to add the item to the state in Item.js
        addItem(itemData);
        setFormView(false);
    } catch (error) {
        console.error("Error adding item: ", error);
    }
    navigate("/dashboard/product")

};

  // Language system
  const language = localStorage.getItem('selectedLanguage') || 'en';
  const translations = {
    en: {
      newItem: 'New Item',
      fillDetails: 'Fill in the details below to add a new product or service.',
      type: 'Type',
      goods: 'Goods',
      service: 'Service',
      name: 'Name*',
      namePlaceholder: 'Enter item name',
      unit: 'Unit',
      price: 'Price*',
      pricePlaceholder: 'Enter price',
      description: 'Description*',
      descriptionPlaceholder: 'Describe the item',
      save: 'Save',
      cancel: 'Cancel',
      selectUnit: 'Select unit',
    },
    hi: {
      newItem: 'नया आइटम',
      fillDetails: 'नया उत्पाद या सेवा जोड़ने के लिए नीचे विवरण भरें।',
      type: 'प्रकार',
      goods: 'सामान',
      service: 'सेवा',
      name: 'नाम*',
      namePlaceholder: 'आइटम का नाम दर्ज करें',
      unit: 'इकाई',
      price: 'मूल्य*',
      pricePlaceholder: 'मूल्य दर्ज करें',
      description: 'विवरण*',
      descriptionPlaceholder: 'आइटम का विवरण लिखें',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      selectUnit: 'इकाई चुनें',
    },
  };
  const t = translations[language];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="relative bg-white shadow-2xl rounded-2xl p-10 w-full max-w-lg border border-gray-100">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
          onClick={() => setFormView(false)}
          aria-label="Close form"
        >
          <RxCross2 size={24} />
        </button>
        <h2 className="font-semibold text-2xl mb-2 text-gray-800">{t.newItem}</h2>
        <p className="text-gray-500 mb-6 text-sm">{t.fillDetails}</p>
        <div className="border-b border-gray-200 mb-6"></div>

        {/* Type Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-700">{t.type}</span>
            <CiCircleQuestion className="text-gray-400" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                id="Goods"
                value="Goods"
                checked={selectedValue === "Goods"}
                onChange={() => handleRadioChange("Goods")}
                className="accent-blue-500"
              />
              <span>{t.goods}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                id="Service"
                value="Service"
                checked={selectedValue === "Service"}
                onChange={() => handleRadioChange("Service")}
                className="accent-blue-500"
              />
              <span>{t.service}</span>
            </label>
          </div>
        </div>

        {/* Name Section */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1" htmlFor="itemName">{t.name}</label>
          <input
            id="itemName"
            placeholder={t.namePlaceholder}
            className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Unit Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-700 font-medium">{t.unit}</span>
            <CiCircleQuestion className="text-gray-400" />
          </div>
          <select
            onChange={onOptionChangeHandler}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
            value={unit}
          >
            <option value="" disabled>{t.selectUnit}</option>
            {options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Price Section */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1" htmlFor="itemPrice">{t.price}</label>
          <input
            id="itemPrice"
            type="number"
            placeholder={t.pricePlaceholder}
            className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
          />
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1" htmlFor="itemDescription">{t.description}</label>
          <textarea
            id="itemDescription"
            placeholder={t.descriptionPlaceholder}
            className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none resize-none min-h-[80px]"
            value={description}
            name="shippingStreet1"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-6 py-2 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
            onClick={handleSave}
          >
            {t.save}
          </button>
          <button
            className="flex items-center gap-2 text-gray-700 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-sm font-semibold px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            onClick={() => setFormView(false)}
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;
