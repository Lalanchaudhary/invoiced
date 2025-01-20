import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Home from "./Home";
import Chart from "./charts/Chart";
import Item from "./item/Item";
import Loading from "./Loading"; // Import your loading component
import Customer from "./customer/MainCustomer";
import Customerform from "./customer/CustomerForm";
import Invoice from "./invoice/Invoice";
import MainData from "./invoice/MainData";
import BillPage from "./invoice/Bill";
import ItemForm from "./item/ItemForm";
import InvoiceSend from "./invoice/InvoiceSend";
import Logobill from "./invoice/LogoBill";
import Template3 from "./invoice/Template3";
import CustomerView from "./customer/CustomerView";
import Template2 from "./invoice/Template2";
import MainPage from "./expenses/MainPage";
import ExpanseForm from "./expenses/ExpanseForm";
import Main from "./Reports/Main";
import SalesByPerson from "./Reports/SalesByPerson";
import SalesByItem from "./Reports/SalesByItem";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation(); // Detect route changes

  // Trigger loading animation on route change
  useEffect(() => {
    setLoading(true); // Start loading
    const timer = setTimeout(() => {
      setLoading(false); // Stop loading after delay
    }, 900);

    // Cleanup the timeout to prevent memory leaks
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="flex">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-white">
        {loading ? (
          // Display Loading component during route change
          <Loading />
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="analytics" element={<Chart />} />
            <Route path="invoice" element={<MainData />} />
            <Route path="invoiceform" element={<Invoice />} />
            <Route path="reports" element={<Main />} />
            <Route path="/reports/sales-by-customer" element={<SalesByPerson />} />
            <Route path="/reports/sales-by-item" element={<SalesByItem/>} />

            <Route path="product" element={<Item />} />
            <Route path="customer" element={<Customer />} />
            <Route path="customerform" element={<Customerform />} />
            <Route path="/expenses" element={<MainPage />} />
            <Route path="/expensesform" element={<ExpanseForm />} />
            <Route path="/bill/:id" element={<BillPage />} />
            <Route path="/logobill/:id" element={<Logobill />} />
            <Route path="/template2/:id" element={<Template2 />} />
            <Route path="/template3/:id" element={<Template3 />} />
            <Route path="/customerView/:id" element={<CustomerView />} />
            <Route path="/item" element={<ItemForm />} />
            <Route path="/email" element={<InvoiceSend />} />
          </Routes>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
