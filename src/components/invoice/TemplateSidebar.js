import React from 'react'
import template2 from '../../assets/template2.jpg'
import template3 from '../../assets/template3.jpg'
import template4 from '../../assets/template4.png'
import template5 from '../../assets/template5.jpg'
import logo from '../../assets/logo.png';
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from 'react-router-dom'
const TemplateSidebar = ({setRightSidebarshow , id}) => {
  const navigate=useNavigate();
  return (
    <div className='h-screen w-96 border-2 fixed top-0 right-0 z-99 bg-white p-4'>
        <div className='flex item-center justify-between'>
      <h1 className='text-xl font-bold'>Choose your template</h1>
      <AiOutlineClose onClick={()=>{setRightSidebarshow(false)}} />
      </div>
      <div className='flex gap-4 m-4 justify-center flex-wrap mt-8'>
      <img src={template2} className='h-52 border-2' onClick={()=>{navigate(`/dashboard/logobill/${id}`)}} />
      <img src={template3} className='h-52 border-2' onClick={()=>{navigate(`/dashboard/template3/${id}`)}} />
       <img src={template4} className='h-52 border-2' onClick={()=>{navigate(`/dashboard/template2/${id}`)}} />
      <img src={template5} className='h-52 border-2' onClick={()=>{navigate(`/dashboard/template4/${id}`)}} /> 
      </div>
      <div className="m-6 flex items-center justify-center mt-24">
        <img
          src={logo}
          alt="Profile"
          className="rounded-full h-36 w-36 mb-1"
        />
        <h2 className="font-bold text-black text-[40px] ">INVOICED</h2>
      </div>
    </div>
  )
}

export default TemplateSidebar
