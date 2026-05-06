import { useEffect } from 'react'

import { Route, Routes, useNavigate } from 'react-router'
import Login from '../features/auth/pages/Login.jsx'
import Register from '../features/auth/pages/Register.jsx'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '../features/auth/hook/useAuth.js'
import CreateProduct from '../features/products/pages/CreateProduct.jsx'
import Home from '../features/products/pages/Home.jsx'
import SellerDashboard from '../features/products/pages/Dashboard.jsx'
import Protected from '../features/products/component/Protected.jsx'
import ProductDetail from '../features/products/pages/ProductDetail.jsx'
import SellerProductEdit from '../features/products/pages/SellerProductEdit.jsx'
import ViewCarts from '../features/carts/pages/ViewCarts.jsx'
import AmountForm from '../features/esewa/pages/AmountForm.jsx'
import PaymentSuccess from '../features/esewa/pages/PaymentSuccess.jsx'
import PaymentFailure from '../features/esewa/pages/PaymentFailure.jsx'
import Orders from '../features/esewa/pages/Orders.jsx'
import UserProtected from '../features/products/component/UserProtected.jsx'


function App() {
  const { handeluser } = useAuth()
  const navigate = useNavigate();
  const fetchUser = async () => {
    try {
      const res = await handeluser()
      if (!res) {
        navigate('/')
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    fetchUser()
  }, [])


  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/product/:productId' element={<ProductDetail />} />
        <Route path='/create' element={<Protected><CreateProduct /></Protected>} />
        <Route path='/dashboard' element={<Protected><SellerDashboard /></Protected>} />
        <Route path='/edit/:productId' element={<Protected><SellerProductEdit /></Protected>} />
        <Route path='/cart' element={<UserProtected><ViewCarts /></UserProtected>} />
        <Route path='/pay/:variantId/:productId' element={<UserProtected><AmountForm /></UserProtected>} />
        <Route path="/success" element={<UserProtected><PaymentSuccess /></UserProtected>} />
        <Route path="/failure" element={<UserProtected><PaymentFailure /></UserProtected>} />
        <Route path="/orders" element={<UserProtected><Orders /></UserProtected>} />
      </Routes>
    </>
  )
}

export default App
