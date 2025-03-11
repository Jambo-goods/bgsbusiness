
import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../components/admin/AdminLayout';
import EmailTest from '../components/admin/EmailTest';

export default function EmailTestPage() {
  return (
    <>
      <Helmet>
        <title>Test Email | Admin Dashboard</title>
      </Helmet>
      <AdminLayout>
        <EmailTest />
      </AdminLayout>
    </>
  );
}
