import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Logobill.css'
import Navbar from '../Navbar';
import logo from '../../assets/logo123.png'
import TemplateSidebar from './TemplateSidebar';
import { GrEdit } from "react-icons/gr";
import { IoMdPrint } from "react-icons/io";
import { FaRegShareSquare } from "react-icons/fa";
const Logobill = () => {
  const { id } = useParams();
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [rightSidebarshow,setRightSidebarshow]=useState(false);
  const [selectedOrg,setSelectedOrg]=useState(null);
      const navigate=useNavigate();
  useEffect(() => {
    const fetchBillData = async () => {
      try {
        const orgData = await AsyncStorage.getItem('selectedOrganization');
        const parsedOrgData = orgData ? JSON.parse(orgData) : null;

        if (!parsedOrgData || !parsedOrgData.id) {
          alert('No valid organization selected!');
          setLoading(false);
          return;
        }

        const docRef = doc(db, `organizations/${parsedOrgData.id}/invoices`, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const billData = docSnap.data();
          setBillData(billData);

          const q = query(
            collection(db, `organizations/${parsedOrgData.id}/invoices`)
          );
          const querySnapshot = await getDocs(q);

          const fetchedInvoices = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setInvoices(fetchedInvoices);

          const filteredInvoices = fetchedInvoices.filter(invoice =>
            invoice.customer.id === billData.customer.id
          );
          setCustomerInvoices(filteredInvoices);
        } else {
          alert('No such invoice found!');
        }
      } catch (error) {
        console.error('Error fetching bill data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillData();
  }, [id]);

  useEffect(() => {
    const loadSelectedOrg = async () => {
      try {
        const savedOrg = await AsyncStorage.getItem('selectedOrganization');
        if (savedOrg) {
          console.log('====================================');
          console.log(savedOrg);
          console.log('====================================');
          setSelectedOrg(JSON.parse(savedOrg));
        }
      } catch (error) {
        console.error('Failed to load organization from AsyncStorage:', error);
      }
    };

    loadSelectedOrg();
  }, [setSelectedOrg]);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!billData) return <div className="text-center mt-8">No data available.</div>;

  const { invoiceNumber, customer, items, total, createdAt } = billData;

  console.log('====================================');
  console.log(customerInvoices);
  console.log('====================================');
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Helvetica',
    },
    titleView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 10,
      borderBottomWidth: 1
    },
    logo: {
      width: 150
    },
    title: {
      fontSize: 40,
      marginBottom: 20,
      fontWeight: 'bold',
      color: '#3871c1'
    },
    invoiceDetails: {
      fontSize: 10,
      marginBottom: 10,
    },
    billTo: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    table: {
      display: 'flex',
      width: '100%',
      marginVertical: 20,
    },
    tableRow: {
      flexDirection: 'row',
      backgroundColor: '#3871c1'
    },
    tableColHeader: {
      fontSize: 10,
      borderRightWidth: 0.5,
      padding: 5,
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#fff'
    },
    tableRow1: {
      flexDirection: 'row',
    },
    tableColHeader1: {
      fontSize: 10,
      borderColor: '#bedef1',
      borderRightWidth: 1,
      padding: 5,
      textAlign: 'center'
    },
    tableColHeader2: {
      fontSize: 10,
      borderColor: '#bedef1',
      borderRightWidth: 1,
      padding: 5,
      textAlign: 'center',
    },
    tableCol: {
      width: '33%',
    },
    footer: {
      position: 'absolute',
      bottom: 20,
      width: '100%'
    },
    subtotalHeadRow: {

    },
    subtotalRow: {
      width: 150,
      flexDirection: 'row',
      // borderBottomWidth: 0.4,
      paddingBottom: 5,
      justifyContent: 'space-around',
      marginTop: 7,
      marginLeft: 50
    },
    subtotalRow1: {
      width: 200,
      flexDirection: 'row',
      // borderBottomWidth: 0.4,
      justifyContent: 'space-around',
      marginTop: 7,
      fontWeight: 'bold',
      backgroundColor: '#3871c1',
      padding: 2
    },
    footerInner: {
      width: '88%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: 10,
      padding: 10,
      paddingBottom: 0
    },
    bold: {
      fontWeight: 'bold',
    },
  });

  // Invoice PDF Component
  const Invoice = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Invoice Title */}
        <View style={styles.titleView}>
          <Image src={logo} style={styles.logo} />
          <Text style={styles.title}>Invoice</Text>
        </View>
        {/* Bill To */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
          <View>
            <Text style={styles.billTo}>Bill To:</Text>
            <Text style={{ fontSize: 16, marginVertical: 5, fontWeight: 'bold' }}>Mr. {billData.customer.displayName}</Text>
            <Text style={{ fontSize: 10, marginVertical: 2 }}>{billData.customer.mobile}</Text>
            <Text style={{ fontSize: 10, marginVertical: 2 }}>{billData.customer.email}</Text>
          </View>
          <View>
            <Text style={[styles.invoiceDetails, { fontSize: 14, fontWeight: 'bold' }]}>Invoice No. INV-{billData.invoiceNumber}</Text>
            <Text style={[styles.invoiceDetails]}>{billData.invoiceDate}</Text>
          </View>
        </View>
        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, { width: '5%' }]}>#</Text>
            <Text style={[styles.tableColHeader, { width: '25%' }]}>Item</Text>
            <Text style={[styles.tableColHeader, { width: '35%' }]}>Description</Text>
            <Text style={[styles.tableColHeader, { width: '10%' }]}>Qty</Text>
            <Text style={[styles.tableColHeader, { width: '10%' }]}>rate</Text>
            <Text style={[styles.tableColHeader, { width: '15%' }]}>Amount</Text>
          </View>

            {
              billData.items.map((item, idx) => {
                return (
                  <>{
                    idx !== items.length - 1 ? 
                  <View style={[styles.tableRow1,{backgroundColor: idx % 2===0?'#fff':'#bedef1'}]}  >
                  <Text style={[styles.tableColHeader2, { width: '5%', }]}>{idx + 1}</Text>
                  <Text style={[styles.tableColHeader2, { width: '25%' }]}>{item.itemDetails}</Text>
                  <Text style={[styles.tableColHeader2, { width: '35%' }]}>{item.itemDetails}</Text>
                  <Text style={[styles.tableColHeader2, { width: '10%' }]}>{item.quantity}</Text>
                  <Text style={[styles.tableColHeader2, { width: '10%' }]}>{item.rate}</Text>
                  <Text style={[styles.tableColHeader2, { width: '15%' }]}>{item.amount}</Text>
                </View>:''
                }</>
                )
              })
            }

        </View>



        {/* Subtotal and Totals */}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 10 }}>Thanks for your buisness</Text>
          <View style={styles.subtotalHeadRow}>
            <View style={styles.subtotalRow}>
              <Text style={{ fontSize: 10 }}>Sub Total</Text>
              <Text style={{ fontSize: 10 }}>{billData.subTotal}</Text>
            </View>
            <View style={styles.subtotalRow}>
              <Text style={{ fontSize: 10 }}>Discount ({billData.discount}%)</Text>
              <Text style={{ fontSize: 10 }}>{billData.DiscPrice}</Text>
            </View>
            <View style={styles.subtotalRow}>
              <Text style={{ fontSize: 10 }}>Tax ({billData.taxRate}%)</Text>
              <Text style={{ fontSize: 10 }}>{billData.TaxPrice}</Text>
            </View>
            <View style={styles.subtotalRow1}>
              <Text style={{ fontSize: 15, color: '#fff' }}>Grand Total</Text>
              <Text style={{ fontSize: 15, color: '#fff' }}>Rs. {billData.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginTop: 20 }}>
              <Text style={styles.bold}>Authorized Signature</Text>
              <View style={{ height: 1, width: 120, backgroundColor: '#000' }}></View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );


  return (
    <div className='ml-52'>
      <Navbar />
      <div className='flex'>
        <div className='left_bar border w-80 '>
          {
            customerInvoices.map(customer => {
              return (
                <div className='border p-2 m-2 my-4' onClick={()=>{navigate(`/dashboard/logobill/${customer.id}`)}}>
                  <div className='flex justify-between'>
                    <p className='text-blue-500'>Mr. {customer.customer.displayName}</p>
                    <p>₹ {customer.total.toFixed(2)}</p>
                  </div>
                  <div className='flex gap-6 font-light text-sm'>
                    <p>INV-{customer.invoiceNumber}</p>
                    <p>{customer.invoiceDate}</p>
                  </div>
                  <p>Net 15</p>
                </div>
              )
            })
          }


        </div>
        <div>
          <div className='p-4 text-lg font-semibold'>INV-{billData.invoiceNumber}</div>
          <div className='flex w-full border bg-gray-200'>
            <p className='inline border-r border-gray-400 p-2 px-4 cursor-pointer'> <span ><GrEdit className='inline' /></span> Edit</p>
            <p className='inline border-r border-gray-400  p-2 px-4'> <IoMdPrint className='inline' />                 <PDFDownloadLink document={<Invoice />} fileName="invoice.pdf">
                  {({ loading }) => (loading ? 'Loading document...' : 'Print')}
                </PDFDownloadLink></p>
            <p className='inline border-r border-gray-400  p-2 px-4'> <FaRegShareSquare className='inline' /> Share</p>
          </div>
        <div style={{ marginLeft: 50 }}>
        <div className='page12' >
          {/* Invoice Title */}
          <div className='titlediv12' >
            <div>
              <img src={selectedOrg.logo} className='logo12' />
            </div>
            <p className='title12' >Invoice</p>
          </div>
          {/* Bill To */}
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
            <div>
              <p className='billTo12'>Bill To: </p>
              <p style={{ fontSize: 16, marginVertical: 5, fontWeight: 'bold' }}>Mr. {billData.customer.displayName}</p>
              <p style={{ fontSize: 12, marginVertical: 5 }}>+91 8235570955</p>
              <p style={{ fontSize: 12, marginVertical: 5 }}>lalan28@gmail.com</p>
            </div>
            <div>
              <p className='invoiceDetails12' style={{ fontSize: 14, fontWeight: 'bold' }}>Invoice No. INV-{billData.invoiceNumber}</p>
              <p className='invoiceDetails12'   >{billData.invoiceDate}</p>
            </div>
          </div>
          {/* Table */}
          <div className='table12'>
            <div className='tableRow12'>
              <p className='tableColHeader12' style={{ width: '5%' }}>#</p>
              <p className='tableColHeader12' style={{ width: '25%' }}>Item</p>
              <p className='tableColHeader12' style={{ width: '35%' }}>Description</p>
              <p className='tableColHeader12' style={{ width: '10%' }}>Qty</p>
              <p className='tableColHeader12' style={{ width: '10%' }}>rate</p>
              <p className='tableColHeader12' style={{ width: '15%' }}>Amount</p>
            </div>
                        {
                          billData.items.map((item,idx) => {
                            return (<>
                              {
                                idx !== items.length - 1 ? 
                              <div className='tableRow112' style={{backgroundColor: idx % 2===0?'#fff':'#bedef1'}} >
                              <p className='tableColHeader112' style={{ width: '5%', }}>{idx + 1}</p>
                              <p className='tableColHeader112' style={{ width: '25%' }}>{item.itemDetails}</p>
                              <p className='tableColHeader112' style={{ width: '35%' }}>{item.itemDetails}</p>
                              <p className='tableColHeader112' style={{ width: '10%' }}>{item.quantity}</p>
                              <p className='tableColHeader112' style={{ width: '10%' }}>{item.rate}</p>
                              <p className='tableColHeader112' style={{ width: '15%' }}>{item.amount}</p>
                            </div>:''
                              }
                              </>
                            )
                          })
                        }

          </div>



          {/* Subtotal and Totals */}

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <p style={{ fontSize: 14 }}>Thanks for your buisness</p>
            <div className='subtotalHeadRow12' >
              <div className='subtotalRow12'>
                <p style={{ fontSize: 12 }}>Sub Total</p>
                <p style={{ fontSize: 12 }}>{billData.subTotal}</p>
              </div>
              <div className='subtotalRow12' >
                <p style={{ fontSize: 12 }}>Discount ({billData.discount}%)</p>
                <p style={{ fontSize: 12 }}>{billData.DiscPrice}</p>
              </div>
              <div className='subtotalRow12' >
                <p style={{ fontSize: 12 }}>Tax ({billData.taxRate}%)</p>
                <p style={{ fontSize: 12 }}>{billData.TaxPrice}</p>
              </div>
              <div className='subtotalRow112' >
                <p style={{ fontSize: 15, color: '#fff' }}>Grand Total</p>
                <p style={{ fontSize: 15, color: '#fff' }}>₹ {billData.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className='footer12'>
            <div className='footerInner12'>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginTop: 20 }}>
                <p className='bold12' >Authorized Signature</p>
                <div style={{ height: 1, width: 120, backgroundColor: '#000' }}></div>
              </div>
            </div>
          </div>
          <button className='button-83'>
            <PDFDownloadLink document={<Invoice />} fileName="invoice.pdf">
              {({ loading }) => (loading ? 'Loading document...' : 'Download now!')}
            </PDFDownloadLink>
          </button>
        </div>
        <div className='mb-4'>
          <button className='text-blue-600' onClick={()=>{setRightSidebarshow(true)}}>Change Layout</button>
        </div>
        </div>
        </div>
      </div>
      {
        rightSidebarshow &&  <TemplateSidebar setRightSidebarshow={setRightSidebarshow} />
      }
    </div>
  );
};

export default Logobill;
