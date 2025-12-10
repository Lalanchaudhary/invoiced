import React, { useRef, useState } from 'react'
import "./coustmerform.css"
import { CiCircleQuestion } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { CiMobile1 } from "react-icons/ci";
import { FiUpload } from "react-icons/fi";
import { db, storage } from '../../firebase';
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FiFileText } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Loading from '../Loading';

const Form = ({ setFormView }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedValue, setSelectedValue] = useState("Business");
    const [address, setAddress] = useState(false);
    const [errors, setErrors] = useState({});
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState('');
    const [fulldata, setFulldata] = useState({
        salutation: '',
        firstName: '',
        lastName: '',
        companyName: '',
        displayName: '',
        currency: 'INR',
        email: '',
        workPhone: '',
        mobile: '',
        pan: '',
        paymentTerms: '',
        billingAttention: '',
        billingCountry: '',
        billingStreet1: '',
        billingStreet2: '',
        billingCity: '',
        billingState: '',
        billingPinCode: '',
        billingPhone: '',
        shippingAttention: '',
        shippingCountry: '',
        shippingStreet1: '',
        shippingStreet2: '',
        shippingCity: '',
        shippingState: '',
        shippingPinCode: '',
        shippingPhone: ''
    });

    // Language system
    const language = localStorage.getItem('selectedLanguage') || 'en';
    const translations = {
        en: {
            newCustomer: 'New Customer',
            fillDetails: 'Fill in the details below to add a new customer.',
            customerType: 'Customer Type',
            business: 'Business',
            individual: 'Individual',
            primaryContact: 'Primary Contact',
            salutation: 'Salutation',
            firstName: 'First Name',
            lastName: 'Last Name',
            companyName: 'Company Name',
            displayName: 'Display Name*',
            email: 'Email*',
            workPhone: 'Work Phone',
            mobile: 'Mobile',
            document: 'Document',
            uploadDocument: 'Upload Document',
            documentUploaded: 'Document uploaded successfully',
            save: 'Save',
            cancel: 'Cancel',
            selectSalutation: 'Salutation',
        },
        hi: {
            newCustomer: 'नया ग्राहक',
            fillDetails: 'नया ग्राहक जोड़ने के लिए नीचे विवरण भरें।',
            customerType: 'ग्राहक प्रकार',
            business: 'व्यवसाय',
            individual: 'व्यक्ति',
            primaryContact: 'प्राथमिक संपर्क',
            salutation: 'उपाधि',
            firstName: 'पहला नाम',
            lastName: 'अंतिम नाम',
            companyName: 'कंपनी का नाम',
            displayName: 'प्रदर्शित नाम*',
            email: 'ईमेल*',
            workPhone: 'कार्य फ़ोन',
            mobile: 'मोबाइल',
            document: 'दस्तावेज़',
            uploadDocument: 'दस्तावेज़ अपलोड करें',
            documentUploaded: 'दस्तावेज़ सफलतापूर्वक अपलोड हुआ',
            save: 'सहेजें',
            cancel: 'रद्द करें',
            selectSalutation: 'उपाधि',
        },
    };
    const t = translations[language];

    const validateForm = () => {
        const newErrors = {};
        
        // Required fields validation
        if (!fulldata.displayName) newErrors.displayName = 'Display Name is required';
        if (!fulldata.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(fulldata.email)) newErrors.email = 'Email is invalid';
        
        // Phone number validation
        if (fulldata.workPhone && !/^\d{10}$/.test(fulldata.workPhone)) 
            newErrors.workPhone = 'Work phone must be 10 digits';
        if (fulldata.mobile && !/^\d{10}$/.test(fulldata.mobile)) 
            newErrors.mobile = 'Mobile must be 10 digits';
        
        // PAN validation
        if (fulldata.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(fulldata.pan)) 
            newErrors.pan = 'PAN must be in valid format (e.g., ABCDE1234F)';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRadioChange = (value) => {
        setSelectedValue(value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFulldata(prev => ({ ...prev, [name]: value }));
        
        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('File size should be less than 5MB');
                return;
            }
            setFile(selectedFile);
            setLoading(true);
            try {
                const storageRef = ref(storage, `customer-documents/${selectedFile.name}`);
                await uploadBytes(storageRef, selectedFile);
                const url = await getDownloadURL(storageRef);
                setFileUrl(url);
                toast.success('File uploaded successfully');
            } catch (error) {
                toast.error('Error uploading file: ' + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const HandleSave = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        try {
            const orgData = await AsyncStorage.getItem('selectedOrganization');
            const parsedOrgData = orgData ? JSON.parse(orgData) : null;

            if (!parsedOrgData?.id) {
                toast.error('No valid organization selected!');
                return;
            }

            const customerData = {
                ...fulldata,
                customerType: selectedValue,
                createdAt: new Date(),
                documentUrl: fileUrl,
                status: 'Active'
            };

            await addDoc(
                collection(db, `organizations/${parsedOrgData.id}/customers`),
                customerData
            );

            toast.success('Customer added successfully!');
            navigate("/dashboard/customer");
        } catch (error) {
            toast.error('Error saving customer: ' + error.message);
            console.error("Error adding customer data: ", error);
        } finally {
            setLoading(false);
        }
    };

    const Inputref = useRef();

    const UploadImage = () => {
        Inputref.current.click();
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="relative bg-white shadow-2xl rounded-2xl p-10 w-full max-w-2xl border border-gray-100">
                <ToastContainer />
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                    onClick={() => setFormView(false)}
                    aria-label="Close form"
                >
                    <RxCross2 size={24} />
                </button>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t.newCustomer}</h2>
                <p className="text-gray-500 mb-6 text-sm">{t.fillDetails}</p>
                <div className="border-b border-gray-200 mb-6"></div>

                {/* Customer Type Selection */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-700">{t.customerType}</span>
                        <CiCircleQuestion className="text-gray-400" />
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                id="Business"
                                value="Business"
                                checked={selectedValue === "Business"}
                                onChange={() => handleRadioChange("Business")}
                                className="accent-blue-500"
                            />
                            <span>{t.business}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                id="Individual"
                                value="Individual"
                                checked={selectedValue === "Individual"}
                                onChange={() => handleRadioChange("Individual")}
                                className="accent-blue-500"
                            />
                            <span>{t.individual}</span>
                        </label>
                    </div>
                </div>

                {/* Primary Contact Information */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-700">{t.primaryContact}</span>
                        <CiCircleQuestion className="text-gray-400" />
                    </div>
                    <div className="flex gap-2">
                        <select
                            onChange={handleChange}
                            name='salutation'
                            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-500 font-light text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
                            value={fulldata.salutation}
                        >
                            <option value="">{t.selectSalutation}</option>
                            {[t.salutation, "Mr.", "Ms.", "Dr.", "Er."].map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                        <input
                            placeholder={t.firstName}
                            name='firstName'
                            onChange={handleChange}
                            className="rounded-lg w-32 px-3 py-2 text-sm font-light border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
                        />
                        <input
                            placeholder={t.lastName}
                            name='lastName'
                            onChange={handleChange}
                            className="rounded-lg w-32 px-3 py-2 text-sm font-light border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
                        />
                    </div>
                </div>

                {/* Company Name */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="companyName">{t.companyName}</label>
                    <input
                        id="companyName"
                        placeholder={t.companyName}
                        className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
                        name='companyName'
                        value={fulldata.companyName}
                        onChange={handleChange}
                    />
                </div>

                {/* Display Name */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="displayName">{t.displayName}</label>
                    <input
                        id="displayName"
                        placeholder={t.displayName}
                        className={`w-full rounded-lg border ${errors.displayName ? 'border-red-500' : 'border-gray-300'} py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none`}
                        value={fulldata.displayName}
                        name='displayName'
                        onChange={handleChange}
                    />
                    {errors.displayName && (
                        <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>
                    )}
                </div>

                {/* Contact Information */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="email">{t.email}</label>
                    <input
                        id="email"
                        placeholder={t.email}
                        className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none`}
                        value={fulldata.email}
                        name='email'
                        onChange={handleChange}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="workPhone">{t.workPhone}</label>
                    <input
                        id="workPhone"
                        placeholder={t.workPhone}
                        className={`w-full rounded-lg border ${errors.workPhone ? 'border-red-500' : 'border-gray-300'} py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none`}
                        value={fulldata.workPhone}
                        name='workPhone'
                        onChange={handleChange}
                    />
                    {errors.workPhone && (
                        <p className="text-red-500 text-xs mt-1">{errors.workPhone}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="mobile">{t.mobile}</label>
                    <input
                        id="mobile"
                        placeholder={t.mobile}
                        className={`w-full rounded-lg border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} py-2 px-4 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none`}
                        value={fulldata.mobile}
                        name='mobile'
                        onChange={handleChange}
                    />
                    {errors.mobile && (
                        <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                    )}
                </div>

                {/* Document Upload */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-1">{t.document}</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            ref={Inputref}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                        />
                        <button
                            onClick={UploadImage}
                            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors"
                        >
                            <FiUpload /> {t.uploadDocument}
                        </button>
                        {fileUrl && (
                            <span className="text-green-500 text-xs">{t.documentUploaded}</span>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end mt-8">
                    <button
                        onClick={HandleSave}
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-8 py-2 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        {t.save}
                    </button>
                    <button
                        type="button"
                        className="ml-4 flex items-center gap-2 text-gray-700 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-sm font-semibold px-8 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                        onClick={() => setFormView(false)}
                    >
                        {t.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Form;