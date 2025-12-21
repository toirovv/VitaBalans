import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import MobileNav from './MobileNav'
import Breadcrumb from './Breadcrumb'

function Layout() {
  return (
    <div>
      <Header />
      <Breadcrumb />
      <Outlet />
      <Footer />
      <MobileNav />
    </div>
  )
}

export default Layout
