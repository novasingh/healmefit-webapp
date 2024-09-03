import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MasterLayout = ({ children }) => {
  return (
    <main style={{display: 'flex', width: '100%', height: '100%'}}>
      <aside>
        <Sidebar />
      </aside>
      <section style={{width: '100%', padding: '2rem', overflowY : 'auto'}}>
        <Header/>
        {children}</section>
    </main>
  );
};

export default MasterLayout;
